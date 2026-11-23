import type { User } from '../../db/schema'
import { findByEmail, toPublicUser, updateProfile } from '../../repositories/user-repository'
import type { ProfileInput } from '../../schema/auth-schema'
import { fail, ok, type ApiResult } from '../../utils/api-result'

const optional = (value?: string) => value?.trim() || null

/** Saves editable profile fields for the signed-in user. School ID and role stay fixed. */
export async function updateProfileService(
  currentUser: User,
  input: ProfileInput,
): Promise<ApiResult<{ user: ReturnType<typeof toPublicUser> }>> {
  const email = input.email.trim()

  const existing = await findByEmail(email)
  if (existing && existing.id !== currentUser.id) {
    return fail('EMAIL_TAKEN', 'Another account is already using that email address.', 409)
  }

  const updated = await updateProfile(currentUser.id, {
    name: input.name.trim(),
    email,
    grade: optional(input.grade),
    department: optional(input.department),
    phone: optional(input.phone),
    address: optional(input.address),
    bio: optional(input.bio),
    avatar: optional(input.avatar),
  })

  if (!updated) return fail('USER_NOT_FOUND', 'We could not find that account.', 404)

  return ok({ user: toPublicUser(updated) })
}
