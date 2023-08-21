import { Router, Request, Response } from 'express'
import { processedMarkdownOutput } from '../controllers/test-controller.js'

export const testRoutes = Router()
const base_path = '/test'

testRoutes.get(`${base_path}`, (req: Request, res: Response) => {
  res.send(`${base_path} route reached`)
})

testRoutes.get(`${base_path}/processMarkdown`, processedMarkdownOutput)
