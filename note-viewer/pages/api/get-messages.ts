import { supabase } from '@/lib/helpers/supabase'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { data: messages, error: fetchMessagesError } = await supabase
    .from('message')
    .select('id, role, content')
    .eq('chat_id', req.query.chatId)
  if (fetchMessagesError) throw fetchMessagesError

  res.status(200).json(messages)
}

export default handler
