import { supabase } from '@/lib/helpers/supabase'
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { Message } from 'types'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('request tags: ', req.body.tags)
  const message = req.body.message as Message
  const tags = req.body.tags
  const chatId = req.body.chatId
  const selectedModel = req.body.model

  const { error: insertMessageError } = await supabase
    .from('message')
    .insert(message)
  if (insertMessageError) throw insertMessageError

  axios.post(`${process.env.SAGE_AI_API_URL}/chat/get/response`, {
    query: message.content,
    tags: tags,
    userMessageId: message.id,
    chatId: chatId,
    model: selectedModel,
  })

  res.status(200).end()
}

export default handler
