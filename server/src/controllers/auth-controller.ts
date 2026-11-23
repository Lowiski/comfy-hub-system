import type { Request, Response } from 'express'
import type {
  BirthdayInput,
  LoginInput,
  ProfileInput,
  ResetPasswordInput,
  SchoolIdInput,
  SignupInput,
} from '../schema/auth-schema'
import * as authService from '../services/auth'
import { sendResult } from '../utils/api-result'

const input = <T>(res: Response): T => res.locals.validated as T

export function csrf(req: Request, res: Response) {
  sendResult(res, authService.getCsrfTokenService(req, res))
}

export async function login(req: Request, res: Response) {
  sendResult(res, await authService.loginService(req, res, input<LoginInput>(res)))
}

export async function lookupSchoolId(req: Request, res: Response) {
  sendResult(res, await authService.lookupSchoolIdService(input<SchoolIdInput>(res)))
}

export async function verifyBirthday(req: Request, res: Response) {
  sendResult(res, await authService.verifyBirthdayService(input<BirthdayInput>(res)))
}

export async function resetPassword(req: Request, res: Response) {
  sendResult(res, await authService.resetPasswordService(req, res, input<ResetPasswordInput>(res)))
}

export function session(_req: Request, res: Response) {
  sendResult(res, authService.getUserSessionService(res))
}

export async function refresh(req: Request, res: Response) {
  sendResult(res, await authService.refreshTokenService(req, res))
}

export async function logout(req: Request, res: Response) {
  sendResult(res, await authService.logoutService(req, res))
}

export async function signup(req: Request, res: Response) {
  sendResult(res, await authService.signupService(input<SignupInput>(res)))
}

export async function updateProfile(_req: Request, res: Response) {
  sendResult(res, await authService.updateProfileService(res.locals.user, input<ProfileInput>(res)))
}
