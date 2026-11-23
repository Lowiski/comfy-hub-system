import { useState } from 'react'
import type { FormEvent } from 'react'
import { ApiRequestError, appointmentsApi, type ApiAppointment } from '@/lib/api'
import {
  addDaysISO,
  formatAppointmentDate,
  isUpcoming,
  refreshAppointments,
  todayISO,
  useAppointments,
} from '@/lib/appointments'
import { useCurrentUser } from '@/lib/data'
import { useTimedFlag } from '@/hooks/useTimedFlag'

export const appointmentTimes = ['8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']
export const appointmentFormats = ['Online', 'In person'] as const
export const appointmentTopics = ['Academic stress', 'Anxiety or worry', 'Friendships', 'Family', 'Sleep', 'Self-esteem', 'Grief or loss', 'Something else']

export type AppointmentFilter = 'upcoming' | 'past' | 'cancelled'
export type AppointmentConfirm = {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
}


export function useAppointmentBooking() {
  const user = useCurrentUser()
  const { appointments, counselors, loading } = useAppointments()
  const [counselorId, setCounselorId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:30 AM')
  const [format, setFormat] = useState<(typeof appointmentFormats)[number]>('Online')
  const [topic, setTopic] = useState(appointmentTopics[0])
  const [notes, setNotes] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming')
  const [error, setError] = useState('')
  const [success, flashSuccess] = useTimedFlag('', 6000)
  const [confirm, setConfirm] = useState<AppointmentConfirm | null>(null)
  const selectedCounselorId = counselorId || counselors[0]?.id || ''

  const mine = appointments
    .filter((item) => item.studentId === user?.id)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))

  const counts: Record<AppointmentFilter, number> = {
    upcoming: mine.filter(isUpcoming).length,
    past: mine.filter((item) => !isUpcoming(item) && item.status !== 'cancelled').length,
    cancelled: mine.filter((item) => item.status === 'cancelled').length,
  }

  const visible = mine.filter((item) => {
    if (filter === 'cancelled') return item.status === 'cancelled'
    if (filter === 'upcoming') return isUpcoming(item)
    return !isUpcoming(item) && item.status !== 'cancelled'
  })

  const counselor = counselors.find((item) => item.id === selectedCounselorId)
  const bookedSlots = new Set(
    mine
      .filter((item) => item.id !== bookingId && item.counselorId === selectedCounselorId && item.date === date && item.status !== 'cancelled')
      .map((item) => item.time),
  )

  const quickDates = [
    { label: 'Today', value: todayISO() },
    { label: 'Tomorrow', value: addDaysISO(1) },
    { label: 'Next week', value: addDaysISO(7) },
  ]

  function resetForm() {
    setDate('')
    setNotes('')
    setTime('10:30 AM')
    setFormat('Online')
    setTopic(appointmentTopics[0])
    setBookingId('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedCounselorId) {
      setError('Choose a counselor from the list.')
      return
    }
    if (!date || date < todayISO()) {
      setError('Please choose a date from today onwards.')
      return
    }

    setError('')
    try {
      const payload = { counselorId: selectedCounselorId, date, time, format, topic, notes: notes.trim() }
      if (bookingId) {
        await appointmentsApi.update(bookingId, payload)
        flashSuccess(`Your session with ${counselor?.name ?? 'your counselor'} has been updated.`)
      } else {
        await appointmentsApi.create(payload)
        flashSuccess(`Your ${format.toLowerCase()} session with ${counselor?.name ?? 'your counselor'} is requested for ${formatAppointmentDate(date)} at ${time}. Your counselor will review it.`)
      }
      resetForm()
      setFilter('upcoming')
      void refreshAppointments()
    } catch (cause) {
      setError(cause instanceof ApiRequestError ? cause.message : 'Could not save your appointment. Please try again.')
    }
  }

  function handleReschedule(item: ApiAppointment) {
    setBookingId(item.id)
    setCounselorId(item.counselorId)
    setDate(item.date)
    setTime(item.time)
    setFormat(item.format)
    setTopic(appointmentTopics.includes(item.topic) ? item.topic : appointmentTopics[0])
    setNotes(item.notes ?? '')
    setError('')
    flashSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function askCancel(item: ApiAppointment) {
    setConfirm({
      title: 'Cancel this session?',
      message: `${formatAppointmentDate(item.date)} at ${item.time} with ${item.counselorName}. Your counselor will see it as cancelled.`,
      confirmLabel: 'Cancel session',
      onConfirm: () => void cancelAppointment(item),
    })
  }

  async function cancelAppointment(item: ApiAppointment) {
    try {
      await appointmentsApi.update(item.id, { status: 'cancelled' })
      void refreshAppointments()
    } catch (cause) {
      setError(cause instanceof ApiRequestError ? cause.message : 'Could not cancel that session.')
    } finally {
      setConfirm(null)
    }
  }

  return {
    appointments,
    counselors,
    loading,
    counselorId: selectedCounselorId,
    setCounselorId,
    date,
    setDate,
    time,
    setTime,
    format,
    setFormat,
    topic,
    setTopic,
    notes,
    setNotes,
    bookingId,
    filter,
    setFilter,
    error,
    setError,
    success,
    confirm,
    setConfirm,
    mine,
    counts,
    visible,
    counselor,
    bookedSlots,
    quickDates,
    resetForm,
    handleSubmit,
    handleReschedule,
    askCancel,
  }
}
