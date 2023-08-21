import express, { Express } from 'express'
import dotenv from 'dotenv'
import { routes } from './routes/index.js'
import {
  errorLogger,
  errorResponder,
} from './utils/middleware/error-handling.js'

dotenv.config()

const app: Express = express()
app.use(express.json())

const port = process.env.PORT

// Routes
app.use('/', routes)
app.use(errorLogger)
app.use(errorResponder)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
