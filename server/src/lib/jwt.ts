import jwt from 'jsonwebtoken'
import type { Role } from '@prisma/client'

const JWT_SECRET: string =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error('JWT_SECRET environment variable is not set')
  })()

export interface JwtPayload {
  sub: string
  role: Role
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}
