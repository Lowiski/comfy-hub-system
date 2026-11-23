import { useSyncExternalStore } from 'react'
import { notificationsApi, type ApiNotification } from './api'

type NotificationSnapshot = {
  notifications: ApiNotification[]
  count: number
  loading: boolean
}

const emptySnapshot: NotificationSnapshot = { notifications: [], count: 0, loading: true }
let snapshot: NotificationSnapshot = emptySnapshot
let timer: number | undefined
const listeners = new Set<() => void>()

function publish(next: NotificationSnapshot) {
  if (JSON.stringify(next) === JSON.stringify(snapshot)) return
  snapshot = next
  listeners.forEach((listener) => listener())
}

async function refreshNotifications() {
  try {
    const result = await notificationsApi.list()
    publish({
      notifications: result.notifications,
      count: result.count,
      loading: false,
    })
  } catch {
    publish({ notifications: [], count: 0, loading: false })
  }
}

function subscribeNotifications(callback: () => void) {
  listeners.add(callback)

  if (!timer) {
    void refreshNotifications()
    timer = window.setInterval(() => void refreshNotifications(), 2500)
  }

  const handleUser = () => {
    publish(emptySnapshot)
    void refreshNotifications()
  }

  window.addEventListener('comfyhub:user-updated', handleUser)

  return () => {
    listeners.delete(callback)
    window.removeEventListener('comfyhub:user-updated', handleUser)
    if (listeners.size === 0 && timer) {
      window.clearInterval(timer)
      timer = undefined
    }
  }
}

export function useNotifications() {
  return useSyncExternalStore(subscribeNotifications, () => snapshot, () => emptySnapshot)
}

export function refreshNotificationsNow() {
  void refreshNotifications()
}

export function notificationTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
}
