// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from '@/scripts/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { error, data: chat } = await supabase
    .from('chat')
    .insert({})
    .select()
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  res.status(200).json(chat)
}

export default handler
