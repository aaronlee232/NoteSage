import { supabase } from '@/lib/helpers/supabase'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { data: tags, error: fetchTagsError } = await supabase
    .from('tag')
    .select('id, name')
  if (fetchTagsError) throw fetchTagsError

  res.status(200).json(tags)
}

export default handler
