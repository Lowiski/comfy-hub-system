import { randomUUID } from 'node:crypto'
import type { User } from '../../db/schema'
import {
  canAccessAppointment,
  countAppointmentsByStatus,
  createAppointmentRecord,
  deleteAppointmentRecord,
  findAppointment,
  findCounselor,
  listAppointments,
  listCounselors,
  updateAppointmentRecord,
} from '../../repositories/appointment-repository'
import type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../../schema/appointment-schema'
import { fail, ok, type ApiResult } from '../../utils/api-result'

function localDateISO(value = new Date()) {
  const offset = value.getTimezoneOffset() * 60_000
  return new Date(value.getTime() - offset).toISOString().slice(0, 10)
}

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const
const VALID_TIME = /^(?:([01]\d|2[0-3]):[0-5]\d|(?:0?[1-9]|1[0-2]):[0-5]\d\s?(?:AM|PM))$/i

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(new Date(`${value}T00:00:00`).getTime())
    && value >= localDateISO()
}

export async function listAppointmentsService(viewer: User) {
  return ok({ appointments: await listAppointments(viewer) })
}

export async function listCounselorsService() {
  return ok({ counselors: await listCounselors() })
}

export async function overviewService() {
  return ok({ counts: await countAppointmentsByStatus() })
}

export async function createAppointmentService(
  viewer: User,
  input: CreateAppointmentInput,
): Promise<ApiResult<{ appointmentId: string }>> {
  if (viewer.role !== 'student') {
    return fail('ROLE_NOT_ALLOWED', 'Book sessions with a student account.', 403)
  }

  const counselor = await findCounselor(input.counselorId)
  if (!counselor) return fail('COUNSELOR_NOT_FOUND', 'Choose a counselor from the list.', 404)

  if (!validDate(input.date)) {
    return fail('VALIDATION_ERROR', 'Choose a valid date from today onwards.', 400)
  }
  if (!VALID_TIME.test(input.time)) {
    return fail('VALIDATION_ERROR', 'Choose a valid time.', 400)
  }

  const existing = await listAppointments(viewer)
  const clash = existing.some((item) => item.counselorId === input.counselorId
    && item.date === input.date
    && item.time === input.time
    && item.status !== 'cancelled')
  if (clash) {
    return fail('SLOT_TAKEN', 'That time is already booked with this counselor. Please choose another.', 409)
  }

  const id = randomUUID()
  await createAppointmentRecord({
    id,
    studentId: viewer.id,
    counselorId: counselor.id,
    date: input.date,
    time: input.time,
    format: input.format,
    topic: input.topic,
    notes: input.notes ?? null,
    status: 'pending',
  })

  return ok({ appointmentId: id })
}

export async function updateAppointmentService(
  viewer: User,
  id: string,
  input: UpdateAppointmentInput,
) {
  const item = await findAppointment(id)
  if (!item || !canAccessAppointment(item, viewer)) {
    return fail('APPOINTMENT_NOT_FOUND', 'Appointment not found.', 404)
  }

  if (viewer.role === 'admin') {
    return fail('ADMIN_READ_ONLY', 'Admin accounts can review appointments but cannot change them.', 403)
  }

  if (viewer.role === 'student') {
    if (item.studentId !== viewer.id) {
      return fail('APPOINTMENT_NOT_FOUND', 'Appointment not found.', 404)
    }
    if (input.counselorNotes !== undefined) {
      return fail('ROLE_NOT_ALLOWED', 'Only the counselor can add session notes.', 403)
    }
    if (input.status && input.status !== 'cancelled') {
      return fail('ROLE_NOT_ALLOWED', 'You can only cancel or reschedule your own session.', 403)
    }
    if ((input.status === 'cancelled' || input.date || input.time || input.format || input.topic || input.notes !== undefined)
      && item.status !== 'pending' && item.status !== 'confirmed') {
      return fail('STATUS_NOT_ALLOWED', 'This session can no longer be changed.', 409)
    }
    if (input.date && !validDate(input.date)) {
      return fail('VALIDATION_ERROR', 'Choose a valid date from today onwards.', 400)
    }
    if (input.time && !VALID_TIME.test(input.time)) {
      return fail('VALIDATION_ERROR', 'Choose a valid time.', 400)
    }
    if (input.date || input.time) {
      const nextDate = input.date ?? item.date
      const nextTime = input.time ?? item.time
      const all = await listAppointments(viewer)
      const clash = all.some((entry) => entry.id !== id
        && entry.counselorId === item.counselorId
        && entry.date === nextDate
        && entry.time === nextTime
        && entry.status !== 'cancelled')
      if (clash) {
        return fail('SLOT_TAKEN', 'That time is already booked with this counselor. Please choose another.', 409)
      }
    }
  }

  if (viewer.role === 'counselor') {
    if (item.counselorId !== viewer.id) {
      return fail('APPOINTMENT_NOT_FOUND', 'Appointment not found.', 404)
    }
    if (input.status && !VALID_STATUSES.includes(input.status)) {
      return fail('VALIDATION_ERROR', 'Choose a valid status.', 400)
    }
  }

  const patch: {
    status?: typeof VALID_STATUSES[number]
    date?: string
    time?: string
    format?: 'Online' | 'In person'
    topic?: string
    counselorNotes?: string | null
    notes?: string | null
  } = {}
  if (input.status) patch.status = input.status
  if (input.date) patch.date = input.date
  if (input.time) patch.time = input.time
  if (input.format) patch.format = input.format
  if (input.topic) patch.topic = input.topic
  if (input.counselorNotes !== undefined) patch.counselorNotes = input.counselorNotes
  if (input.notes !== undefined) patch.notes = input.notes

  if (Object.keys(patch).length === 0) {
    return fail('VALIDATION_ERROR', 'Nothing to update.', 400)
  }

  const updated = await updateAppointmentRecord(id, patch)
  return ok({ ok: true as const, appointment: updated })
}

export async function deleteAppointmentService(viewer: User, id: string) {
  const item = await findAppointment(id)
  if (!item || !canAccessAppointment(item, viewer)) {
    return fail('APPOINTMENT_NOT_FOUND', 'Appointment not found.', 404)
  }

  if (viewer.role === 'admin') {
    return fail('ADMIN_READ_ONLY', 'Admin accounts can review appointments but cannot delete them.', 403)
  }

  const deleted = await deleteAppointmentRecord(id)
  if (!deleted) return fail('APPOINTMENT_NOT_FOUND', 'Appointment not found.', 404)
  return ok({ ok: true as const })
}
