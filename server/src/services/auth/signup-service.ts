import { randomUUID } from 'node:crypto'
import type { SignupInput } from '../../schema/auth-schema'
import {
  createUser,
  findByEmail,
  findBySchoolId,
  hashPassword,
  toPublicUser,
} from '../../repositories/user-repository'
import { fail, ok, type ApiResult } from '../../utils/api-result'

/** Used by administrators to create school-issued accounts. */
export async function signupService(input: SignupInput) {
  if (await findByEmail(input.email)) {
    return fail('EMAIL_TAKEN', 'An account with this email already exists.', 409)
  }
  if (await findBySchoolId(input.schoolId)) {
    return fail('SCHOOL_ID_TAKEN', 'An account with this school ID already exists.', 409)
  }

  const user = await createUser({
    id: randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: await hashPassword('123456'),
    role: input.role,
    schoolId: input.schoolId,
    birthday: input.birthday,
    mustResetPassword: true,
    grade: input.grade ?? null,
    department: input.department ?? null,
  })

  return ok({ user: toPublicUser(user) })
}

export type SignupResult = ApiResult<{ user: ReturnType<typeof toPublicUser> }>
