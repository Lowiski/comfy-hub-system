import type { Response } from 'express'
import type { User } from '../../db/schema'
import { toPublicUser } from '../../repositories/user-repository'
import { ok, type ApiResult } from '../../utils/api-result'

export function getUserSessionService(res: Response) {
  const user = res.locals.user as User
  return ok({ user: toPublicUser(user) })
}

export type SessionResult = ApiResult<{ user: ReturnType<typeof toPublicUser> }>
