// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from '@/scripts/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.body
  const { error, data: deletedChat } = await supabase
    .from('chat')
    .delete()
    .filter('id', 'eq', id)
    .select()

  if (error) {
    throw error
  }

  res.status(200).json(deletedChat)
}

export default handler
