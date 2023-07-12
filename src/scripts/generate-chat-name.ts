import openai from '@/scripts/openai'
import { supabase } from '@/scripts/supabase'
import { codeBlock, oneLine } from 'common-tags'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'

export const generateChatName = async (messages: Message[]) => {
  const messageWithPrompt = [
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: codeBlock`
          ${oneLine`
            You are an AI that summarizes conversations.
          `}

          ${oneLine`
            RULE: Use 5 or less words.
    			`}
        `,
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: codeBlock`
          ${oneLine`
            Conversation:
    			`}

          ${oneLine`
            user: ${messages[0].content}
    			`}

          ${oneLine`
            assistant: ${messages[1].content}
    			`}
        `,
    },
  ]

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: messageWithPrompt,
    max_tokens: 1024,
    temperature: 0,
  })

  return response.data.choices[0].message?.content?.toString()
}
