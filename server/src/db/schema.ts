import {
  boolean,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', ['student', 'counselor', 'admin'])
export const appointmentFormat = pgEnum('appointment_format', ['Online', 'In person'])
export const appointmentStatus = pgEnum('appointment_status', ['pending', 'confirmed', 'completed', 'cancelled'])

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRole('role').notNull(),
  schoolId: text('school_id'),
  birthday: date('birthday', { mode: 'string' }),
  mustResetPassword: boolean('must_reset_password').notNull().default(false),
  grade: text('grade'),
  department: text('department'),
  phone: text('phone'),
  address: text('address'),
  bio: text('bio'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('users_email_unique').on(table.email),
  uniqueIndex('users_school_id_unique').on(table.schoolId),
])

export const refreshTokens = pgTable('refresh_tokens', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('refresh_tokens_user_id_idx').on(table.userId),
])

export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  subject: text('subject').notNull(),
  studentId: text('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  counselorId: text('counselor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('conversations_student_idx').on(table.studentId),
  index('conversations_counselor_idx').on(table.counselorId),
])

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp('read_at', { withTimezone: true }),
  editedAt: timestamp('edited_at', { withTimezone: true }),
}, (table) => [
  index('messages_conversation_idx').on(table.conversationId),
])

export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  counselorId: text('counselor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date', { mode: 'string' }).notNull(),
  time: text('time').notNull(),
  format: appointmentFormat('format').notNull().default('Online'),
  topic: text('topic').notNull(),
  notes: text('notes'),
  status: appointmentStatus('status').notNull().default('pending'),
  counselorNotes: text('counselor_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('appointments_student_idx').on(table.studentId),
  index('appointments_counselor_idx').on(table.counselorId),
])

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type RefreshToken = typeof refreshTokens.$inferSelect
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type ChatMessage = typeof messages.$inferSelect
export type NewChatMessage = typeof messages.$inferInsert
export type Appointment = typeof appointments.$inferSelect
export type NewAppointment = typeof appointments.$inferInsert
