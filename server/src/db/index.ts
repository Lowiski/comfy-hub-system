import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { env, isDatabaseConfigured } from '../config/env'
import { seedMemory } from './memory'
import * as schema from './schema'

if (!isDatabaseConfigured && env.NODE_ENV === 'production' && process.env.ALLOW_IN_MEMORY_DB !== 'true') {
  throw new Error('DATABASE_URL is required in production. Set it to your Neon connection string.')
}

const client = isDatabaseConfigured ? neon(env.DATABASE_URL) : null

export const db = client ? drizzle(client, { schema }) : null

const shouldSeedDemo = env.SEED_DEMO_DATA === 'true'
  || (env.NODE_ENV !== 'production' && env.SEED_DEMO_DATA !== 'false')

export function getDb() {
  if (!db) {
    throw new Error('DATABASE_URL is not configured. Add your Neon connection string to server/.env.')
  }
  return db
}

async function seedSchoolConversation() {
  if (!db) return

  const studentRows = await db.select().from(schema.users)
    .where(eq(schema.users.schoolId, '20240748')).limit(1)
  const counselorRows = await db.select().from(schema.users)
    .where(eq(schema.users.schoolId, '20240941')).limit(1)
  const student = studentRows[0]
  const counselor = counselorRows[0]
  if (!student || !counselor) return

  const existing = await db.select().from(schema.conversations)
    .where(and(
      eq(schema.conversations.studentId, student.id),
      eq(schema.conversations.counselorId, counselor.id),
    ))
    .limit(1)
  if (existing.length > 0) return

  const id = randomUUID()
  const now = new Date()
  await db.insert(schema.conversations).values({
    id,
    subject: 'Checking in this week',
    studentId: student.id,
    counselorId: counselor.id,
    createdAt: now,
    updatedAt: now,
  })
  await db.insert(schema.messages).values([
    {
      id: `${id}-m1`,
      conversationId: id,
      senderId: student.id,
      body: 'Hi Sir Michael, I wanted to ask about managing my study time this week.',
      createdAt: new Date(now.getTime() - 60_000),
      readAt: now,
    },
    {
      id: `${id}-m2`,
      conversationId: id,
      senderId: counselor.id,
      body: 'Hi Louie, thanks for reaching out. Let us plan two short study blocks and review how they go tomorrow.',
      createdAt: now,
      readAt: null,
    },
  ])
}

export async function ensureDatabase() {
  if (!db) {
    await seedMemory()
    console.warn('DATABASE_URL is not set. Using the in-memory seeded store for local development.')
    return
  }

  if (shouldSeedDemo) {
    const { buildSeedUsers } = await import('./seed')
    const values = await buildSeedUsers()

    await db.insert(schema.users).values(values).onConflictDoNothing()
    await seedSchoolConversation()
  }
  console.log(shouldSeedDemo
    ? 'Neon database connected, school accounts and conversations checked.'
    : 'Neon database connected. Demo seeding is disabled.')
}
