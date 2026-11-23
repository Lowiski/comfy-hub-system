import type { Response } from 'express'

export type ApiError = {
  code: string
  message: string
}

export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiFailure = {
  success: false
  status: number
  error: ApiError
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data }
}

export function fail(code: string, message: string, status = 400): ApiFailure {
  return { success: false, status, error: { code, message } }
}

export function sendResult<T>(res: Response, result: ApiResult<T>) {
  if (result.success) {
    return res.status(200).json(result)
  }

  return res.status(result.status).json({
    success: false,
    error: result.error,
  })
}
