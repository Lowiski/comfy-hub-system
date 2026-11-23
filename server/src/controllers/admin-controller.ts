import type { Request, Response } from 'express'
import type { AdminAccountInput, AdminBulkAccountInput } from '../schema/admin-schema'
import * as adminService from '../services/admin-service'
import { sendResult } from '../utils/api-result'

const input = <T>(res: Response): T => res.locals.validated as T

export async function listAccounts(_req: Request, res: Response) {
  sendResult(res, await adminService.listAccountsService())
}

export async function createAccount(req: Request, res: Response) {
  sendResult(res, await adminService.createAccountService(input<AdminAccountInput>(res)))
}

export async function bulkCreateAccounts(_req: Request, res: Response) {
  sendResult(res, await adminService.bulkCreateAccountsService(input<AdminBulkAccountInput>(res).accounts))
}

export async function updateAccount(req: Request, res: Response) {
  sendResult(res, await adminService.updateAccountService(String(req.params.id), input<AdminAccountInput>(res)))
}

export async function deleteAccount(req: Request, res: Response) {
  sendResult(res, await adminService.deleteAccountService(String(req.params.id), res.locals.user.id))
}
