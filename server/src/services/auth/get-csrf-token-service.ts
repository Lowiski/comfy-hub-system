import type { Request, Response } from 'express'
import { COOKIE_NAMES, setCsrfCookie } from '../../lib/auth-cookies'
import { generateCsrfToken, isSignedCsrfToken } from '../../lib/csrf'
import { ok, type ApiResult } from '../../utils/api-result'

export function getCsrfTokenService(req: Request, res: Response): ApiResult<{ csrfToken: string }> {
  const current = req.cookies?.[COOKIE_NAMES.csrfToken]
  const csrfToken = isSignedCsrfToken(current) ? current : generateCsrfToken()

  setCsrfCookie(res, csrfToken)
  return ok({ csrfToken })
}
