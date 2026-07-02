import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

export const attemptRouter = Router()

attemptRouter.use(authenticate)

attemptRouter.get('/', async (req, res) => {
  const attempts = await prisma.attempt.findMany({
    where: { userId: req.user!.id },
    orderBy: { startedAt: 'desc' },
    include: { quiz: { select: { id: true, title: true } } },
  })
  res.json(attempts)
})

attemptRouter.post('/', async (req, res) => {
  const { quizId } = req.body as { quizId?: string }
  if (!quizId) {
    res.status(400).json({ error: 'quizId is required' })
    return
  }
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } })
  if (!quiz) {
    res.status(404).json({ error: 'Quiz not found' })
    return
  }
  const attempt = await prisma.attempt.create({
    data: { quizId, userId: req.user!.id },
  })
  res.status(201).json(attempt)
})

attemptRouter.get('/:id', async (req, res) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: req.params.id },
    include: {
      quiz: { select: { id: true, title: true } },
      answers: { include: { question: true } },
    },
  })
  if (!attempt) {
    res.status(404).json({ error: 'Attempt not found' })
    return
  }
  if (attempt.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Insufficient permissions' })
    return
  }
  res.json(attempt)
})

attemptRouter.post('/:id/answers', async (req, res) => {
  const { questionId, selectedAnswer } = req.body as {
    questionId?: string
    selectedAnswer?: number
  }
  if (!questionId || !Number.isInteger(selectedAnswer)) {
    res.status(400).json({ error: 'questionId and selectedAnswer are required' })
    return
  }

  const attempt = await prisma.attempt.findUnique({ where: { id: req.params.id } })
  if (!attempt) {
    res.status(404).json({ error: 'Attempt not found' })
    return
  }
  if (attempt.userId !== req.user!.id) {
    res.status(403).json({ error: 'Insufficient permissions' })
    return
  }
  if (attempt.finishedAt) {
    res.status(400).json({ error: 'Attempt already finished' })
    return
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } })
  if (!question || question.quizId !== attempt.quizId) {
    res.status(400).json({ error: 'Question does not belong to this attempt\'s quiz' })
    return
  }

  const isCorrect = selectedAnswer === question.correctAnswer
  const answer = await prisma.attemptAnswer.upsert({
    where: { attemptId_questionId: { attemptId: attempt.id, questionId } },
    create: { attemptId: attempt.id, questionId, selectedAnswer: selectedAnswer!, isCorrect },
    update: { selectedAnswer: selectedAnswer!, isCorrect },
  })
  res.status(201).json(answer)
})

attemptRouter.post('/:id/finish', async (req, res) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: req.params.id },
    include: { answers: true },
  })
  if (!attempt) {
    res.status(404).json({ error: 'Attempt not found' })
    return
  }
  if (attempt.userId !== req.user!.id) {
    res.status(403).json({ error: 'Insufficient permissions' })
    return
  }
  if (attempt.finishedAt) {
    res.status(400).json({ error: 'Attempt already finished' })
    return
  }

  const score = attempt.answers.filter((a) => a.isCorrect).length
  const updated = await prisma.attempt.update({
    where: { id: attempt.id },
    data: { score, finishedAt: new Date() },
    include: { answers: { include: { question: true } }, quiz: { select: { id: true, title: true } } },
  })
  res.json(updated)
})
