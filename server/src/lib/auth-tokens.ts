/** Access tokens are short-lived; refresh tokens keep the session alive. */
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60

export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** The CSRF cookie lives as long as the refresh session it protects. */
export const CSRF_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_MS
