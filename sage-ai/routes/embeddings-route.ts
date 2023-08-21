import { Router, Request, Response } from 'express'
import {
  generateEmbedding,
  getDefaultRoute,
} from '../controllers/embeddings-controller.js'

export const embeddingRoutes = Router()
const base_path = '/embeddings'

embeddingRoutes.get(`${base_path}`, getDefaultRoute)

embeddingRoutes.post(`${base_path}/generate`, generateEmbedding)
