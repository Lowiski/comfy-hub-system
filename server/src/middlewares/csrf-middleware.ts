import type { RequestHandler } from 'express'
import { clearCsrfCookie, COOKIE_NAMES } from '../lib/auth-cookies'
import { isValidCsrfToken } from '../lib/csrf'
import { fail, sendResult } from '../utils/api-result'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export const csrfProtection: RequestHandler = (req, res, next) => {
  if (SAFE_METHODS.has(req.method) || req.path === '/api/auth/csrf') {
    next()
    return
  }

  const cookieToken = req.cookies?.[COOKIE_NAMES.csrfToken]
  const headerToken = req.header('x-csrf-token')

  if (!isValidCsrfToken(cookieToken, headerToken)) {
    clearCsrfCookie(res)
    sendResult(res, fail('CSRF_INVALID', 'Invalid CSRF token.', 403))
    return
  }

  next()
}
