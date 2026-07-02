import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const quizRouter = Router()

quizRouter.get('/', async (_req, res) => {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json(quizzes)
})

quizRouter.get('/:id', async (req, res) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: req.params.id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { choices: true },
      },
    },
  })
  if (!quiz) {
    res.status(404).json({ error: 'Quiz not found' })
    return
  }
  res.json(quiz)
})

quizRouter.post('/', async (req, res) => {
  const { title, description } = req.body as { title?: string; description?: string }
  if (!title) {
    res.status(400).json({ error: 'title is required' })
    return
  }
  const quiz = await prisma.quiz.create({
    data: { title, description },
  })
  res.status(201).json(quiz)
})
