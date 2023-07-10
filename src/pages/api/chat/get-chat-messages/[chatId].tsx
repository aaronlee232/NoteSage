// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from '@/scripts/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { chatId } = req.query
  let id = parseInt(chatId as string)

  const { error, data: messages } = await supabase
    .from('message')
    .select('id, chat_id, role, avatar, created_at, content')
    .filter('chat_id', 'eq', id)
    .order('created_at', { ascending: true })

  res.status(200).json(messages)
}

export default handler
