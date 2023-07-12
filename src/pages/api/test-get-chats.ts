// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from '@/scripts/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  chats: {
    id: number
    name: string
  }[]
}

// Testing endpoint

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { error, data: chats } = await supabase.from('chat').select('id, name')

  if (error) {
    throw error
  }

  res.status(200).json({ chats: chats })
}

export default handler
