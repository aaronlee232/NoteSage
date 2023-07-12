// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from '@/scripts/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'
import { addMessageToChatDB } from './create-message'
import { generateEmbeddingFromText } from '@/scripts/embeddings'

type Data = {
  userMessage: Message
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { chatId, query, name } = req.body

  const formattedName = (name as string).replaceAll(' ', '+')

  let userMessage: Message = {
    role: 'user',
    chat_id: chatId,
    avatar: `https://ui-avatars.com/api/?name=${formattedName}&background=3bb7b7&color=393735`,
    content: query,
  }

  const newUserMessage = await addMessageToChatDB(userMessage)

  res.status(200).json(newUserMessage)
}

export default handler
