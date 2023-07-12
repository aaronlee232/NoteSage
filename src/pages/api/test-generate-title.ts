// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { generateChatName } from '../../scripts/generate-chat-name'

// Testing endpoint

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { message } = req.body
  //   const message = `\newcommand{\resumeSummaryBodyStart}{leftmargin=0.15in}

  // \section{Summary}
  //   \resumeSummaryBodyStart
  //     {Aspiring Software Engineer with a background in cloud infrastructure and backend technologies. Regularly uses JavaScript, Python, and AWS in professional and personal projects. Enthusiastic about the uses of Large Language Models and explores them through personal projects.}

  // there is no left margin being added to`

  const chatName = await generateChatName(message)
  console.log('chatName:', chatName)

  res.status(200).json(chatName)
  // res.status(200).json({ ok: true })
}

export default handler
