import { supabase } from '@/lib/helpers/supabase'
import { NextApiRequest, NextApiResponse } from 'next'
import { Chat } from 'types'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const newChat: Chat = req.body

  const { error: insertChatError } = await supabase.from('chat').insert(newChat)
  if (insertChatError) throw insertChatError

  res.status(200).end()
}

export default handler
