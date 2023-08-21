import express, { Request, Response } from 'express'
import { chatRoutes } from './chat-routes.js'
import { embeddingRoutes } from './embeddings-route.js'
import { testRoutes } from './test-routes.js'
import { s3Routes } from './s3-routes.js'

export const routes = express.Router()

routes.get('/', (req: Request, res: Response) => {
  res.send('NoteSage AI is running')
})

routes.use(chatRoutes)
routes.use(embeddingRoutes)
routes.use(s3Routes)
routes.use(testRoutes)
