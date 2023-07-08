import { getEmbeddingFromText } from '@/scripts/embeddings'
import { supabase } from '@/scripts/supabase'
import { HttpStatusCode } from 'axios'
import GPT3Tokenizer from 'gpt3-tokenizer'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'
import type { ChatCompletionRequestMessage } from 'openai'
import { Configuration, OpenAIApi } from 'openai'
import { codeBlock, oneLine } from 'common-tags'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'

type Data = {
  conversationHistory: Message[]
  usedConversations: Message[]
  context: string
}

const config = new Configuration({
  apiKey: process.env.OPENAI_KEY,
})

const openai = new OpenAIApi(config)

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { conversationId, query, tag } = req.body
  const tags = [tag] // TODO: temp for debug

  const sanitizedQuery = query.trim()

  moderateQuery(sanitizedQuery)

  const queryEmbedding = await getEmbeddingFromText(sanitizedQuery)

  // Initialize GPT3 Tokenizer to count number of tokens in text
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
  let tokenCount = 0

  // Get context and conversation history
  const context = await getContext(queryEmbedding, tokenizer, tokenCount, tags)
  const relevantConversationHistory = await getRelevantConversationHistory(
    conversationId,
    queryEmbedding
  )
  const relevantConversationHistoryText =
    convertRelevantConversationHistoryToText(
      relevantConversationHistory,
      tokenizer,
      tokenCount
    )

  // Construct messages based on query, prompt, context, and conversation history
  const messages = createMessagesWithPrompt(
    sanitizedQuery,
    context,
    relevantConversationHistoryText
  )

  // Send to chatgpt api to get response
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    max_tokens: 1024,
    temperature: 0,
  })

  if (response.status !== 200) {
    throw new Error('Failed to complete')
  }

  // Deconstruct response
  const aiResponse = response.data.choices[0]
  const aiMessage = aiResponse.message
  const aiMessageContent = aiMessage?.content?.toString()

  if (!aiMessageContent) {
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      'No response message content from ai'
    )
  }

  // Get embedding of ai response
  const aiMessageEmbedding = await getEmbeddingFromText(aiMessageContent)

  // Update conversation history in DB to include latest AI/User message
  const recentMessages = [
    {
      content: `user: ${query}`,
      embedding: queryEmbedding,
    },
    {
      content: `assistant: ${aiMessageContent}`,
      embedding: aiMessageEmbedding,
    },
  ]
  await updateDBConversationMessages(conversationId, recentMessages)

  const { error: fetchConversationHistoryError, data: conversationHistory } =
    await supabase
      .from('message')
      .select('created_at, content, embedding')
      .filter('conversation_id', 'eq', conversationId)
      .order('created_at')

  if (fetchConversationHistoryError) {
    throw fetchConversationHistoryError
  }

  res.status(200).json({
    conversationHistory,
    usedConversations: relevantConversationHistory,
    context,
  })
}

const moderateQuery = async (sanitizedQuery: string) => {
  const moderationResponse = await openai.createModeration({
    input: sanitizedQuery,
  })

  const [results] = moderationResponse.data.results

  if (results.flagged) {
    return {
      error: 'flagged content',
      flagged: true,
      categories: results.categories,
    }
  }
}

const getContext = async (
  embedding: Embedding,
  tokenizer: GPT3Tokenizer,
  tokenCount: number,
  tags: string[]
): Promise<string> => {
  const { error: matchError, data: pageSections } = await supabase.rpc(
    'match_page_sections',
    {
      tags,
      embedding,
      match_threshold: 0.3,
      match_count: 10,
      min_content_length: 50,
    }
  )

  if (matchError) {
    console.log(matchError.message)
    throw matchError
  }

  // Add relevant page sections to context
  let contextText = ''
  for (let i = 0; i < pageSections.length; i++) {
    const pageSection = pageSections[i]
    const content = pageSection.content
    const encoded = tokenizer.encode(content)
    tokenCount += encoded.text.length

    if (tokenCount >= 1500) {
      break
    }

    contextText += `${content.trim()}\n==IGNORE==Similarity Score: ${
      pageSection.similarity
    }==/IGNORE==\n---\n`
  }
  return contextText
}

const getRelevantConversationHistory = async (
  conversation_id: number,
  embedding: Embedding
): Promise<Message[]> => {
  const { error: matchMessagesError, data: pastMessages } = await supabase.rpc(
    'match_messages_in_conversation',
    {
      conversation_id,
      embedding,
      recent_cutoff: 10,
      match_threshold: 0.3,
      match_count: 10,
      min_content_length: 0,
    }
  )

  if (matchMessagesError) {
    throw matchMessagesError
  }
  return pastMessages
}

const convertRelevantConversationHistoryToText = (
  pastMessages: Message[],
  tokenizer: GPT3Tokenizer,
  tokenCount: number
) => {
  let conversationText = ''
  for (let i = 0; i < pastMessages.length; i++) {
    const message = pastMessages[i]
    const content = message.content
    const encoded = tokenizer.encode(content)
    tokenCount += encoded.text.length

    if (tokenCount >= 1500) {
      break
    }

    conversationText += `${content.trim()}\n==IGNORE==Similarity Score: ${
      message.similarity
    }==/IGNORE==\n---\n`
  }

  return conversationText
}

const createMessagesWithPrompt = (
  sanitizedQuery: string,
  context: string,
  conversationHistoryText: string
): ChatCompletionRequestMessage[] => {
  return [
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: codeBlock`
          ${oneLine`
            You are a very enthusiastic personal AI who loves
            to help people! Given the following information from
            the personal documentation and conversation history, 
						answer the user's question using only that information, 
						outputted in markdown format.
          `}

					${oneLine`
						In the conversation history, lines that start with 
						"assistant:" refers to you, the personal AI, and 
						lines that start with "user:" refers to me, the 
						person sending messages and asking questions to the personal AI.
					`}

          ${oneLine`
            If you are unsure
            and the answer is not explicitly written in the documentation 
						or conversation history, say "Sorry, I don't know how to 
						help with that."
          `}
          
          ${oneLine`
            Always include related code snippets if available.
          `}
        `,
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: codeBlock`
          Here is my personal documentation:
          ${context}
        `,
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: codeBlock`
					Here is the conversation history with you so far:
          ${conversationHistoryText}
        `,
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: codeBlock`
          ${oneLine`
            Answer my next question using only the above documentation and conversation history.
            You must also follow the below rules when answering:
          `}
          ${oneLine`
            - Do not make up answers that are not provided in the documentation.
          `}
					${oneLine`
            - You can use messages in conversation history as context to answer my next question.
          `}
					${oneLine`
						Ignore the text between ==IGNORE== and ==/IGNORE== in the personal documentation and conversation history.
					`}
          ${oneLine`
            - If you are unsure and the answer is not explicitly written
            in the documentation context, say
            "Sorry, I don't know how to help with that."
          `}
          ${oneLine`
            - Prefer splitting your response into multiple paragraphs.
          `}
          ${oneLine`
            - Output as markdown with code snippets if available.
          `}
					${oneLine`
            - Put any code snippet in their own paragraph.
          `}
        `,
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: codeBlock`
          Here is my question:
          ${oneLine`${sanitizedQuery}`}
      `,
    },
  ]
}

const updateDBConversationMessages = async (
  conversation_id: number,
  recentMessages: Message[]
) => {
  const latestUserMessage = {
    conversation_id,
    content: recentMessages[0].content,
    embedding: recentMessages[0].embedding,
  }
  const latestAiMessage = {
    conversation_id,
    content: recentMessages[1].content,
    embedding: recentMessages[1].embedding,
  }
  const { error: insertUserMessageError } = await supabase
    .from('message')
    .insert(latestUserMessage)
  if (insertUserMessageError) {
    throw insertUserMessageError
  }

  const { error: inserAiMessagesError } = await supabase
    .from('message')
    .insert(latestAiMessage)
  if (inserAiMessagesError) {
    throw inserAiMessagesError
  }
}

export default handler
