import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { quizRouter } from './routes/quiz.routes.js'

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/quizzes', quizRouter)

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
