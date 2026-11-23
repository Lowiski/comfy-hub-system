import { randomUUID } from 'node:crypto'
import type { AdminAccountInput } from '../schema/admin-schema'
import {
  createUser,
  deleteUser,
  findByEmail,
  findById,
  findBySchoolId,
  hashPassword,
  listUsers,
  toPublicUser,
  updateAccount,
} from '../repositories/user-repository'
import { fail, ok, type ApiResult } from '../utils/api-result'

export async function listAccountsService() {
  const users = await listUsers()
  return ok({ users: users.map(toPublicUser) })
}

export async function createAccountService(input: AdminAccountInput) {
  if (await findByEmail(input.email)) {
    return fail('EMAIL_TAKEN', 'An account with this email already exists.', 409)
  }
  if (input.schoolId && await findBySchoolId(input.schoolId)) {
    return fail('SCHOOL_ID_TAKEN', 'An account with this school ID already exists.', 409)
  }

  const user = await createUser({
    id: randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: await hashPassword('123456'),
    role: input.role,
    schoolId: input.schoolId ?? null,
    birthday: input.birthday ?? null,
    mustResetPassword: true,
    grade: input.grade ?? null,
    department: input.department ?? null,
  })

  return ok({ user: toPublicUser(user) })
}

export async function updateAccountService(id: string, input: AdminAccountInput) {
  const current = await findById(id)
  if (!current) return fail('USER_NOT_FOUND', 'That account no longer exists.', 404)

  const emailOwner = await findByEmail(input.email)
  if (emailOwner && emailOwner.id !== id) {
    return fail('EMAIL_TAKEN', 'An account with this email already exists.', 409)
  }
  const schoolIdOwner = await findBySchoolId(input.schoolId)
  if (schoolIdOwner && schoolIdOwner.id !== id) {
    return fail('SCHOOL_ID_TAKEN', 'An account with this school ID already exists.', 409)
  }

  const user = await updateAccount(id, {
    name: input.name,
    email: input.email,
    role: input.role,
    schoolId: input.schoolId,
    birthday: input.birthday,
    grade: input.grade ?? null,
    department: input.department ?? null,
  })
  if (!user) return fail('USER_NOT_FOUND', 'That account no longer exists.', 404)
  return ok({ user: toPublicUser(user) })
}

export type BulkAccountResult = {
  name: string
  status: 'added' | 'already_added'
  message: string
  id?: string
}

export async function bulkCreateAccountsService(inputs: AdminAccountInput[]) {
  const existing = await listUsers()
  const emails = new Set(existing.map((item) => item.email.toLowerCase()))
  const schoolIds = new Set(existing.map((item) => item.schoolId).filter(Boolean) as string[])
  const passwordHash = await hashPassword('123456')
  const results: BulkAccountResult[] = []
  let added = 0

  for (const input of inputs) {
    const email = input.email.toLowerCase()
    if (emails.has(email)) {
      results.push({ name: input.name, status: 'already_added', message: 'Email already exists.' })
      continue
    }
    if (schoolIds.has(input.schoolId)) {
      results.push({ name: input.name, status: 'already_added', message: 'School ID already exists.' })
      continue
    }

    const user = await createUser({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      schoolId: input.schoolId,
      birthday: input.birthday,
      mustResetPassword: true,
      grade: input.grade ?? null,
      department: input.department ?? null,
    })
    emails.add(email)
    schoolIds.add(input.schoolId)
    results.push({ name: input.name, status: 'added', message: `${input.role} · ${input.schoolId}`, id: user.id })
    added += 1
  }

  return ok({ results, added, skipped: results.length - added })
}

export async function deleteAccountService(id: string, currentUserId: string) {
  if (id === currentUserId) {
    return fail('CANNOT_DELETE_SELF', 'You cannot remove your own account.', 400)
  }

  const user = await deleteUser(id)
  if (!user) return fail('USER_NOT_FOUND', 'That account no longer exists.', 404)
  return ok({ ok: true as const })
}

export type ListAccountsResult = ApiResult<Awaited<ReturnType<typeof listAccountsService>>['data']>
