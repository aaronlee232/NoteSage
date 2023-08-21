import { NextApiRequest, NextApiResponse } from 'next'
import { formatFilePath, writeS3File } from '../../lib/helpers/file'
import axios from 'axios'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Call get s3 objects from sage ai api
  const { data } = await axios.get(
    `${process.env.SAGE_AI_API_URL}/s3/get/all-objects`
  )

  const files = data.objects

  for (let file of files) {
    const { path, content } = file

    const formattedPath = formatFilePath(path)

    writeS3File(formattedPath, content)
  }
  res.status(200).json({ message: 'files written' })
}

export default handler
