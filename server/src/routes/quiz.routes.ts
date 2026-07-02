import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js'

export const quizRouter = Router()

interface QuestionInput {
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
  order?: number
}

function isValidQuestion(q: QuestionInput): boolean {
  return (
    typeof q.text === 'string' &&
    q.text.length > 0 &&
    Array.isArray(q.options) &&
    q.options.length >= 2 &&
    Number.isInteger(q.correctAnswer) &&
    q.correctAnswer >= 0 &&
    q.correctAnswer < q.options.length
  )
}

quizRouter.get('/', async (req, res) => {
  const { categoryId } = req.query as { categoryId?: string }
  const quizzes = await prisma.quiz.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { category: true, _count: { select: { questions: true } } },
  })
  res.json(quizzes)
})

quizRouter.get('/:id', optionalAuthenticate, async (req, res) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      questions: { orderBy: { order: 'asc' } },
    },
  })
  if (!quiz) {
    res.status(404).json({ error: 'Quiz not found' })
    return
  }

  // correctAnswer/explanation are withheld until the player finishes an attempt
  // (see attempt review endpoint), so they can't be read off the network tab.
  const isAdmin = req.user?.role === 'ADMIN'
  const questions = quiz.questions.map((q) =>
    isAdmin ? q : { id: q.id, text: q.text, options: q.options, order: q.order },
  )
  res.json({ ...quiz, questions })
})

quizRouter.post('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { title, description, categoryId, questions } = req.body as {
    title?: string
    description?: string
    categoryId?: string
    questions?: QuestionInput[]
  }
  if (!title || !categoryId) {
    res.status(400).json({ error: 'title and categoryId are required' })
    return
  }
  if (questions?.some((q) => !isValidQuestion(q))) {
    res.status(400).json({ error: 'invalid question data' })
    return
  }

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
      categoryId,
      questions: questions
        ? {
            create: questions.map((q, i) => ({
              text: q.text,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              order: q.order ?? i,
            })),
          }
        : undefined,
    },
    include: { questions: true },
  })
  res.status(201).json(quiz)
})

quizRouter.patch('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { title, description, categoryId } = req.body as {
    title?: string
    description?: string
    categoryId?: string
  }
  const quiz = await prisma.quiz.update({
    where: { id: req.params.id },
    data: { title, description, categoryId },
  })
  res.json(quiz)
})

quizRouter.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  await prisma.quiz.delete({ where: { id: req.params.id } })
  res.status(204).send()
})

quizRouter.post('/:id/questions', authenticate, requireRole('ADMIN'), async (req, res) => {
  const input = req.body as QuestionInput
  if (!isValidQuestion(input)) {
    res.status(400).json({ error: 'invalid question data' })
    return
  }
  const question = await prisma.question.create({
    data: {
      quizId: req.params.id,
      text: input.text,
      options: input.options,
      correctAnswer: input.correctAnswer,
      explanation: input.explanation,
      order: input.order ?? 0,
    },
  })
  res.status(201).json(question)
})

quizRouter.patch(
  '/:id/questions/:questionId',
  authenticate,
  requireRole('ADMIN'),
  async (req, res) => {
    const { text, options, correctAnswer, explanation, order } = req.body as Partial<QuestionInput>
    const question = await prisma.question.update({
      where: { id: req.params.questionId },
      data: { text, options, correctAnswer, explanation, order },
    })
    res.json(question)
  },
)

quizRouter.delete('/:id/questions/:questionId', authenticate, requireRole('ADMIN'), async (req, res) => {
  await prisma.question.delete({ where: { id: req.params.questionId } })
  res.status(204).send()
})
