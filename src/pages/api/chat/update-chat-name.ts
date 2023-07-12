// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { generateChatName } from '@/scripts/generate-chat-name'
import openai from '@/scripts/openai'
import { supabase } from '@/scripts/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { messages, chatId } = req.body
  const chatName = await generateChatName(messages)

  const { error: updateChatError } = await supabase
    .from('chat')
    .update({ name: chatName })
    .eq('id', chatId)

  if (updateChatError) {
    throw updateChatError
  }

  res.status(200).json(chatName)
}

export default handler
