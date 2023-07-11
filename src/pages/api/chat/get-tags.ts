// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import openai from '@/scripts/openai'
import { supabase } from '@/scripts/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'

type TagOption = {
  value: string
  label: string
}

type Data = TagOption[]

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { error: fetchTagsError, data: tags } = await supabase
    .from('tag')
    .select('name')

  if (fetchTagsError) {
    throw fetchTagsError
  }

  const tagOptions: TagOption[] = tags.map((tag) => ({
    value: tag.name,
    label: tag.name,
  }))

  res.status(200).json(tagOptions)
}

export default handler
