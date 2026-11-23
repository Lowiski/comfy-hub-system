import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

const configuredBaseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
const normalizedBaseURL = (configuredBaseURL || '/api').replace(/\/+$/, '')
const baseURL = normalizedBaseURL.endsWith('/api') ? normalizedBaseURL : `${normalizedBaseURL}/api`

type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error?: { code?: string; message?: string } }

type RetryConfig = InternalAxiosRequestConfig & {
  _csrfRetried?: boolean
  _skipCsrfRetry?: boolean
  _refreshRetried?: boolean
}

type RequestConfig = AxiosRequestConfig & RetryConfig

const CSRF_KEY = 'comfyhub.csrfToken'
const CSRF_COOKIE = 'comfyhub_csrf_token'
const CSRF_TOKEN_PATTERN = /^v1\.[a-f0-9]{32}\.[a-f0-9]{32}$/
const WRITE_METHODS = new Set(['post', 'put', 'patch', 'delete'])
const REFRESHABLE_ERRORS = new Set(['UNAUTHORIZED', 'INVALID_TOKEN', 'SESSION_EXPIRED'])
const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/reset-password',
  '/auth/signup',
]

let csrfToken: string | null = null
let csrfRequest: Promise<string> | null = null
let refreshPromise: Promise<boolean> | null = null

export class ApiRequestError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
  }
}

function isAuthEndpoint(url = '') {
  return AUTH_ENDPOINTS.some((endpoint) => url === endpoint || url.endsWith(endpoint))
}

function isWriteMethod(method?: string) {
  return !!method && WRITE_METHODS.has(method.toLowerCase())
}

function cacheCsrfToken(token: string) {
  window.sessionStorage.setItem(CSRF_KEY, token)
}

export function clearCsrfToken() {
  csrfToken = null
  csrfRequest = null
  window.sessionStorage.removeItem(CSRF_KEY)
  window.document.cookie = `${CSRF_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`
}

function readCsrfCookie() {
  const match = window.document.cookie.match(/(?:^|;\s*)comfyhub_csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function getErrorDetail(payload: unknown) {
  if (!payload || typeof payload !== 'object') return undefined
  const envelope = payload as ApiEnvelope<unknown>
  return envelope.success ? undefined : envelope.error
}

function toApiError(error: AxiosError<ApiEnvelope<unknown>>) {
  if (!error.response) {
    return new ApiRequestError('Cannot reach the server. Make sure the API is running.', 'SERVER_OFFLINE')
  }

  const detail = getErrorDetail(error.response.data)
  return new ApiRequestError(
    detail?.message || 'The request could not be completed.',
    detail?.code,
  )
}

async function fetchCsrfToken() {
  let response
  try {
    response = await axios.get<ApiEnvelope<{ csrfToken: string }>>(`${baseURL}/auth/csrf`, {
      withCredentials: true,
    })
  } catch (cause) {
    if (axios.isAxiosError(cause) && cause.response) {
      throw new ApiRequestError('Could not start a secure session. Please refresh and try again.', 'CSRF_FAILED')
    }
    throw new ApiRequestError('Cannot reach the server. Make sure the API is running.', 'SERVER_OFFLINE')
  }

  const payload = response.data
  if (!payload?.success) {
    const detail = getErrorDetail(payload)
    throw new ApiRequestError(
      detail?.message || 'Could not start a secure session. Please refresh and try again.',
      detail?.code || 'CSRF_FAILED',
    )
  }

  const token = payload.data?.csrfToken
  if (!token || !CSRF_TOKEN_PATTERN.test(token)) {
    throw new ApiRequestError('Could not start a secure session. Please refresh and try again.', 'CSRF_FAILED')
  }

  csrfToken = token
  cacheCsrfToken(token)
  return token
}

function getCsrfToken() {
  if (csrfToken && CSRF_TOKEN_PATTERN.test(csrfToken)) return Promise.resolve(csrfToken)

  const cookieToken = readCsrfCookie()
  if (cookieToken && CSRF_TOKEN_PATTERN.test(cookieToken)) {
    csrfToken = cookieToken
    cacheCsrfToken(cookieToken)
    return Promise.resolve(cookieToken)
  }

  if (!csrfRequest) {
    csrfRequest = fetchCsrfToken().finally(() => {
      csrfRequest = null
    })
  }
  return csrfRequest
}

export async function ensureCsrfToken() {
  await getCsrfToken()
}

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

http.interceptors.request.use(async (config) => {
  if (isWriteMethod(config.method)) {
    const token = await getCsrfToken()
    config.headers.set('x-csrf-token', token)
  }
  return config
})

async function performRefresh() {
  try {
    await http.post('/auth/refresh', {}, { _skipCsrfRetry: true } as RequestConfig)
    return true
  } catch {
    clearCsrfToken()
    return false
  }
}

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

http.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiEnvelope<unknown>
    if (!payload || typeof payload !== 'object' || !('success' in payload)) {
      throw new ApiRequestError(
        'The API returned an unexpected response. Check VITE_API_BASE_URL.',
        'BAD_API_RESPONSE',
      )
    }

    if (!payload.success) {
      const detail = getErrorDetail(payload)
      throw new ApiRequestError(
        detail?.message || 'The request could not be completed.',
        detail?.code,
      )
    }

    response.data = payload.data as never

    if (isAuthEndpoint(response.config.url)) clearCsrfToken()
    return response
  },
  async (error: unknown) => {
    const axiosError = error as AxiosError<ApiEnvelope<unknown>>
    const config = axiosError.config as RetryConfig | undefined

    if (!axiosError.response || !config) throw toApiError(axiosError)

    const detail = getErrorDetail(axiosError.response.data)
    const status = axiosError.response.status

    if (
      status === 403
      && detail?.code === 'CSRF_INVALID'
      && isWriteMethod(config.method)
      && !config._csrfRetried
      && !config._skipCsrfRetry
    ) {
      clearCsrfToken()
      config._csrfRetried = true
      return http.request(config)
    }

    if (
      status === 401
      && detail?.code
      && REFRESHABLE_ERRORS.has(detail.code)
      && !isAuthEndpoint(config.url)
      && !config._refreshRetried
    ) {
      config._refreshRetried = true
      if (!(await refreshSession())) {
        window.dispatchEvent(new Event('auth:expired'))
        throw toApiError(axiosError)
      }
      return http.request(config)
    }

    throw toApiError(axiosError)
  },
)

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
  refreshed = false,
): Promise<T> {
  const requestHeaders = new Headers(init.headers)
  const headers: Record<string, string> = {}
  requestHeaders.forEach((value, key) => {
    headers[key] = value
  })

  const config: RequestConfig = {
    url: path,
    method: (init.method || 'GET').toLowerCase() as AxiosRequestConfig['method'],
    data: init.body ?? undefined,
    headers: AxiosHeaders.from(headers),
    signal: init.signal ?? undefined,
    withCredentials: true,
    _csrfRetried: !retry,
    _refreshRetried: refreshed,
  }

  const response = await http.request<ApiEnvelope<T>>(config)
  return response.data as T
}
