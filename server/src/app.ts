import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import { env } from './config/env'
import { csrfProtection } from './middlewares/csrf-middleware'
import routes from './routes'
import { fail, sendResult } from './utils/api-result'

const app = express()
app.set('trust proxy', env.TRUST_PROXY === 'true' ? 1 : false)

const distDir = fileURLToPath(new URL('../../front-end/dist', import.meta.url))

const localOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
const privateLanOrigin = /^https?:\/\/(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|169\.254\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})(?::\d+)?$/
const allowedOrigins = env.CLIENT_ORIGIN
  ? env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null

app.disable('x-powered-by')
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'connect-src': ["'self'", 'data:'],
      'script-src': ["'self'", "'wasm-unsafe-eval'"],
      'worker-src': ["'self'"],
    },
  },
}))
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins?.includes(origin)) return callback(null, origin)
    // Local/tunnel origins are only accepted while developing; production must set CLIENT_ORIGIN.
    if (env.NODE_ENV !== 'production' && (localOrigin.test(origin) || privateLanOrigin.test(origin))) {
      return callback(null, origin)
    }
    if (env.NODE_ENV !== 'production' && /^https?:\/\//.test(origin)) return callback(null, origin)
    return callback(Object.assign(new Error('Origin is not allowed by CORS.'), { status: 403 }))
  },
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())
app.use(csrfProtection)

app.use('/api', routes)

app.use(express.static(distDir))
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/') || path.extname(req.path)) {
    next()
    return
  }
  res.sendFile(path.join(distDir, 'index.html'), (error) => {
    if (error) next()
  })
})

app.use((_req, res) => {
  sendResult(res, fail('NOT_FOUND', 'Endpoint not found.', 404))
})

const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  void next
  if (res.headersSent) return

  const status = typeof error?.status === 'number' && error.status >= 400 && error.status < 500
    ? error.status
    : 500

  if (status === 500) console.error(error)

  if (status === 413) {
    sendResult(res, fail('PAYLOAD_TOO_LARGE', 'The request is too large. Import up to 200 accounts at a time.', 413))
    return
  }
  if (status === 400) {
    sendResult(res, fail('BAD_REQUEST', 'The request could not be read.', 400))
    return
  }
  if (status === 403) {
    sendResult(res, fail('ORIGIN_NOT_ALLOWED', 'Origin is not allowed.', 403))
    return
  }
  sendResult(res, fail('INTERNAL_ERROR', 'Something went wrong on the server.', 500))
}
app.use(errorHandler)

export { app }
