// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from '@/scripts/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { error, data: chats } = await supabase
    .from('chat')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })

  res.status(200).json(chats)
}

export default handler
