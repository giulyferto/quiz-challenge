import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'

export const categoryRouter = Router()

categoryRouter.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { quizzes: true } } },
  })
  res.json(categories)
})

categoryRouter.get('/:id', async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { quizzes: true },
  })
  if (!category) {
    res.status(404).json({ error: 'Category not found' })
    return
  }
  res.json(category)
})

categoryRouter.post('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { name, description } = req.body as { name?: string; description?: string }
  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }
  const category = await prisma.category.create({ data: { name, description } })
  res.status(201).json(category)
})

categoryRouter.patch('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { name, description } = req.body as { name?: string; description?: string }
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { name, description },
  })
  res.json(category)
})

categoryRouter.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } })
  res.status(204).send()
})
