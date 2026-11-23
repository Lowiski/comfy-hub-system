import { randomBytes } from 'node:crypto'
import type { Request, Response } from 'express'
import type { User } from '../../db/schema'
import { REFRESH_TOKEN_TTL_MS } from '../../lib/auth-tokens'
import { COOKIE_NAMES, setAuthCookies } from '../../lib/auth-cookies'
import { generateCsrfToken, isSignedCsrfToken } from '../../lib/csrf'
import { signAccessToken } from '../../lib/jwt'
import {
  deleteRefreshToken,
  findRefreshToken,
  hashRefreshToken,
  saveRefreshToken,
} from '../../repositories/token-repository'
import { findById, toPublicUser } from '../../repositories/user-repository'
import { fail, ok, type ApiResult } from '../../utils/api-result'

export async function issueSession(req: Request, res: Response, user: User) {
  const currentCsrf = req.cookies?.[COOKIE_NAMES.csrfToken]
  const csrfToken = isSignedCsrfToken(currentCsrf) ? currentCsrf : generateCsrfToken()

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    schoolId: user.schoolId,
  })
  const refreshToken = randomBytes(32).toString('hex')

  await saveRefreshToken(
    user.id,
    hashRefreshToken(refreshToken),
    new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  )

  setAuthCookies(res, { accessToken, refreshToken, csrfToken })
  return csrfToken
}

export async function refreshTokenService(
  req: Request,
  res: Response,
): Promise<ApiResult<{ user: ReturnType<typeof toPublicUser> }>> {
  const token = req.cookies?.[COOKIE_NAMES.refreshToken]
  if (typeof token !== 'string') {
    return fail('NO_REFRESH_TOKEN', 'Your session has expired.', 401)
  }

  const tokenHash = hashRefreshToken(token)
  const record = await findRefreshToken(tokenHash)

  if (!record || record.expiresAt.getTime() < Date.now()) {
    if (record) await deleteRefreshToken(tokenHash)
    return fail('REFRESH_EXPIRED', 'Your session has expired.', 401)
  }

  const user = await findById(record.userId)
  if (!user) {
    await deleteRefreshToken(tokenHash)
    return fail('SESSION_EXPIRED', 'Your session is no longer valid.', 401)
  }

  await deleteRefreshToken(tokenHash)
  await issueSession(req, res, user)
  return ok({ user: toPublicUser(user) })
}
