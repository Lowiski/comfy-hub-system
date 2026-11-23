import type { RequestHandler } from 'express'
import { COOKIE_NAMES } from '../lib/auth-cookies'
import { verifyAccessToken } from '../lib/jwt'
import { findById } from '../repositories/user-repository'
import { fail, sendResult } from '../utils/api-result'

export const requireAuth: RequestHandler = async (req, res, next) => {
  const bearer = req.header('authorization')?.replace(/^Bearer\s+/i, '').trim()
  const token = req.cookies?.[COOKIE_NAMES.accessToken] || bearer

  if (!token) {
    sendResult(res, fail('UNAUTHORIZED', 'You must be signed in to continue.', 401))
    return
  }

  try {
    const payload = verifyAccessToken(token)
    const user = await findById(payload.sub)

    if (!user) {
      sendResult(res, fail('SESSION_EXPIRED', 'Your session is no longer valid.', 401))
      return
    }

    res.locals.user = user
    next()
  } catch {
    sendResult(res, fail('INVALID_TOKEN', 'Your session is invalid or has expired.', 401))
  }
}
