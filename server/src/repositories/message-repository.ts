import { and, asc, desc, eq, gt, inArray, isNull, ne, or } from 'drizzle-orm'
import { isDatabaseConfigured } from '../config/env'
import { getDb } from '../db'
import { memory } from '../db/memory'
import {
  conversations,
  messages,
  users,
  type ChatMessage,
  type Conversation,
  type User,
} from '../db/schema'

export type ConversationSummary = {
  id: string
  subject: string
  studentId: string
  studentName: string
  studentAvatar: string | null
  studentSchoolId: string | null
  counselorId: string
  counselorName: string
  counselorAvatar: string | null
  otherName: string
  otherAvatar: string | null
  otherRole: string
  lastMessage: string
  lastMessageAt: string | null
  unread: number
  updatedAt: string
}

export type MessageView = {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar: string | null
  mine: boolean
  body: string
  createdAt: string
  readAt: string | null
  editedAt: string | null
}

export type PersonView = {
  id: string
  name: string
  role: User['role']
  schoolId: string | null
  department: string | null
  avatar: string | null
}

export function canAccessConversation(conversation: Conversation, viewer: User) {
  return viewer.role === 'admin'
    || conversation.studentId === viewer.id
    || conversation.counselorId === viewer.id
}

async function findUserById(id: string): Promise<User | null> {
  if (!isDatabaseConfigured) return memory.users.find((user) => user.id === id) ?? null
  const rows = await getDb().select().from(users).where(eq(users.id, id)).limit(1)
  return rows[0] ?? null
}

export async function listConversations(viewer: User): Promise<ConversationSummary[]> {
  let list: Conversation[]
  if (!isDatabaseConfigured) {
    list = memory.conversations
      .filter((item) => canAccessConversation(item, viewer))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  } else {
    const condition = viewer.role === 'admin'
      ? undefined
      : or(eq(conversations.studentId, viewer.id), eq(conversations.counselorId, viewer.id))
    list = await getDb()
      .select()
      .from(conversations)
      .where(condition)
      .orderBy(desc(conversations.updatedAt))
  }

  if (list.length === 0) return []

  const ids = list.map((item) => item.id)
  let thread: ChatMessage[]
  if (!isDatabaseConfigured) {
    thread = memory.messages
      .filter((item) => ids.includes(item.conversationId))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  } else {
    thread = await getDb()
      .select()
      .from(messages)
      .where(inArray(messages.conversationId, ids))
      .orderBy(asc(messages.createdAt))
  }

  const userIds = [...new Set(list.flatMap((item) => [item.studentId, item.counselorId]))]
  const found = await Promise.all(userIds.map((id) => findUserById(id)))
  const userMap = new Map(found.filter((user): user is User => !!user).map((user) => [user.id, user]))

  return list.map((conversation) => {
    const messagesInThread = thread.filter((item) => item.conversationId === conversation.id)
    const last = messagesInThread[messagesInThread.length - 1]
    const student = userMap.get(conversation.studentId)
    const counselor = userMap.get(conversation.counselorId)
    const other = viewer.id === conversation.studentId ? counselor : student
    const unread = messagesInThread.filter(
      (item) => item.senderId !== viewer.id && !item.readAt,
    ).length

    return {
      id: conversation.id,
      subject: conversation.subject,
      studentId: conversation.studentId,
      studentName: student?.name ?? 'Student',
      studentAvatar: student?.avatar ?? null,
      studentSchoolId: student?.schoolId ?? null,
      counselorId: conversation.counselorId,
      counselorName: counselor?.name ?? 'Counselor',
      counselorAvatar: counselor?.avatar ?? null,
      otherName: other?.name ?? student?.name ?? 'Counselor',
      otherAvatar: other?.avatar ?? student?.avatar ?? null,
      otherRole: other?.role ?? 'student',
      lastMessage: last?.body ?? '',
      lastMessageAt: last ? last.createdAt.toISOString() : null,
      unread,
      updatedAt: conversation.updatedAt.toISOString(),
    }
  })
}

export async function findConversation(id: string): Promise<Conversation | null> {
  if (!isDatabaseConfigured) return memory.conversations.find((item) => item.id === id) ?? null
  const rows = await getDb().select().from(conversations).where(eq(conversations.id, id)).limit(1)
  return rows[0] ?? null
}

export async function createConversation(input: {
  id: string
  subject: string
  studentId: string
  counselorId: string
  senderId: string
  body: string
}): Promise<Conversation> {
  const now = new Date()
  const conversation: Conversation = {
    id: input.id,
    subject: input.subject,
    studentId: input.studentId,
    counselorId: input.counselorId,
    createdAt: now,
    updatedAt: now,
  }
  const firstMessage: ChatMessage = {
    id: `${input.id}-m1`,
    conversationId: input.id,
    senderId: input.senderId,
    body: input.body,
    createdAt: now,
    readAt: null,
    editedAt: null,
  }

  if (!isDatabaseConfigured) {
    memory.conversations.unshift(conversation)
    memory.messages.push(firstMessage)
    return conversation
  }

  await getDb().insert(conversations).values(conversation)
  await getDb().insert(messages).values(firstMessage)
  return conversation
}

export async function listMessages(
  conversationId: string,
  viewerId: string,
  after?: string,
): Promise<MessageView[]> {
  let thread: ChatMessage[]
  if (!isDatabaseConfigured) {
    thread = memory.messages
      .filter((item) => item.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  } else {
    const condition = after
      ? and(eq(messages.conversationId, conversationId), gt(messages.createdAt, new Date(after)))
      : eq(messages.conversationId, conversationId)
    thread = await getDb().select().from(messages).where(condition).orderBy(asc(messages.createdAt))
  }

  const senderIds = [...new Set(thread.map((item) => item.senderId))]
  const found = await Promise.all(senderIds.map((id) => findUserById(id)))
  const senderMap = new Map(found.filter((user): user is User => !!user).map((user) => [user.id, user]))

  return thread.map((item) => ({
    id: item.id,
    conversationId: item.conversationId,
    senderId: item.senderId,
    senderName: senderMap.get(item.senderId)?.name ?? 'Unknown',
    senderAvatar: senderMap.get(item.senderId)?.avatar ?? null,
    mine: item.senderId === viewerId,
    body: item.body,
    createdAt: item.createdAt.toISOString(),
    readAt: item.readAt ? item.readAt.toISOString() : null,
    editedAt: item.editedAt ? item.editedAt.toISOString() : null,
  }))
}

export async function addMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<MessageView> {
  const now = new Date()
  const message: ChatMessage = {
    id: `${conversationId}-${now.getTime()}-${Math.random().toString(16).slice(2)}`,
    conversationId,
    senderId,
    body,
    createdAt: now,
    readAt: null,
    editedAt: null,
  }

  if (!isDatabaseConfigured) {
    memory.messages.push(message)
    const conversation = memory.conversations.find((item) => item.id === conversationId)
    if (conversation) conversation.updatedAt = now
  } else {
    await getDb().insert(messages).values(message)
    await getDb()
      .update(conversations)
      .set({ updatedAt: now })
      .where(eq(conversations.id, conversationId))
  }

  const sender = await findUserById(senderId)
  return {
    id: message.id,
    conversationId,
    senderId,
    senderName: sender?.name ?? 'Unknown',
    senderAvatar: sender?.avatar ?? null,
    mine: true,
    body,
    createdAt: now.toISOString(),
    readAt: null,
    editedAt: null,
  }
}

export async function findMessageRecord(conversationId: string, messageId: string): Promise<ChatMessage | null> {
  if (!isDatabaseConfigured) {
    return memory.messages.find(
      (item) => item.conversationId === conversationId && item.id === messageId,
    ) ?? null
  }

  const rows = await getDb()
    .select()
    .from(messages)
    .where(and(eq(messages.conversationId, conversationId), eq(messages.id, messageId)))
    .limit(1)
  return rows[0] ?? null
}

async function toMessageView(item: ChatMessage, viewerId: string): Promise<MessageView> {
  const sender = await findUserById(item.senderId)
  return {
    id: item.id,
    conversationId: item.conversationId,
    senderId: item.senderId,
    senderName: sender?.name ?? 'Unknown',
    senderAvatar: sender?.avatar ?? null,
    mine: item.senderId === viewerId,
    body: item.body,
    createdAt: item.createdAt.toISOString(),
    readAt: item.readAt ? item.readAt.toISOString() : null,
    editedAt: item.editedAt ? item.editedAt.toISOString() : null,
  }
}

export async function updateMessageRecord(
  conversationId: string,
  messageId: string,
  body: string,
  viewerId: string,
): Promise<MessageView | null> {
  const now = new Date()
  if (!isDatabaseConfigured) {
    const item = memory.messages.find(
      (entry) => entry.conversationId === conversationId && entry.id === messageId,
    )
    if (!item) return null
    item.body = body
    item.editedAt = now
    return toMessageView(item, viewerId)
  }

  const rows = await getDb()
    .update(messages)
    .set({ body, editedAt: now })
    .where(and(eq(messages.conversationId, conversationId), eq(messages.id, messageId)))
    .returning()
  const item = rows[0]
  return item ? toMessageView(item, viewerId) : null
}

export async function deleteMessageRecord(conversationId: string, messageId: string): Promise<boolean> {
  if (!isDatabaseConfigured) {
    const before = memory.messages.length
    memory.messages = memory.messages.filter(
      (item) => !(item.conversationId === conversationId && item.id === messageId),
    )
    return memory.messages.length < before
  }

  const rows = await getDb()
    .delete(messages)
    .where(and(eq(messages.conversationId, conversationId), eq(messages.id, messageId)))
    .returning({ id: messages.id })
  return rows.length > 0
}

export async function deleteConversationRecord(conversationId: string) {
  if (!isDatabaseConfigured) {
    memory.messages = memory.messages.filter((item) => item.conversationId !== conversationId)
    memory.conversations = memory.conversations.filter((item) => item.id !== conversationId)
    return
  }

  await getDb().delete(conversations).where(eq(conversations.id, conversationId))
}

export async function markConversationRead(conversationId: string, viewerId: string) {
  if (!isDatabaseConfigured) {
    memory.messages.forEach((item) => {
      if (item.conversationId === conversationId && item.senderId !== viewerId && !item.readAt) {
        item.readAt = new Date()
      }
    })
    return
  }

  await getDb()
    .update(messages)
    .set({ readAt: new Date() })
    .where(and(
      eq(messages.conversationId, conversationId),
      ne(messages.senderId, viewerId),
      isNull(messages.readAt),
    ))
}

export async function listPeople(viewer: User): Promise<PersonView[]> {
  // Admin monitors conversations but never appears as a chat participant.
  if (viewer.role === 'admin') return []

  let list: User[]
  if (!isDatabaseConfigured) {
    list = memory.users
  } else {
    list = await getDb().select().from(users)
  }

  // Students message counselors; counselors message students.
  const role: User['role'] = viewer.role === 'student' ? 'counselor' : 'student'
  return list
    .filter((item) => item.id !== viewer.id && item.role === role)
    .map((item) => ({
      id: item.id,
      name: item.name,
      role: item.role,
      schoolId: item.schoolId,
      department: item.department,
      avatar: item.avatar ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
