import type { RequestHandler } from 'express'
import type { ZodTypeAny } from 'zod'
import { fail, sendResult } from '../utils/api-result'

type Source = 'body' | 'query' | 'params'

export function validateSchema(schema: ZodTypeAny, source: Source = 'body'): RequestHandler {
  return (req, res, next) => {
    const parsed = schema.safeParse(req[source])

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Invalid request.'
      return sendResult(res, fail('VALIDATION_ERROR', message, 400))
    }

    res.locals.validated = {
      ...(res.locals.validated as Record<string, unknown> | undefined),
      ...(parsed.data as Record<string, unknown>),
    }
    return next()
  }
}
