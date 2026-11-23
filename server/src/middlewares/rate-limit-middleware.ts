import rateLimit from 'express-rate-limit'
import { fail, sendResult } from '../utils/api-result'

function tooManyRequests(message: string, windowMs: number, limit: number) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res, _next, options) => {
      res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000))
      sendResult(res, fail('RATE_LIMITED', message, 429))
    },
  })
}

export const loginRateLimit = tooManyRequests(
  'Too many sign-in attempts. Please wait before trying again.',
  15 * 60 * 1000,
  10,
)

export const accountRecoveryRateLimit = tooManyRequests(
  'Too many account recovery attempts. Please wait before trying again.',
  15 * 60 * 1000,
  20,
)

export const refreshRateLimit = tooManyRequests(
  'Too many refresh attempts. Please wait before trying again.',
  15 * 60 * 1000,
  60,
)

export const bulkImportRateLimit = tooManyRequests(
  'Too many imports. Please wait before trying again.',
  60 * 60 * 1000,
  10,
)

export const messageRateLimit = tooManyRequests(
  'You are sending messages too quickly. Please wait a moment.',
  60 * 1000,
  30,
)
