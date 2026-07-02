import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.routes.js'
import { categoryRouter } from './routes/category.routes.js'
import { quizRouter } from './routes/quiz.routes.js'
import { attemptRouter } from './routes/attempt.routes.js'

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/quizzes', quizRouter)
app.use('/api/attempts', attemptRouter)

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
