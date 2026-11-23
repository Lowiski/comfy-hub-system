import type { Request, Response } from 'express'
import type { User } from '../../db/schema'
import type { BirthdayInput, LoginInput, ResetPasswordInput, SchoolIdInput } from '../../schema/auth-schema'
import {
  findBySchoolId,
  findByIdentity,
  hashPassword,
  toPublicUser,
  updatePassword,
  verifyPassword,
  type LoginAs,
} from '../../repositories/user-repository'
import { fail, ok, type ApiResult } from '../../utils/api-result'
import { issueSession } from './refresh-token-service'

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

function normalizeBirthday(value: string) {
  const trimmed = value.trim()

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed)
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`

  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed)
  if (slash) return `${slash[3]}-${slash[1].padStart(2, '0')}-${slash[2].padStart(2, '0')}`

  const dash = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(trimmed)
  if (dash) return `${dash[3]}-${dash[1].padStart(2, '0')}-${dash[2].padStart(2, '0')}`

  const written = /^([a-z]+)\s+(\d{1,2}),?\s+(\d{4})$/i.exec(trimmed)
  if (written) {
    const month = MONTHS.findIndex((name) => name.startsWith(written[1].toLowerCase()))
    if (month !== -1) {
      return `${written[3]}-${String(month + 1).padStart(2, '0')}-${written[2].padStart(2, '0')}`
    }
  }

  return trimmed
}

type LoginResult = ApiResult<
  | {
      requiresPasswordReset: true
      schoolId: string | null
      name: string
      role: User['role']
    }
  | { user: ReturnType<typeof toPublicUser> }
>

export async function loginService(
  req: Request,
  res: Response,
  input: LoginInput,
): Promise<LoginResult> {
  const user = await findByIdentity(input.identifier, input.loginAs as LoginAs)

  if (!user) {
    const message = input.loginAs === 'admin'
      ? 'We could not find that admin account.'
      : input.loginAs === 'teacher'
        ? 'We could not find an account with that teacher ID.'
        : 'We could not find an account with that student ID.'
    return fail('ACCOUNT_NOT_FOUND', message, 401)
  }

  if (!(await verifyPassword(input.password, user.passwordHash))) {
    return fail('INVALID_PASSWORD', 'That password does not match. Please try again.', 401)
  }

  if (user.mustResetPassword) {
    return ok({
      requiresPasswordReset: true as const,
      schoolId: user.schoolId,
      name: user.name,
      role: user.role,
    })
  }

  await issueSession(req, res, user)
  return ok({ user: toPublicUser(user) })
}

export async function lookupSchoolIdService(input: SchoolIdInput) {
  const user = await findBySchoolId(input.schoolId)
  if (!user) return fail('ACCOUNT_NOT_FOUND', 'No account was found for that school ID.', 404)
  return ok({ name: user.name })
}

export async function verifyBirthdayService(input: BirthdayInput) {
  const user = await findBySchoolId(input.schoolId)
  if (!user) return fail('ACCOUNT_NOT_FOUND', 'No account was found for that school ID.', 404)
  if (!user.birthday) {
    return fail('NO_BIRTHDAY', 'This account has no birthday on record. Please contact the office.', 400)
  }
  if (user.birthday !== normalizeBirthday(input.birthday)) {
    return fail('BIRTHDAY_MISMATCH', 'That birthday does not match our records.', 401)
  }
  return ok({ name: user.name })
}

export async function resetPasswordService(
  req: Request,
  res: Response,
  input: ResetPasswordInput,
): Promise<ApiResult<{ user: ReturnType<typeof toPublicUser> }>> {
  const user = await findBySchoolId(input.schoolId)
  if (!user) return fail('ACCOUNT_NOT_FOUND', 'No account was found for that school ID.', 404)
  if (!user.birthday || user.birthday !== normalizeBirthday(input.birthday)) {
    return fail('BIRTHDAY_MISMATCH', 'That birthday does not match our records.', 401)
  }

  const updated = await updatePassword(user.id, await hashPassword(input.newPassword))
  if (!updated) return fail('UPDATE_FAILED', 'We could not update that account.', 500)

  await issueSession(req, res, updated)
  return ok({ user: toPublicUser(updated) })
}
