import { Router, Request, Response } from 'express'
import { getDefaultRoute, getModels, getResponse } from '../controllers/chat-controller.js'

export const chatRoutes = Router()
const base_path = '/chat'

chatRoutes.get(`${base_path}`, getDefaultRoute)

chatRoutes.post(`${base_path}/get/response`, getResponse)

chatRoutes.get(`${base_path}/get/models`, getModels)