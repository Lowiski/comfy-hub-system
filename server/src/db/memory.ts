import type { Appointment, ChatMessage, Conversation, RefreshToken, User } from './schema'
import { buildSeedUsers } from './seed'

type MemoryState = {
  users: User[]
  refreshTokens: RefreshToken[]
  conversations: Conversation[]
  messages: ChatMessage[]
  appointments: Appointment[]
}

export const memory: MemoryState = {
  users: [],
  refreshTokens: [],
  conversations: [],
  messages: [],
  appointments: [],
}

let seeded = false

export async function seedMemory() {
  if (seeded) return
  memory.users = await buildSeedUsers()

  const student = memory.users.find((user) => user.schoolId === '20240748')
  const counselor = memory.users.find((user) => user.schoolId === '20240941')
  if (student && counselor) {
    const now = new Date()
    const conversation: Conversation = {
      id: 'c-louie-michael',
      subject: 'Checking in this week',
      studentId: student.id,
      counselorId: counselor.id,
      createdAt: now,
      updatedAt: now,
    }
    memory.conversations.push(conversation)
    memory.messages.push(
      {
        id: 'm-louie-1',
        conversationId: conversation.id,
        senderId: student.id,
        body: 'Hi Sir Michael, I wanted to ask about managing my study time this week.',
        createdAt: new Date(now.getTime() - 60000),
        readAt: now,
        editedAt: null,
      },
      {
        id: 'm-michael-1',
        conversationId: conversation.id,
        senderId: counselor.id,
        body: 'Hi Louie, thanks for reaching out. Let us plan two short study blocks and review how they go tomorrow.',
        createdAt: now,
        readAt: null,
        editedAt: null,
      },
    )

    const appointmentDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const date = appointmentDate.toISOString().slice(0, 10)
    memory.appointments.push({
      id: 'a-louie-michael',
      studentId: student.id,
      counselorId: counselor.id,
      date,
      time: '10:00',
      format: 'Online',
      topic: 'Study planning check-in',
      notes: 'Would like help building a calmer evening routine.',
      status: 'pending',
      counselorNotes: null,
      createdAt: now,
      updatedAt: now,
    })
  }

  seeded = true
}
