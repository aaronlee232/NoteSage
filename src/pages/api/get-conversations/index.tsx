// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from '@/scripts/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  conversations: {
    id: number
    name: string
  }[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { error, data: conversations } = await supabase
    .from('conversation')
    .select('id, name')

  if (error) {
    throw error
  }

  res.status(200).json({ conversations })
}

export default handler
