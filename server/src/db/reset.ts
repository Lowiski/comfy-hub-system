import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { env } from '../config/env'

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured. Add it to server/.env before resetting.')
}

const sql = neon(env.DATABASE_URL)

await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`
await sql`DROP TABLE IF EXISTS refresh_tokens CASCADE`
await sql`DROP TABLE IF EXISTS users CASCADE`
await sql`DROP TABLE IF EXISTS recipes CASCADE`
await sql`DROP TYPE IF EXISTS user_role CASCADE`

console.log('Database reset complete. Run npm run db:migrate, then start the server to re-seed accounts.')
