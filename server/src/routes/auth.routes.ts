import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { signToken } from '../lib/jwt.js'
import { authenticate } from '../middleware/auth.js'

export const authRouter = Router()

function toPublicUser(user: { id: string; email: string; name: string; role: string }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

authRouter.post('/register', async (req, res) => {
  const { email, password, name } = req.body as {
    email?: string
    password?: string
    name?: string
  }
  if (!email || !password || !name) {
    res.status(400).json({ error: 'email, password and name are required' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'password must be at least 8 characters' })
    return
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: 'Email already registered' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    // New accounts are always PLAYER; promote to ADMIN directly in the DB.
    data: { email, passwordHash, name, role: 'PLAYER' },
  })

  const token = signToken({ sub: user.id, role: user.role })
  res.status(201).json({ token, user: toPublicUser(user) })
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const token = signToken({ sub: user.id, role: user.role })
  res.json({ token, user: toPublicUser(user) })
})

authRouter.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json(toPublicUser(user))
})
