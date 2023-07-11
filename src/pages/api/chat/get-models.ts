// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import openai from '@/scripts/openai'
import type { NextApiRequest, NextApiResponse } from 'next'

type ModelOption = {
  value: string
  label: string
}

type Data = ModelOption[]

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const response = await openai.listModels()
  const models = response.data.data

  const modelOptions: ModelOption[] = models.map((model) => ({
    value: model.id,
    label: model.id,
  }))

  res.status(200).json(modelOptions)
}

export default handler
