import { randomUUID } from 'node:crypto'
import type { User } from '../../db/schema'
import {
  addMessage,
  canAccessConversation,
  createConversation,
  deleteConversationRecord,
  deleteMessageRecord,
  findConversation,
  findMessageRecord,
  listConversations,
  listMessages,
  listPeople,
  markConversationRead,
  updateMessageRecord,
} from '../../repositories/message-repository'
import type {
  CreateConversationInput,
  EditMessageInput,
  MessagesQuery,
  SendMessageInput,
} from '../../schema/message-schema'
import { fail, ok, type ApiResult } from '../../utils/api-result'

async function requireTarget(viewer: User, targetId: string): Promise<User | null> {
  const { findById } = await import('../../repositories/user-repository')
  const target = await findById(targetId)
  if (!target || target.id === viewer.id) return null

  const expected = viewer.role === 'counselor' ? 'student' : 'counselor'
  return target.role === expected ? target : null
}

export async function getConversationsService(viewer: User) {
  return ok({ conversations: await listConversations(viewer) })
}

export async function getPeopleService(viewer: User) {
  return ok({ people: await listPeople(viewer) })
}

export async function createConversationService(viewer: User, input: CreateConversationInput) {
  if (viewer.role !== 'student' && viewer.role !== 'counselor') {
    return fail('ROLE_NOT_ALLOWED', 'Use a student or counselor account to start a conversation.', 403)
  }

  const target = await requireTarget(viewer, input.counselorId)
  if (!target) return fail('PERSON_NOT_FOUND', 'That account is not available for messaging.', 404)

  const studentId = viewer.role === 'student' ? viewer.id : target.id
  const counselorId = viewer.role === 'counselor' ? viewer.id : target.id
  const id = randomUUID()

  await createConversation({
    id,
    subject: input.subject,
    studentId,
    counselorId,
    senderId: viewer.id,
    body: input.body,
  })

  return ok({ conversationId: id })
}

async function accessibleConversation(id: string, viewer: User) {
  const conversation = await findConversation(id)
  if (!conversation || !canAccessConversation(conversation, viewer)) return null
  return conversation
}

export async function getMessagesService(
  viewer: User,
  conversationId: string,
  query: MessagesQuery,
) {
  const conversation = await accessibleConversation(conversationId, viewer)
  if (!conversation) return fail('CONVERSATION_NOT_FOUND', 'Conversation not found.', 404)

  return ok({ messages: await listMessages(conversationId, viewer.id, query.after) })
}

export async function sendMessageService(
  viewer: User,
  conversationId: string,
  input: SendMessageInput,
): Promise<ApiResult<{ message: Awaited<ReturnType<typeof addMessage>> }>> {
  if (viewer.role === 'admin') {
    return fail('ADMIN_READ_ONLY', 'Admin accounts can review conversations but cannot send messages.', 403)
  }

  const conversation = await accessibleConversation(conversationId, viewer)
  if (!conversation) return fail('CONVERSATION_NOT_FOUND', 'Conversation not found.', 404)

  return ok({ message: await addMessage(conversationId, viewer.id, input.body) })
}

export async function editMessageService(
  viewer: User,
  conversationId: string,
  messageId: string,
  input: EditMessageInput,
) {
  if (viewer.role === 'admin') {
    return fail('ADMIN_READ_ONLY', 'Admin accounts cannot edit messages.', 403)
  }

  const conversation = await accessibleConversation(conversationId, viewer)
  if (!conversation) return fail('CONVERSATION_NOT_FOUND', 'Conversation not found.', 404)

  const message = await findMessageRecord(conversationId, messageId)
  if (!message || message.senderId !== viewer.id) {
    return fail('MESSAGE_NOT_FOUND', 'You can only edit your own messages.', 404)
  }

  const updated = await updateMessageRecord(conversationId, messageId, input.body, viewer.id)
  return ok({ message: updated })
}

export async function deleteMessageService(
  viewer: User,
  conversationId: string,
  messageId: string,
) {
  if (viewer.role === 'admin') {
    return fail('ADMIN_READ_ONLY', 'Admin accounts cannot delete messages.', 403)
  }

  const conversation = await accessibleConversation(conversationId, viewer)
  if (!conversation) return fail('CONVERSATION_NOT_FOUND', 'Conversation not found.', 404)

  const message = await findMessageRecord(conversationId, messageId)
  if (!message || message.senderId !== viewer.id) {
    return fail('MESSAGE_NOT_FOUND', 'You can only delete your own messages.', 404)
  }

  const deleted = await deleteMessageRecord(conversationId, messageId)
  if (!deleted) return fail('MESSAGE_NOT_FOUND', 'Message not found.', 404)
  return ok({ ok: true as const })
}

export async function deleteConversationService(viewer: User, conversationId: string) {
  if (viewer.role === 'admin') {
    return fail('ADMIN_READ_ONLY', 'Admin accounts cannot delete conversations.', 403)
  }

  const conversation = await accessibleConversation(conversationId, viewer)
  if (!conversation) return fail('CONVERSATION_NOT_FOUND', 'Conversation not found.', 404)

  await deleteConversationRecord(conversationId)
  return ok({ ok: true as const })
}

export async function markReadService(viewer: User, conversationId: string) {
  if (viewer.role === 'admin') {
    return fail('ADMIN_READ_ONLY', 'Admin accounts cannot change unread status.', 403)
  }

  const conversation = await accessibleConversation(conversationId, viewer)
  if (!conversation) return fail('CONVERSATION_NOT_FOUND', 'Conversation not found.', 404)

  await markConversationRead(conversationId, viewer.id)
  return ok({ ok: true as const })
}
