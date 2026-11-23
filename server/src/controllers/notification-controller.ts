import type { Request, Response } from 'express'
import type { User } from '../db/schema'
import { getNotificationsService } from '../services/notifications'
import { sendResult } from '../utils/api-result'

export async function listNotifications(_req: Request, res: Response) {
  sendResult(res, await getNotificationsService(res.locals.user as User))
}
