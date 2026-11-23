import { useState } from 'react'
import { ApiRequestError, appointmentsApi, type ApiAppointment } from '@/lib/api'
import { appointmentStatusLabels, isUpcoming, refreshAppointments, useAppointments } from '@/lib/appointments'

export type CounselorConfirm = {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
}


export function useCounselorAppointments(notify: (message: string) => void) {
  const { appointments, loading } = useAppointments()
  const [confirm, setConfirm] = useState<CounselorConfirm | null>(null)
  const [noteFor, setNoteFor] = useState<ApiAppointment | null>(null)
  const [noteText, setNoteText] = useState('')

  const upcomingCount = appointments.filter((item) => isUpcoming(item) && item.status === 'pending').length
  const studentCount = new Set(appointments.map((item) => item.studentId)).size

  function refresh() {
    void refreshAppointments()
  }

  async function changeStatus(appointment: ApiAppointment, status: ApiAppointment['status']) {
    try {
      await appointmentsApi.update(appointment.id, { status })
      notify(`${appointment.studentName}’s session marked ${appointmentStatusLabels[status].toLowerCase()}.`)
    } catch (cause) {
      notify(cause instanceof ApiRequestError ? cause.message : 'Could not update that session.')
    } finally {
      refresh()
    }
  }

  function removeAppointment(appointment: ApiAppointment) {
    setConfirm({
      title: 'Remove this booking?',
      message: `This will permanently remove the session booked by ${appointment.studentName}. The student will no longer see it.`,
      confirmLabel: 'Remove booking',
      onConfirm: () => void deleteAppointment(appointment),
    })
  }

  async function deleteAppointment(appointment: ApiAppointment) {
    try {
      await appointmentsApi.remove(appointment.id)
      notify('Appointment removed.')
    } catch (cause) {
      notify(cause instanceof ApiRequestError ? cause.message : 'Could not remove that session.')
    } finally {
      setConfirm(null)
      refresh()
    }
  }

  function openNote(appointment: ApiAppointment) {
    setNoteFor(appointment)
    setNoteText(appointment.counselorNotes ?? '')
  }

  async function saveNote() {
    if (!noteFor) return
    try {
      await appointmentsApi.update(noteFor.id, { counselorNotes: noteText.trim() })
      notify('Private counselor note saved.')
    } catch (cause) {
      notify(cause instanceof ApiRequestError ? cause.message : 'Could not save that note.')
    } finally {
      setNoteFor(null)
      refresh()
    }
  }

  return {
    appointments,
    loading,
    upcomingCount,
    studentCount,
    confirm,
    setConfirm,
    noteFor,
    setNoteFor,
    noteText,
    setNoteText,
    changeStatus,
    removeAppointment,
    openNote,
    saveNote,
  }
}
