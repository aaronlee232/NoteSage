import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { ModelOption } from 'types'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const response = await axios.get(
    `${process.env.SAGE_AI_API_URL}/chat/get/models`
  )

  const models = response.data as ModelOption

  res.status(200).json(models)
}

export default handler
