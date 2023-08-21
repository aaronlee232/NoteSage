import { supabase } from '@/lib/helpers/supabase'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { data: chats, error: fetchChatsError } = await supabase
    .from('chat')
    .select('id, title, description')
    .order('created_at', { ascending: false })
  if (fetchChatsError) throw fetchChatsError

  res.status(200).json(chats)
}

export default handler
