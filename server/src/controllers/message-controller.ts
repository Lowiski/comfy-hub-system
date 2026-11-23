import type { Request, Response } from 'express'
import type { User } from '../db/schema'
import * as messageService from '../services/messages'
import type {
  CreateConversationInput,
  EditMessageInput,
  MessagesQuery,
  SendMessageInput,
} from '../schema/message-schema'
import { fail, sendResult } from '../utils/api-result'

const viewer = (res: Response) => res.locals.user as User
const input = <T>(res: Response): T => res.locals.validated as T
const param = (req: Request, name: string) => String(req.params[name] ?? '')

export async function listConversations(_req: Request, res: Response) {
  sendResult(res, await messageService.getConversationsService(viewer(res)))
}

export async function listPeople(_req: Request, res: Response) {
  sendResult(res, await messageService.getPeopleService(viewer(res)))
}

export async function createConversation(_req: Request, res: Response) {
  sendResult(res, await messageService.createConversationService(
    viewer(res),
    input<CreateConversationInput>(res),
  ))
}

export async function listMessages(req: Request, res: Response) {
  sendResult(res, await messageService.getMessagesService(
    viewer(res),
    param(req, 'id'),
    input<MessagesQuery>(res),
  ))
}

export async function sendMessage(req: Request, res: Response) {
  sendResult(res, await messageService.sendMessageService(
    viewer(res),
    param(req, 'id'),
    input<SendMessageInput>(res),
  ))
}

export async function editMessage(req: Request, res: Response) {
  sendResult(res, await messageService.editMessageService(
    viewer(res),
    param(req, 'id'),
    param(req, 'messageId'),
    input<EditMessageInput>(res),
  ))
}

export async function deleteMessage(req: Request, res: Response) {
  sendResult(res, await messageService.deleteMessageService(
    viewer(res),
    param(req, 'id'),
    param(req, 'messageId'),
  ))
}

export async function deleteConversation(req: Request, res: Response) {
  const id = param(req, 'id')
  if (!id) {
    sendResult(res, fail('VALIDATION_ERROR', 'Conversation ID is required.', 400))
    return
  }
  sendResult(res, await messageService.deleteConversationService(viewer(res), id))
}

export async function markRead(req: Request, res: Response) {
  const id = param(req, 'id')
  if (!id) {
    sendResult(res, fail('VALIDATION_ERROR', 'Conversation ID is required.', 400))
    return
  }
  sendResult(res, await messageService.markReadService(viewer(res), id))
}
