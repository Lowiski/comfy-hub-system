import type { User } from '../../db/schema'
import { listAppointments } from '../../repositories/appointment-repository'
import { listConversations } from '../../repositories/message-repository'
import { ok } from '../../utils/api-result'

export type NotificationIcon = 'message' | 'calendar'
export type NotificationTone = 'teal' | 'blue' | 'violet'

export type NotificationView = {
  id: string
  type: 'message' | 'appointment'
  title: string
  body: string
  time: string
  href: string
  icon: NotificationIcon
  tone: NotificationTone
  count: number
}

function localDateISO(value = new Date()) {
  const offset = value.getTimezoneOffset() * 60_000
  return new Date(value.getTime() - offset).toISOString().slice(0, 10)
}

function shortText(value: string, max = 110) {
  const clean = value.trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`
}

function messageHref(viewer: User, conversationId: string) {
  const base = viewer.role === 'counselor' ? '/counselor' : '/messages'
  return `${base}?conversation=${encodeURIComponent(conversationId)}`
}

function messageNotifications(viewer: User, conversations: Awaited<ReturnType<typeof listConversations>>): NotificationView[] {
  return conversations
    .filter((conversation) => conversation.unread > 0)
    .map((conversation) => ({
      id: `message-${conversation.id}`,
      type: 'message' as const,
      title: conversation.unread === 1
        ? `1 unread message from ${conversation.otherName}`
        : `${conversation.unread} unread messages from ${conversation.otherName}`,
      body: shortText(conversation.lastMessage || 'Open the conversation to read it.'),
      time: conversation.lastMessageAt ?? conversation.updatedAt,
      href: messageHref(viewer, conversation.id),
      icon: 'message' as const,
      tone: 'teal' as const,
      count: conversation.unread,
    }))
}

function appointmentNotifications(viewer: User, appointments: Awaited<ReturnType<typeof listAppointments>>): NotificationView[] {
  const today = localDateISO()

  if (viewer.role === 'counselor') {
    return appointments
      .filter((appointment) => appointment.status === 'pending' && appointment.date >= today)
      .map((appointment) => ({
        id: `booking-${appointment.id}`,
        type: 'appointment' as const,
        title: `New booking from ${appointment.studentName}`,
        body: shortText(`${appointment.topic} · ${appointment.format} · ${appointment.date} at ${appointment.time}`),
        time: appointment.createdAt,
        href: '/counselor',
        icon: 'calendar' as const,
        tone: 'violet' as const,
        count: 1,
      }))
  }

  if (viewer.role === 'student') {
    return appointments
      .filter((appointment) => appointment.status === 'confirmed' && appointment.date >= today)
      .map((appointment) => ({
        id: `confirmed-${appointment.id}`,
        type: 'appointment' as const,
        title: `Session confirmed with ${appointment.counselorName}`,
        body: shortText(`${appointment.topic} · ${appointment.format} · ${appointment.date} at ${appointment.time}`),
        time: appointment.updatedAt,
        href: '/appointment',
        icon: 'calendar' as const,
        tone: 'blue' as const,
        count: 1,
      }))
  }

  return []
}

export async function getNotificationsService(viewer: User) {
  if (viewer.role === 'admin') return ok({ notifications: [], count: 0 })

  const [conversations, appointments] = await Promise.all([
    listConversations(viewer),
    listAppointments(viewer),
  ])

  const messages = messageNotifications(viewer, conversations)
  const notifications = [
    ...messages,
    ...appointmentNotifications(viewer, appointments),
  ].sort((a, b) => Date.parse(b.time) - Date.parse(a.time))

  return ok({
    notifications,
    count: messages.reduce((total, item) => total + item.count, 0),
  })
}
