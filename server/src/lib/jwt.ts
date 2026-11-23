import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { User } from '../db/schema'
import { ACCESS_TOKEN_TTL_SECONDS } from './auth-tokens'

export type AccessTokenPayload = {
  sub: string
  role: User['role']
  schoolId: string | null
}

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL_SECONDS })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload
}
