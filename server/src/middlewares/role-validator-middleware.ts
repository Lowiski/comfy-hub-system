import type { RequestHandler } from 'express'
import type { User } from '../db/schema'
import { fail, sendResult } from '../utils/api-result'

export function requireRole(...roles: User['role'][]): RequestHandler {
  return (_req, res, next) => {
    const user = res.locals.user as User | undefined

    if (!user || !roles.includes(user.role)) {
      sendResult(res, fail('FORBIDDEN', 'You do not have access to this resource.', 403))
      return
    }

    next()
  }
}
