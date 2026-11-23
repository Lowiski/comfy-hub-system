import type { Response } from 'express'
import { isProduction } from '../config/env'
import { ACCESS_TOKEN_TTL_SECONDS, CSRF_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS } from './auth-tokens'

export const COOKIE_NAMES = {
  accessToken: 'comfyhub_access_token',
  refreshToken: 'comfyhub_refresh_token',
  csrfToken: 'comfyhub_csrf_token',
} as const

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
}

export function setCsrfCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAMES.csrfToken, token, {
    ...baseOptions,
    httpOnly: false,
    path: '/',
    maxAge: CSRF_TOKEN_TTL_MS,
  })
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string; csrfToken: string },
) {
  res.cookie(COOKIE_NAMES.accessToken, tokens.accessToken, {
    ...baseOptions,
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
  })

  res.cookie(COOKIE_NAMES.refreshToken, tokens.refreshToken, {
    ...baseOptions,
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_TTL_MS,
  })

  setCsrfCookie(res, tokens.csrfToken)
}

export function clearCsrfCookie(res: Response) {
  res.clearCookie(COOKIE_NAMES.csrfToken, { ...baseOptions, httpOnly: false, path: '/' })
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(COOKIE_NAMES.accessToken, { ...baseOptions, path: '/' })
  res.clearCookie(COOKIE_NAMES.refreshToken, { ...baseOptions, path: '/api/auth' })
  clearCsrfCookie(res)
}
