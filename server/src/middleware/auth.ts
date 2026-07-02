import type { NextFunction, Request, Response } from 'express'
import type { Role } from '@prisma/client'
import { verifyToken } from '../lib/jwt.js'

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role }
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' })
    return
  }
  try {
    const payload = verifyToken(token)
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  if (token) {
    try {
      const payload = verifyToken(token)
      req.user = { id: payload.sub, role: payload.role }
    } catch {
      // ignore invalid token, treat as unauthenticated
    }
  }
  next()
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' })
      return
    }
    next()
  }
}
