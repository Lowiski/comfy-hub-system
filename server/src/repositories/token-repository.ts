import { createHash } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { isDatabaseConfigured } from '../config/env'
import { getDb } from '../db'
import { memory } from '../db/memory'
import { refreshTokens, type RefreshToken } from '../db/schema'

export function hashRefreshToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
  if (!isDatabaseConfigured) {
    memory.refreshTokens.push({ tokenHash, userId, expiresAt, createdAt: new Date() })
    return
  }

  await getDb().insert(refreshTokens).values({ tokenHash, userId, expiresAt })
}

export async function findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
  if (!isDatabaseConfigured) {
    return memory.refreshTokens.find((token) => token.tokenHash === tokenHash) ?? null
  }

  const rows = await getDb()
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1)
  return rows[0] ?? null
}

export async function deleteRefreshToken(tokenHash: string) {
  if (!isDatabaseConfigured) {
    memory.refreshTokens = memory.refreshTokens.filter((token) => token.tokenHash !== tokenHash)
    return
  }

  await getDb().delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash))
}

export async function deleteRefreshTokensForUser(userId: string) {
  if (!isDatabaseConfigured) {
    memory.refreshTokens = memory.refreshTokens.filter((token) => token.userId !== userId)
    return
  }

  await getDb().delete(refreshTokens).where(eq(refreshTokens.userId, userId))
}
