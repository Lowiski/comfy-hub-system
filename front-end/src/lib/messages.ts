
import { useSyncExternalStore } from 'react'
import { messagesApi, type ApiConversation, type ApiMessage, type ApiPerson } from './api'

export type ChatMessage = {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
  senderName: string
  senderAvatar: string | null
  createdAt: string
  readAt: string | null
  editedAt: string | null
}

export type LiveConversation = {
  id: string
  counselor: string
  counselorAvatar: string | null
  role: string
  subject: string
  unread: number
  messages: ChatMessage[]
  studentId: string
  studentName: string
  studentAvatar: string | null
  studentSchoolId: string | null
  counselorId: string
  counselorName: string
  lastMessage: string
  lastMessageAt: string | null
  updatedAt: string
}

export type MessagePerson = ApiPerson

export function formatMessageTime(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function messageDayLabel(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()

  if (same(date, today)) return 'Today'
  if (same(date, yesterday)) return 'Yesterday'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
}

export function toChatMessage(item: ApiMessage): ChatMessage {
  return {
    id: item.id,
    from: item.mine ? 'me' : 'them',
    text: item.body,
    time: formatMessageTime(item.createdAt),
    senderName: item.senderName,
    senderAvatar: item.senderAvatar,
    createdAt: item.createdAt,
    readAt: item.readAt,
    editedAt: item.editedAt,
  }
}

export function toLiveConversation(item: ApiConversation): LiveConversation {
  const role = item.otherRole === 'counselor' ? 'Guidance Counselor' : 'Student'
  return {
    id: item.id,
    counselor: item.otherName,
    counselorAvatar: item.otherAvatar,
    role,
    subject: item.subject,
    unread: item.unread,
    messages: [],
    studentId: item.studentId,
    studentName: item.studentName,
    studentAvatar: item.studentAvatar,
    studentSchoolId: item.studentSchoolId,
    counselorId: item.counselorId,
    counselorName: item.counselorName,
    lastMessage: item.lastMessage,
    lastMessageAt: item.lastMessageAt,
    updatedAt: item.updatedAt,
  }
}


export async function refreshConversations(
  activeId: string | null,
): Promise<{ conversations: LiveConversation[]; messages: ChatMessage[] }> {
  const { conversations } = await messagesApi.listConversations()
  const mapped = conversations.map(toLiveConversation)
  const targetId = activeId && mapped.some((item) => item.id === activeId)
    ? activeId
    : mapped[0]?.id ?? null

  let messages: ChatMessage[] = []
  if (targetId) {
    const result = await messagesApi.listMessages(targetId)
    messages = result.messages.map(toChatMessage)
  }

  return { conversations: mapped, messages }
}


let unreadCount = 0
let unreadTimer: number | undefined
const unreadListeners = new Set<() => void>()

async function refreshUnread() {
  try {
    const { conversations } = await messagesApi.listConversations()
    const next = conversations.reduce((total, item) => total + item.unread, 0)
    if (next !== unreadCount) {
      unreadCount = next
      unreadListeners.forEach((listener) => listener())
    }
  } catch {
    return
  }
}

function subscribeUnread(callback: () => void) {
  unreadListeners.add(callback)
  if (!unreadTimer) {
    void refreshUnread()
    unreadTimer = window.setInterval(() => void refreshUnread(), 2500)
  }
  const handleUser = () => {
    unreadCount = 0
    unreadListeners.forEach((listener) => listener())
    void refreshUnread()
  }
  window.addEventListener('comfyhub:user-updated', handleUser)
  return () => {
    unreadListeners.delete(callback)
    window.removeEventListener('comfyhub:user-updated', handleUser)
    if (unreadListeners.size === 0 && unreadTimer) {
      window.clearInterval(unreadTimer)
      unreadTimer = undefined
    }
  }
}

export function useUnreadCount() {
  return useSyncExternalStore(subscribeUnread, () => unreadCount, () => 0)
}


export function refreshUnreadNow() {
  void refreshUnread()
}
