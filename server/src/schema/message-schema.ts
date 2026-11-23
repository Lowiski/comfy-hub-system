import { z } from 'zod'

export const createConversationSchema = z.object({
  counselorId: z.string().trim().min(1, 'Choose a counselor.'),
  subject: z.string().trim().min(1, 'Enter a subject.').max(120, 'Subject is too long.'),
  body: z.string().trim().min(1, 'Enter a message.').max(2000, 'Message is too long.'),
})

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1, 'Enter a message.').max(2000, 'Message is too long.'),
})

export const editMessageSchema = z.object({
  body: z.string().trim().min(1, 'Enter a message.').max(2000, 'Message is too long.'),
})

export const messagesQuerySchema = z.object({
  after: z.string().datetime().optional(),
})

export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type EditMessageInput = z.infer<typeof editMessageSchema>
export type MessagesQuery = z.infer<typeof messagesQuerySchema>
