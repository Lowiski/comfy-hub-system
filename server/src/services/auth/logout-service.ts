import type { Request, Response } from 'express'
import { COOKIE_NAMES, clearAuthCookies } from '../../lib/auth-cookies'
import { deleteRefreshToken, hashRefreshToken } from '../../repositories/token-repository'
import { ok, type ApiResult } from '../../utils/api-result'

export async function logoutService(req: Request, res: Response): Promise<ApiResult<{ ok: true }>> {
  const token = req.cookies?.[COOKIE_NAMES.refreshToken]
  if (typeof token === 'string') {
    await deleteRefreshToken(hashRefreshToken(token))
  }

  clearAuthCookies(res)
  return ok({ ok: true })
}
