import bcrypt from 'bcryptjs'
import { and, eq, sql } from 'drizzle-orm'
import { isDatabaseConfigured } from '../config/env'
import { getDb } from '../db'
import { memory } from '../db/memory'
import { users, type NewUser, type User } from '../db/schema'

export type LoginAs = 'student' | 'teacher' | 'admin'

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

export function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
    studentId: user.schoolId,
    birthday: user.birthday,
    mustResetPassword: user.mustResetPassword,
    grade: user.grade,
    department: user.department,
    phone: user.phone,
    address: user.address,
    bio: user.bio,
    avatar: user.avatar,
  }
}

export async function findById(id: string): Promise<User | null> {
  if (!isDatabaseConfigured) {
    return memory.users.find((user) => user.id === id) ?? null
  }

  const rows = await getDb().select().from(users).where(eq(users.id, id)).limit(1)
  return rows[0] ?? null
}

export async function findByIdentity(identifier: string, loginAs: LoginAs): Promise<User | null> {
  const value = identifier.trim().toLowerCase()
  const role = loginAs === 'teacher' ? 'counselor' : loginAs

  if (!isDatabaseConfigured) {
    return memory.users.find((user) => {
      if (role === 'admin') {
        return user.role === 'admin' && user.email.toLowerCase() === value
      }
      return user.role === role && user.schoolId?.toLowerCase() === value
    }) ?? null
  }

  if (role === 'admin') {
    const rows = await getDb()
      .select()
      .from(users)
      .where(and(eq(users.role, 'admin'), sql`lower(${users.email}) = ${value}`))
      .limit(1)
    return rows[0] ?? null
  }

  const rows = await getDb()
    .select()
    .from(users)
    .where(and(eq(users.role, role), sql`lower(${users.schoolId}) = ${value}`))
    .limit(1)
  return rows[0] ?? null
}

export async function findBySchoolId(schoolId: string): Promise<User | null> {
  const value = schoolId.trim().toLowerCase()

  if (!isDatabaseConfigured) {
    return memory.users.find((user) => user.schoolId?.toLowerCase() === value) ?? null
  }

  const rows = await getDb()
    .select()
    .from(users)
    .where(sql`lower(${users.schoolId}) = ${value}`)
    .limit(1)
  return rows[0] ?? null
}

export async function findByEmail(email: string): Promise<User | null> {
  const value = email.trim().toLowerCase()

  if (!isDatabaseConfigured) {
    return memory.users.find((user) => user.email.toLowerCase() === value) ?? null
  }

  const rows = await getDb()
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${value}`)
    .limit(1)
  return rows[0] ?? null
}

export async function listUsers(): Promise<User[]> {
  if (!isDatabaseConfigured) return [...memory.users]
  return getDb().select().from(users)
}

export async function deleteUser(id: string): Promise<User | null> {
  if (!isDatabaseConfigured) {
    const index = memory.users.findIndex((user) => user.id === id)
    if (index === -1) return null
    return memory.users.splice(index, 1)[0]
  }

  const rows = await getDb().delete(users).where(eq(users.id, id)).returning()
  return rows[0] ?? null
}

export async function createUser(input: NewUser): Promise<User> {
  if (!isDatabaseConfigured) {
    const user: User = {
      id: input.id,
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
      schoolId: input.schoolId ?? null,
      birthday: input.birthday ?? null,
      mustResetPassword: input.mustResetPassword ?? false,
      grade: input.grade ?? null,
      department: input.department ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      bio: input.bio ?? null,
      avatar: input.avatar ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    memory.users.push(user)
    return user
  }

  const rows = await getDb().insert(users).values(input).returning()
  return rows[0]
}

export async function updatePassword(id: string, passwordHash: string): Promise<User | null> {
  if (!isDatabaseConfigured) {
    const user = memory.users.find((item) => item.id === id)
    if (!user) return null
    user.passwordHash = passwordHash
    user.mustResetPassword = false
    user.updatedAt = new Date()
    return user
  }

  const rows = await getDb()
    .update(users)
    .set({ passwordHash, mustResetPassword: false, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return rows[0] ?? null
}

export type AccountUpdates = {
  name: string
  email: string
  role: User['role']
  schoolId: string
  birthday: string
  grade: string | null
  department: string | null
}

export async function updateAccount(id: string, updates: AccountUpdates): Promise<User | null> {
  const values = { ...updates, updatedAt: new Date() }

  if (!isDatabaseConfigured) {
    const user = memory.users.find((item) => item.id === id)
    if (!user) return null
    Object.assign(user, values)
    return user
  }

  const rows = await getDb()
    .update(users)
    .set(values)
    .where(eq(users.id, id))
    .returning()
  return rows[0] ?? null
}

export type ProfileUpdates = {
  name: string
  email: string
  grade: string | null
  department: string | null
  phone: string | null
  address: string | null
  bio: string | null
  avatar: string | null
}

export async function updateProfile(id: string, updates: ProfileUpdates): Promise<User | null> {
  const values = { ...updates, updatedAt: new Date() }

  if (!isDatabaseConfigured) {
    const user = memory.users.find((item) => item.id === id)
    if (!user) return null
    Object.assign(user, values)
    return user
  }

  const rows = await getDb()
    .update(users)
    .set(values)
    .where(eq(users.id, id))
    .returning()
  return rows[0] ?? null
}
