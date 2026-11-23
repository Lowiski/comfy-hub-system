import { apiRequest, ApiRequestError, clearCsrfToken } from './axios'

export { apiRequest, ApiRequestError, clearCsrfToken }

export type LoginMode = 'student' | 'teacher' | 'admin'
export type ApiRole = 'student' | 'counselor' | 'admin'

export type ApiUser = {
  id: string
  name: string
  email: string
  role: ApiRole
  schoolId?: string | null
  studentId?: string | null
  birthday?: string | null
  mustResetPassword?: boolean
  grade?: string | null
  department?: string | null
  phone?: string | null
  address?: string | null
  bio?: string | null
  avatar?: string | null
}

export type AdminAccountInput = {
  name: string
  email: string
  schoolId: string
  birthday: string
  role: ApiRole
  grade?: string
  department?: string
}

export type BulkAccountResult = {
  name: string
  status: 'added' | 'already_added'
  message: string
  id?: string
}

export type LoginResponse =
  | { requiresPasswordReset: true; schoolId: string; name: string; role: ApiRole }
  | { user: ApiUser }

export type ApiConversation = {
  id: string
  subject: string
  studentId: string
  studentName: string
  studentAvatar: string | null
  studentSchoolId: string | null
  counselorId: string
  counselorName: string
  counselorAvatar: string | null
  otherName: string
  otherAvatar: string | null
  otherRole: 'student' | 'counselor' | 'admin'
  lastMessage: string
  lastMessageAt: string | null
  unread: number
  updatedAt: string
}

export type ApiMessage = {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar: string | null
  mine: boolean
  body: string
  createdAt: string
  readAt: string | null
  editedAt: string | null
}

export type ApiPerson = {
  id: string
  name: string
  role: ApiRole
  schoolId: string | null
  department: string | null
  avatar: string | null
}

export type ApiNotification = {
  id: string
  type: 'message' | 'appointment'
  title: string
  body: string
  time: string
  href: string
  icon: 'message' | 'calendar'
  tone: 'teal' | 'blue' | 'violet'
  count: number
}

export const notificationsApi = {
  list() {
    return apiRequest<{ notifications: ApiNotification[]; count: number }>('/notifications')
  },
}

export const messagesApi = {
  listConversations() {
    return apiRequest<{ conversations: ApiConversation[] }>('/messages/conversations')
  },

  listPeople() {
    return apiRequest<{ people: ApiPerson[] }>('/messages/people')
  },

  createConversation(input: { counselorId: string; subject: string; body: string }) {
    return apiRequest<{ conversationId: string }>('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  listMessages(conversationId: string) {
    return apiRequest<{ messages: ApiMessage[] }>(
      `/messages/conversations/${encodeURIComponent(conversationId)}/messages`,
    )
  },

  sendMessage(conversationId: string, body: string) {
    return apiRequest<{ message: ApiMessage }>(
      `/messages/conversations/${encodeURIComponent(conversationId)}/messages`,
      { method: 'POST', body: JSON.stringify({ body }) },
    )
  },

  editMessage(conversationId: string, messageId: string, body: string) {
    return apiRequest<{ message: ApiMessage }>(
      `/messages/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`,
      { method: 'PATCH', body: JSON.stringify({ body }) },
    )
  },

  deleteMessage(conversationId: string, messageId: string) {
    return apiRequest<{ ok: true }>(
      `/messages/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`,
      { method: 'DELETE' },
    )
  },

  markRead(conversationId: string) {
    return apiRequest<{ ok: true }>(
      `/messages/conversations/${encodeURIComponent(conversationId)}/read`,
      { method: 'POST' },
    )
  },

  deleteConversation(conversationId: string) {
    return apiRequest<{ ok: true }>(
      `/messages/conversations/${encodeURIComponent(conversationId)}`,
      { method: 'DELETE' },
    )
  },
}

export type ApiAppointment = {
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

export type ApiCounselor = {
  id: string
  name: string
  schoolId: string | null
  department: string | null
  avatar: string | null
}

export const appointmentsApi = {
  list() {
    return apiRequest<{ appointments: ApiAppointment[] }>('/appointments')
  },

  counselors() {
    return apiRequest<{ counselors: ApiCounselor[] }>('/appointments/counselors')
  },

  overview() {
    return apiRequest<{ counts: Record<string, number> }>('/appointments/overview')
  },

  create(input: {
    counselorId: string
    date: string
    time: string
    format: 'Online' | 'In person'
    topic: string
    notes?: string
  }) {
    return apiRequest<{ appointmentId: string }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  update(id: string, input: {
    status?: ApiAppointment['status']
    date?: string
    time?: string
    format?: ApiAppointment['format']
    topic?: string
    counselorNotes?: string
    notes?: string
  }) {
    return apiRequest<{ ok: true; appointment: ApiAppointment | null }>(`/appointments/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  },

  remove(id: string) {
    return apiRequest<{ ok: true }>(`/appointments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },
}

export const publicApi = {
  counselors() {
    return apiRequest<{ counselors: ApiCounselor[] }>('/public/counselors')
  },
}

export const authApi = {
  login(input: { identifier: string; password: string; loginAs: LoginMode }) {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  lookupSchoolId(schoolId: string) {
    return apiRequest<{ name: string }>('/auth/lookup-school-id', {
      method: 'POST',
      body: JSON.stringify({ schoolId }),
    })
  },

  verifyBirthday(schoolId: string, birthday: string) {
    return apiRequest<{ name: string }>('/auth/verify-birthday', {
      method: 'POST',
      body: JSON.stringify({ schoolId, birthday }),
    })
  },

  resetPassword(schoolId: string, birthday: string, newPassword: string) {
    return apiRequest<{ user: ApiUser }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ schoolId, birthday, newPassword }),
    })
  },

  updateProfile(input: {
    name: string
    email: string
    grade?: string
    department?: string
    phone?: string
    address?: string
    bio?: string
    avatar?: string
  }) {
    return apiRequest<{ user: ApiUser }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  },

  session() {
    return apiRequest<{ user: ApiUser }>('/auth/session')
  },

  refresh() {
    return apiRequest<{ user: ApiUser }>('/auth/refresh', { method: 'POST' })
  },

  async logout() {
    const result = await apiRequest<{ ok: true }>('/auth/logout', { method: 'POST' })
    clearCsrfToken()
    return result
  },

  signup(input: {
    name: string
    email: string
    password: string
    schoolId: string
    birthday: string
    role: Exclude<ApiRole, 'admin'>
    grade?: string
    department?: string
  }) {
    return apiRequest<{ user: ApiUser }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  listAccounts() {
    return apiRequest<{ users: ApiUser[] }>('/admin/accounts')
  },

  createAccount(input: {
    name: string
    email: string
    schoolId?: string
    birthday?: string
    role: ApiRole
    grade?: string
    department?: string
  }) {
    return apiRequest<{ user: ApiUser }>('/admin/accounts', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  bulkCreateAccounts(accounts: AdminAccountInput[]) {
    return apiRequest<{ results: BulkAccountResult[]; added: number; skipped: number }>('/admin/accounts/bulk', {
      method: 'POST',
      body: JSON.stringify({ accounts }),
    })
  },

  updateAccount(id: string, input: {
    name: string
    email: string
    schoolId: string
    birthday: string
    role: ApiRole
    grade?: string
    department?: string
  }) {
    return apiRequest<{ user: ApiUser }>(`/admin/accounts/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  },

  deleteAccount(id: string) {
    return apiRequest<{ ok: true }>(`/admin/accounts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },
}
