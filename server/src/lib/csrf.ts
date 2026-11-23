import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { env } from '../config/env'

const TOKEN_PREFIX = 'v1'
const PAYLOAD_BYTES = 16
const SIGNATURE_BYTES = 16
const PAYLOAD_LENGTH = PAYLOAD_BYTES * 2
const SIGNATURE_LENGTH = SIGNATURE_BYTES * 2
const HEX_PATTERN = /^[a-f0-9]+$/

function signPayload(payload: string) {
  return createHmac('sha256', env.CSRF_SECRET)
    .update('comfyhub:csrf:v1:')
    .update(payload)
    .digest('hex')
    .slice(0, SIGNATURE_LENGTH)
}

function parseToken(value: unknown) {
  if (typeof value !== 'string') return null

  const parts = value.split('.')
  if (parts.length !== 3 || parts[0] !== TOKEN_PREFIX) return null

  const [, payload, signature] = parts
  if (payload.length !== PAYLOAD_LENGTH || signature.length !== SIGNATURE_LENGTH) return null
  if (!HEX_PATTERN.test(payload) || !HEX_PATTERN.test(signature)) return null

  return { payload, signature }
}

function signatureMatches(payload: string, signature: string) {
  const expected = Buffer.from(signPayload(payload), 'hex')
  const actual = Buffer.from(signature, 'hex')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function generateCsrfToken() {
  const payload = randomBytes(PAYLOAD_BYTES).toString('hex')
  return `${TOKEN_PREFIX}.${payload}.${signPayload(payload)}`
}

export function isSignedCsrfToken(value: unknown): value is string {
  const parsed = parseToken(value)
  return parsed !== null && signatureMatches(parsed.payload, parsed.signature)
}

export function isValidCsrfToken(cookieValue: unknown, headerValue: unknown) {
  if (!isSignedCsrfToken(cookieValue)) return false
  if (typeof headerValue !== 'string' || headerValue.length !== cookieValue.length) return false

  return timingSafeEqual(Buffer.from(cookieValue), Buffer.from(headerValue))
}
