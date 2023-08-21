import { supabase } from '@/lib/helpers/supabase'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { chatId } = req.query

  const { error: deleteChatError } = await supabase
    .from('chat')
    .delete()
    .eq('id', chatId)
  if (deleteChatError) throw deleteChatError

  res.status(200).end()
}

export default handler
