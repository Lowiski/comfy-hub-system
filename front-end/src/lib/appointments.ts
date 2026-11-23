import { useSyncExternalStore } from 'react'
import type { IconName } from '@/components/ui'
import { appointmentsApi, type ApiAppointment, type ApiCounselor } from './api'

export type AppointmentsSnapshot = {
  appointments: ApiAppointment[]
  counselors: ApiCounselor[]
  loading: boolean
}

const emptySnapshot: AppointmentsSnapshot = { appointments: [], counselors: [], loading: true }
let snapshot: AppointmentsSnapshot = emptySnapshot
let timer: number | undefined
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export async function refreshAppointments() {
  try {
    const [appointmentResult, counselorResult] = await Promise.all([
      appointmentsApi.list(),
      appointmentsApi.counselors(),
    ])
    const next: AppointmentsSnapshot = {
      appointments: appointmentResult.appointments,
      counselors: counselorResult.counselors,
      loading: false,
    }
    if (JSON.stringify(next) !== JSON.stringify(snapshot)) {
      snapshot = next
      emit()
    }
  } catch {
    if (snapshot.loading) {
      snapshot = { ...snapshot, loading: false }
      emit()
    }
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  if (!timer) {
    void refreshAppointments()
    timer = window.setInterval(() => void refreshAppointments(), 5000)
  }
  const handleUser = () => {
    snapshot = emptySnapshot
    emit()
    void refreshAppointments()
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

function getSnapshot() {
  return snapshot
}

export function useAppointments() {
  return useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot)
}

export function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function addDaysISO(days: number) {
  const now = new Date()
  now.setDate(now.getDate() + days)
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function isUpcoming(item: ApiAppointment) {
  return item.status !== 'cancelled' && item.status !== 'completed' && item.date >= todayISO()
}

export function formatAppointmentDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  }).format(parsed)
}

export const appointmentStatusLabels: Record<ApiAppointment['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const appointmentFormatIcons: Record<'Online' | 'In person', IconName> = {
  Online: 'eye',
  'In person': 'location',
}

export function appointmentDateParts(value: string) {
  const parsed = new Date(`${value}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return { month: '—', day: '--', weekday: 'Date' }
  return {
    month: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(parsed),
    day: new Intl.DateTimeFormat(undefined, { day: 'numeric' }).format(parsed),
    weekday: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(parsed),
  }
}
