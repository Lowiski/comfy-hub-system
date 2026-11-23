import 'dotenv/config'
import { z } from 'zod'

const secretSchema = z
  .string({ message: 'Secret is required in server/.env.' })
  .trim()
  .min(32, 'Use a random secret with at least 32 characters.')
  .refine((value) => !/replace|placeholder|change[-_]?me|your[-_]?secret|example/i.test(value), {
    message: 'Replace the placeholder secret with a long random value.',
  })

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().trim().default(''),
    JWT_SECRET: secretSchema,
    CSRF_SECRET: secretSchema,
    CLIENT_ORIGIN: z.string().trim().default(''),
    SEED_DEMO_DATA: z.string().trim().default(''),
    TRUST_PROXY: z.string().trim().default(''),
  })
  .refine((config) => config.JWT_SECRET !== config.CSRF_SECRET, {
    path: ['CSRF_SECRET'],
    message: 'CSRF_SECRET must be different from JWT_SECRET.',
  })
  .refine((config) => config.NODE_ENV !== 'production' || config.CLIENT_ORIGIN.length > 0, {
    path: ['CLIENT_ORIGIN'],
    message: 'CLIENT_ORIGIN is required in production.',
  })

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  CSRF_SECRET: process.env.CSRF_SECRET,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  SEED_DEMO_DATA: process.env.SEED_DEMO_DATA,
  TRUST_PROXY: process.env.TRUST_PROXY,
})

export const isProduction = env.NODE_ENV === 'production'
export const isDatabaseConfigured = env.DATABASE_URL.length > 0
