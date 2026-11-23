import { z } from 'zod'

export const createAppointmentSchema = z.object({
  counselorId: z.string().trim().min(1, 'Choose a counselor.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date.'),
  time: z.string().trim().min(1, 'Choose a time.').max(20, 'Time is too long.'),
  format: z.enum(['Online', 'In person']),
  topic: z.string().trim().min(1, 'Add a topic for the session.').max(120, 'Topic is too long.'),
  notes: z.string().trim().max(500, 'Notes are too long.').optional(),
})

export const updateAppointmentSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date.').optional(),
  time: z.string().trim().min(1).max(20).optional(),
  format: z.enum(['Online', 'In person']).optional(),
  topic: z.string().trim().min(1).max(120).optional(),
  counselorNotes: z.string().trim().max(500, 'Notes are too long.').optional(),
  notes: z.string().trim().max(500, 'Notes are too long.').optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
