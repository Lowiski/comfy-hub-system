import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your ID or email.'),
  password: z.string().min(1, 'Enter your password.'),
  loginAs: z.enum(['student', 'teacher', 'admin']),
})

export const schoolIdSchema = z.object({
  schoolId: z.string().trim().min(1, 'Enter your school ID.'),
})

export const birthdaySchema = schoolIdSchema.extend({
  birthday: z.string().trim().min(1, 'Enter your birthday.'),
})

export const strongPasswordSchema = z
  .string()
  .min(8, 'Your new password must be at least 8 characters long.')
  .max(72, 'Your new password must be 72 characters or fewer.')
  .regex(/[A-Z]/, 'Your new password must include at least 1 capital letter.')
  .regex(/[a-z]/, 'Your new password must include at least 1 lowercase letter.')
  .regex(/[0-9]/, 'Your new password must include at least 1 number.')
  .regex(/[^A-Za-z0-9]/, 'Your new password must include at least 1 special character.')

export const resetPasswordSchema = birthdaySchema.extend({
  newPassword: strongPasswordSchema.refine(
    (value) => value !== '123456',
    'Please choose a new password instead of the default.',
  ),
})

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Enter the full name.'),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  schoolId: z.string().trim().min(1, 'Enter the school ID.'),
  birthday: z.string().trim().min(1, 'Enter the birthday.'),
  role: z.enum(['student', 'counselor']),
  grade: z.string().trim().optional(),
  department: z.string().trim().optional(),
})

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Enter your full name.').max(120),
  email: z.string().trim().email('Enter a valid email address.'),
  grade: z.string().trim().max(120).optional(),
  department: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(50).optional(),
  address: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(300).optional(),
  avatar: z.string().max(2_000_000).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SchoolIdInput = z.infer<typeof schoolIdSchema>
export type BirthdayInput = z.infer<typeof birthdaySchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ProfileInput = z.infer<typeof profileSchema>
