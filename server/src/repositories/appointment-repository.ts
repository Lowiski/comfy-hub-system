import { asc, eq, or } from 'drizzle-orm'
import { isDatabaseConfigured } from '../config/env'
import { getDb } from '../db'
import { memory } from '../db/memory'
import {
  appointments,
  users,
  type Appointment,
  type NewAppointment,
  type User,
} from '../db/schema'

export type AppointmentView = {
  id: string
  studentId: string
  studentName: string
  studentAvatar: string | null
  studentSchoolId: string | null
  counselorId: string
  counselorName: string
  counselorAvatar: string | null
  counselorDepartment: string | null
  date: string
  time: string
  format: 'Online' | 'In person'
  topic: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  counselorNotes: string | null
  createdAt: string
  updatedAt: string
}

export type CounselorView = {
  id: string
  name: string
  schoolId: string | null
  department: string | null
  avatar: string | null
}

async function findUserById(id: string): Promise<User | null> {
  if (!isDatabaseConfigured) return memory.users.find((user) => user.id === id) ?? null
  const rows = await getDb().select().from(users).where(eq(users.id, id)).limit(1)
  return rows[0] ?? null
}

export async function listCounselors(): Promise<CounselorView[]> {
  let list: User[]
  if (!isDatabaseConfigured) {
    list = memory.users
  } else {
    list = await getDb().select().from(users)
  }

  return list
    .filter((user) => user.role === 'counselor')
    .map((user) => ({
      id: user.id,
      name: user.name,
      schoolId: user.schoolId,
      department: user.department,
      avatar: user.avatar ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function findCounselor(id: string): Promise<CounselorView | null> {
  const user = await findUserById(id)
  if (!user || user.role !== 'counselor') return null
  return {
    id: user.id,
    name: user.name,
    schoolId: user.schoolId,
    department: user.department,
    avatar: user.avatar ?? null,
  }
}

export async function listAppointments(viewer: User): Promise<AppointmentView[]> {
  let list: Appointment[]
  if (!isDatabaseConfigured) {
    list = memory.appointments
      .filter((item) => viewer.role === 'admin'
        || item.studentId === viewer.id
        || item.counselorId === viewer.id)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  } else {
    const condition = viewer.role === 'admin'
      ? undefined
      : or(eq(appointments.studentId, viewer.id), eq(appointments.counselorId, viewer.id))
    list = await getDb()
      .select()
      .from(appointments)
      .where(condition)
      .orderBy(asc(appointments.date), asc(appointments.time))
  }

  if (list.length === 0) return []

  const userIds = [...new Set(list.flatMap((item) => [item.studentId, item.counselorId]))]
  const found = await Promise.all(userIds.map((id) => findUserById(id)))
  const userMap = new Map(found.filter((user): user is User => !!user).map((user) => [user.id, user]))

  return list.map((item) => {
    const student = userMap.get(item.studentId)
    const counselor = userMap.get(item.counselorId)
    return {
      id: item.id,
      studentId: item.studentId,
      studentName: student?.name ?? 'Student',
      studentAvatar: student?.avatar ?? null,
      studentSchoolId: student?.schoolId ?? null,
      counselorId: item.counselorId,
      counselorName: counselor?.name ?? 'Counselor',
      counselorAvatar: counselor?.avatar ?? null,
      counselorDepartment: counselor?.department ?? null,
      date: item.date,
      time: item.time,
      format: item.format,
      topic: item.topic,
      notes: item.notes,
      status: item.status,
      counselorNotes: item.counselorNotes,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }
  })
}

export async function findAppointment(id: string): Promise<Appointment | null> {
  if (!isDatabaseConfigured) return memory.appointments.find((item) => item.id === id) ?? null
  const rows = await getDb().select().from(appointments).where(eq(appointments.id, id)).limit(1)
  return rows[0] ?? null
}

export function canAccessAppointment(item: Appointment, viewer: User) {
  return viewer.role === 'admin'
    || item.studentId === viewer.id
    || item.counselorId === viewer.id
}

export async function createAppointmentRecord(input: NewAppointment): Promise<Appointment> {
  const now = new Date()
  const record: Appointment = {
    id: input.id,
    studentId: input.studentId,
    counselorId: input.counselorId,
    date: input.date,
    time: input.time,
    format: input.format ?? 'Online',
    topic: input.topic,
    notes: input.notes ?? null,
    status: input.status ?? 'pending',
    counselorNotes: null,
    createdAt: now,
    updatedAt: now,
  }

  if (!isDatabaseConfigured) {
    memory.appointments.push(record)
    return record
  }

  const rows = await getDb().insert(appointments).values(record).returning()
  return rows[0]
}

export async function updateAppointmentRecord(
  id: string,
  patch: Partial<Pick<Appointment, 'status' | 'counselorNotes' | 'notes' | 'date' | 'time' | 'format' | 'topic'>>,
): Promise<Appointment | null> {
  const updatedAt = new Date()
  if (!isDatabaseConfigured) {
    const item = memory.appointments.find((entry) => entry.id === id)
    if (!item) return null
    Object.assign(item, patch, { updatedAt })
    return item
  }

  const rows = await getDb()
    .update(appointments)
    .set({ ...patch, updatedAt })
    .where(eq(appointments.id, id))
    .returning()
  return rows[0] ?? null
}

export async function deleteAppointmentRecord(id: string): Promise<boolean> {
  if (!isDatabaseConfigured) {
    const before = memory.appointments.length
    memory.appointments = memory.appointments.filter((item) => item.id !== id)
    return memory.appointments.length < before
  }

  const rows = await getDb()
    .delete(appointments)
    .where(eq(appointments.id, id))
    .returning({ id: appointments.id })
  return rows.length > 0
}

/** Counsellor workload for the admin overview. */
export async function countAppointmentsByStatus(): Promise<Record<string, number>> {
  if (!isDatabaseConfigured) {
    return memory.appointments.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1
      return acc
    }, {})
  }

  const rows = await getDb()
    .select({ status: appointments.status })
    .from(appointments)
  return rows.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1
    return acc
  }, {})
}
