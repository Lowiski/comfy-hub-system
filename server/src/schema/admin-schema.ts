import { z } from 'zod'

export const adminAccountSchema = z.object({
  name: z.string().trim().min(1, 'Enter the full name.').max(120),
  email: z.string().trim().email('Enter a valid email address.'),
  schoolId: z.string().trim().min(1, 'Enter the school ID.').max(120),
  birthday: z.string().trim().min(1, 'Enter the birthday.').max(20),
  role: z.enum(['student', 'counselor', 'admin']),
  grade: z.string().trim().max(120).optional(),
  department: z.string().trim().max(120).optional(),
})

export const adminBulkAccountSchema = z.object({
  accounts: z.array(adminAccountSchema).min(1, 'Select at least one account.').max(200, 'Import up to 200 accounts at a time.'),
})

export type AdminAccountInput = z.infer<typeof adminAccountSchema>
export type AdminBulkAccountInput = z.infer<typeof adminBulkAccountSchema>
