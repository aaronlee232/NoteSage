import { Request, Response, NextFunction } from 'express'
import {
  buildTailoredMessages,
  buildTailoredPrompt,
  getOpenAi,
  moderateQuery,
  updateChatDetails,
} from '../utils/helpers/openai.js'
import { generateEmbeddingFromText } from '../utils/helpers/embeddings.js'
import {
  getRelevantMessages,
  getRelevantPageSections,
  updateChatHistory,
} from '../utils/helpers/supabase.js'
import { v4 as uuidv4 } from 'uuid'

export const getDefaultRoute = (req: Request, res: Response) => {
  res.send(`Chat route reached`)
}

export const getResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query, tags, userMessageId, chatId, model } = req.body

    // 1. sanitize query
    const sanitizedQuery = query.trim()

    // 2. moderate query
    moderateQuery(sanitizedQuery)

    // 3. generate embedding for query
    const embedding = await generateEmbeddingFromText(sanitizedQuery)

    // 4. get context
    //    - get page_section contexts
    //    - get relevant past messages
    const chatContextTokenLimit = 1500
    const getChatContext = await getRelevantMessages(chatId, embedding)
    const getPageSectionContext = await getRelevantPageSections(
      tags,
      embedding,
      chatContextTokenLimit
    )

    // 5. Create custom query with prompt, context, and query
    //    - CASE 1: Model is chat completion type
    //    - CASE 2: Model is completion type
    let aiMessage
    if (model.includes('gpt')) {
      const tailoredChatMessages = buildTailoredMessages(
        getChatContext,
        getPageSectionContext,
        sanitizedQuery
      )

      // 6. Send custom query to gpt
      const openai = getOpenAi()
      const response = await openai.createChatCompletion({
        model,
        messages: tailoredChatMessages,
        max_tokens: 1024,
        temperature: 0,
      })

      if (response.status !== 200) {
        throw new Error('Failed to complete')
      }

      aiMessage = response.data.choices[0].message?.content?.toString()
      if (!aiMessage) {
        throw new Error('No response message content from ai')
      }
    } else {
      const tailoredPrompt = buildTailoredPrompt(
        getChatContext,
        getPageSectionContext,
        sanitizedQuery
      )

      // 6. Send custom query to gpt
      const openai = getOpenAi()
      const response = await openai.createCompletion({
        model,
        prompt: tailoredPrompt,
        max_tokens: 1024,
        temperature: 0,
      })

      if (response.status !== 200) {
        throw new Error('Failed to complete')
      }

      aiMessage = response.data.choices[0].text
    }

    // 7. Record query and ai message to db
    await updateChatHistory(chatId, userMessageId, sanitizedQuery, aiMessage!)

    // 8. Update chat details (title and description)
    updateChatDetails(chatId, aiMessage!, sanitizedQuery)

    res.status(200).json({ aiMessage })
  } catch (err) {
    next(err)
  }
}

export const getModels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    type ModelOption = {
      value: string
      label: string
    }

    const openai = getOpenAi()
    const response = await openai.listModels()
    const models = response.data.data

    const modelOptions: ModelOption[] = models.map((model) => ({
      value: model.id,
      label: model.id,
    }))

    res.status(200).json(modelOptions)
  } catch (err) {
    next(err)
  }
}
