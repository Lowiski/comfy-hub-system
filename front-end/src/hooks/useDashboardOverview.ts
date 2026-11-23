import { useState } from 'react'
import type { FormEvent } from 'react'
import { addMood, getDB, getResources, type User } from '@/lib/data'
import { isUpcoming, useAppointments } from '@/lib/appointments'
import { useUnreadCount } from '@/lib/messages'
import type { IconName } from '@/components/ui/icon'
import { useTimedFlag } from '@/hooks/useTimedFlag'


export function useDashboardOverview(user: User | null) {
  const [db, setDb] = useState(getDB())
  const { appointments, counselors } = useAppointments()
  const unread = useUnreadCount()
  const [resources] = useState(getResources())
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [savedMood, flashSavedMood] = useTimedFlag(false, 3500)

  const firstName = (user?.name ?? 'there').split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const myAppointments = appointments.filter((item) => item.studentId === user?.id)
  const upcoming = myAppointments
    .filter(isUpcoming)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 2)
  const latestMood = db.moods[0]

  const stats: { label: string; value: string | number; icon: IconName; tone: string }[] = [
    { label: 'Upcoming sessions', value: myAppointments.filter(isUpcoming).length, icon: 'calendar', tone: 'teal' },
    { label: 'Unread messages', value: unread, icon: 'message', tone: '' },
    { label: 'Saved resources', value: db.savedResources.length, icon: 'bookmark', tone: 'violet' },
    { label: 'Mood check-ins', value: db.moods.length, icon: 'smile', tone: 'amber' },
  ]

  function submitMood(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!mood) return
    addMood(mood, note)
    setMood('')
    setNote('')
    setDb(getDB())
    flashSavedMood(true)
  }

  return {
    db,
    counselors,
    resources,
    mood,
    setMood,
    note,
    setNote,
    savedMood,
    firstName,
    greeting,
    upcoming,
    latestMood,
    stats,
    myAppointments,
    submitMood,
  }
}
