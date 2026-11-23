
import { useSyncExternalStore } from 'react'
import { ApiRequestError, authApi, type ApiUser, type LoginMode } from './api'

export type Role = 'student' | 'counselor' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  password: string
  role: Role
  avatar?: string
  schoolId?: string
  birthday?: string
  mustResetPassword?: boolean
  studentId?: string
  grade?: string
  department?: string
  phone?: string
  address?: string
  bio?: string
}

export type Appointment = {
  id: string
  counselor: string
  date: string
  time: string
  type: string
  topic: string
  notes: string
  status: 'confirmed' | 'pending' | 'completed'
  studentId?: string
  studentName?: string
  studentEmail?: string
}

export type ChatMessage = {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
}

export type Conversation = {
  id: string
  counselor: string
  role: string
  subject: string
  unread: number
  messages: ChatMessage[]
  studentId?: string
  studentName?: string
}

export type Resource = {
  id: string
  title: string
  category: string
  summary: string
  body: string
  readTime: string
  icon: string
  tone: string
  tags: string[]
}

export type MoodEntry = {
  id?: string
  mood: string
  note: string
  date: string
  userId?: string
  userName?: string
}

export type JournalEntry = {
  id: string
  text: string
  date: string
  userId?: string
  userName?: string
}

type DB = {
  users: User[]
  sessionId: string | null
  appointments: Appointment[]
  conversations: Conversation[]
  resources: Resource[]
  savedResources: string[]
  moods: MoodEntry[]
  journal: JournalEntry[]
}

export type ProfileUpdate = {
  name: string
  email: string
  avatar?: string
  studentId?: string
  grade?: string
  department?: string
  phone?: string
  address?: string
  bio?: string
}

export const counselors = [
  {
    name: 'Ms. Elena Rivera',
    role: 'Guidance Counselor',
    focus: 'Academic stress, exam anxiety, study plans',
    initials: 'ER',
    color: 'teal',
    phone: '+15550100001',
  },
  {
    name: 'Mr. Marcus Lee',
    role: 'Wellness Coach',
    focus: 'Sleep, routines, motivation, confidence',
    initials: 'ML',
    color: 'blue',
    phone: '+15550100002',
  },
  {
    name: 'Dr. Aisha Patel',
    role: 'School Psychologist',
    focus: 'Emotions, friendships, grief, self-esteem',
    initials: 'AP',
    color: 'violet',
    phone: '+15550100003',
  },
] as const

export const defaultResources: Resource[] = [
  {
    id: 'r1',
    title: 'Calming your mind before an exam',
    category: 'Academic stress',
    summary: 'Simple, research-backed techniques to settle nerves and focus on the question in front of you.',
    body: 'Exam nerves are your body preparing to perform — not a sign that you are unprepared. Start by putting both feet on the floor and breathing out for longer than you breathe in. Once your body settles, write down the three topics you feel least sure about and spend your first ten minutes there. Answer the questions you know first to build momentum, then return to the harder ones. Remember: one exam is a snapshot, not a verdict on your ability.',
    readTime: '4 min read',
    icon: 'book',
    tone: 'blue',
    tags: ['Exams', 'Focus', 'Study'],
  },
  {
    id: 'r2',
    title: 'A five-minute grounding exercise',
    category: 'Mindfulness',
    summary: 'Use the 5-4-3-2-1 method when worry feels loud and you need to return to the present moment.',
    body: 'Name five things you can see, four things you can feel, three things you can hear, two things you can smell, and one thing you can taste. This gently moves attention away from the worry loop and back into the room around you. You can do it quietly at your desk, in the hallway, or right before bed. It works best when you practise it while you are calm, so it is familiar when you need it.',
    readTime: '3 min read',
    icon: 'sparkles',
    tone: 'teal',
    tags: ['Grounding', 'Anxiety', 'Quick'],
  },
  {
    id: 'r3',
    title: 'Talking to a friend who seems withdrawn',
    category: 'Peer relationships',
    summary: 'How to check in kindly, listen well, and know when to involve a trusted adult.',
    body: 'Choose a quiet moment and start with an observation rather than a judgment: “I have missed you at lunch lately, how are you doing?” Then stop and listen. You do not need to fix their problem; being heard is often the biggest help. If your friend mentions harming themselves, or you feel worried about their safety, tell a counselor or trusted adult right away. Keeping someone safe is more important than keeping a secret.',
    readTime: '5 min read',
    icon: 'users',
    tone: 'violet',
    tags: ['Friends', 'Listening', 'Support'],
  },
  {
    id: 'r4',
    title: 'Sleep habits that actually help',
    category: 'Sleep & rest',
    summary: 'Small changes to your evening routine that can improve sleep without trying too hard.',
    body: 'Keep a similar wake-up time, even on weekends. Put your phone across the room thirty minutes before bed and dim the lights. If your mind races, write tomorrow’s tasks on paper so your brain can stop holding them. Caffeine after lunch can linger for hours, so switch to water in the afternoon. If you cannot sleep after twenty minutes, get up and do something calm in low light until you feel sleepy again.',
    readTime: '6 min read',
    icon: 'moon',
    tone: 'indigo',
    tags: ['Sleep', 'Routine', 'Habits'],
  },
  {
    id: 'r5',
    title: 'When a friendship changes',
    category: 'Peer relationships',
    summary: 'Understanding conflict, boundaries, and the difference between a rough patch and a toxic pattern.',
    body: 'Friendships change as people grow. A rough patch can be repaired with an honest conversation and a willingness to listen. A pattern of put-downs, pressure, or fear is different — that is where boundaries matter. You are allowed to step back from a relationship that drains you. Try an “I” statement: “I feel hurt when plans change at the last minute. I need more notice.” If the behaviour continues, talk with a counselor.',
    readTime: '5 min read',
    icon: 'heart',
    tone: 'rose',
    tags: ['Boundaries', 'Conflict', 'Trust'],
  },
  {
    id: 'r6',
    title: 'Understanding burnout',
    category: 'Wellbeing',
    summary: 'Recognise the signs of overload and build a realistic recovery plan for a busy term.',
    body: 'Burnout is not laziness. It can look like irritability, dread, trouble concentrating, or feeling numb after weeks of pressure. Begin by listing everything on your plate and marking what is essential, what can be shared, and what can wait. Recovery needs rest that actually restores you — sleep, movement, time outdoors, or a hobby with no goal attached. If the feeling lasts more than two weeks, book a counseling session.',
    readTime: '7 min read',
    icon: 'leaf',
    tone: 'amber',
    tags: ['Burnout', 'Rest', 'Balance'],
  },
  {
    id: 'r7',
    title: 'Coping with grief and loss',
    category: 'Emotional health',
    summary: 'There is no timeline for grief. These gentle reminders can help you carry it day by day.',
    body: 'Grief can arrive as sadness, anger, relief, or all of them in one hour. All of it is valid. Take the day in small pieces: eat something, step outside, and reach out to one person. Keeping a memory journal or lighting a candle can give the feeling somewhere to go. If grief makes it hard to function at school, a counselor can sit with you and help you find support.',
    readTime: '6 min read',
    icon: 'sun',
    tone: 'teal',
    tags: ['Grief', 'Support', 'Healing'],
  },
  {
    id: 'r8',
    title: 'What to do when you feel bullied',
    category: 'Safety',
    summary: 'A clear, practical plan: document, tell someone, and remember that it is never your fault.',
    body: 'Bullying is repeated behaviour meant to hurt or control someone. If it happens to you, stay safe first, then save evidence such as screenshots and dates. Tell a trusted adult — a teacher, counselor, or family member — and keep telling until someone acts. Avoid responding in kind; it often escalates the situation. At ComfyHub, reports can be made privately, and you choose what you want to share.',
    readTime: '5 min read',
    icon: 'shield',
    tone: 'rose',
    tags: ['Bullying', 'Safety', 'Report'],
  },
]

export const resourceCategories = ['All', 'Academic stress', 'Mindfulness', 'Peer relationships', 'Sleep & rest', 'Wellbeing', 'Emotional health', 'Safety']

export const moodOptions = [
  { value: 'Great', emoji: '😄', note: 'Ready for the day' },
  { value: 'Okay', emoji: '🙂', note: 'Feeling steady' },
  { value: 'Meh', emoji: '😐', note: 'A little flat' },
  { value: 'Low', emoji: '😔', note: 'Feeling down' },
  { value: 'Anxious', emoji: '😰', note: 'Feeling worried' },
]

const STORAGE_KEY = 'comfyhub.portal.v1'

function daysFromNow(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function defaults(): DB {
  return {
    users: [
      {
        id: 'u-demo',
        name: 'Louie P. Tajanlangit',
        email: 'tajanlangit.louie@gmail.com',
        password: '123456',
        role: 'student',
        schoolId: '20240748',
        birthday: '2006-01-17',
        mustResetPassword: true,
        studentId: '20240748',
      },
      {
        id: 'u-student-2',
        name: 'Mika Santos',
        email: 'mika.santos@gmail.com',
        password: '123456',
        role: 'student',
        schoolId: '20240749',
        birthday: '2006-03-10',
        mustResetPassword: true,
        studentId: '20240749',
      },
      {
        id: 'u-counselor',
        name: 'Ms. Elena Rivera',
        email: 'counselor@comfyhub.school',
        password: '123456',
        role: 'counselor',
        schoolId: '20240001',
        birthday: '1990-05-12',
        mustResetPassword: true,
        department: 'Guidance & Counseling',
      },
      {
        id: 'u-admin',
        name: 'Admin Taylor',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        department: 'Portal Administration',
      },
    ],
    sessionId: null,
    appointments: [
      {
        id: 'a-seed',
        counselor: 'Ms. Elena Rivera',
        date: daysFromNow(3),
        time: '10:30 AM',
        type: 'Video',
        topic: 'Academic stress',
        notes: 'Talking through the exam schedule and a study plan.',
        status: 'confirmed',
        studentId: 'u-demo',
        studentName: 'Louie P. Tajanlangit',
        studentEmail: 'tajanlangit.louie@gmail.com',
      },
      {
        id: 'a-seed-2',
        counselor: 'Mr. Marcus Lee',
        date: daysFromNow(6),
        time: '2:00 PM',
        type: 'In person',
        topic: 'Sleep and daily routine',
        notes: 'Would like help building a calmer evening routine.',
        status: 'pending',
        studentId: 'u-student-2',
        studentName: 'Mika Santos',
        studentEmail: 'mika.santos@gmail.com',
      },
    ],
    conversations: [],
    resources: defaultResources.map((resource) => ({ ...resource })),
    savedResources: ['r2'],
    moods: [],
    journal: [],
  }
}

export function getDB(): DB {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults()
    const base = defaults()
    const parsed = JSON.parse(raw) as DB
    const users = Array.isArray(parsed.users) ? [...parsed.users] : []

    for (const seedUser of base.users) {
      const index = users.findIndex(
        (user) =>
          user.id === seedUser.id ||
          user.email.toLowerCase() === seedUser.email.toLowerCase() ||
          (!!seedUser.schoolId && user.schoolId?.toLowerCase() === seedUser.schoolId.toLowerCase()),
      )

      if (index === -1) {
        users.push({ ...seedUser })
        continue
      }

      const current = users[index]
      const legacyPassword = current.password === 'student123' || current.password === 'counselor123'
      users[index] = {
        ...current,
        schoolId: current.schoolId || seedUser.schoolId,
        birthday: current.birthday || seedUser.birthday,
        mustResetPassword: current.mustResetPassword ?? seedUser.mustResetPassword,
        email: current.id === 'u-admin' ? 'admin@test.com' : current.email,
        password: current.id !== 'u-admin' && legacyPassword ? '123456' : current.password,
      }
    }

    const appointments = (Array.isArray(parsed.appointments) ? parsed.appointments : base.appointments).map((item) =>
      item.studentName === 'Jordan Avery'
        ? { ...item, studentName: 'Louie P. Tajanlangit', studentEmail: 'tajanlangit.louie@gmail.com' }
        : item,
    )
    return {
      ...base,
      ...parsed,
      users,
      appointments,
      conversations: [],
      resources: Array.isArray(parsed.resources) ? parsed.resources : base.resources,
    }
  } catch {
    return defaults()
  }
}

export function setDB(db: DB) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export function updateDB(mutate: (db: DB) => void): DB {
  const db = getDB()
  mutate(db)
  setDB(db)
  return db
}

function clearPrivateBrowserData() {
  updateDB((db) => {
    db.sessionId = null
    db.moods = []
    db.journal = []
  })
}

export function currentUser(): User | null {
  const db = getDB()
  return db.users.find((user) => user.id === db.sessionId) ?? null
}

function toUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    password: '',
    role: apiUser.role,
    avatar: apiUser.avatar || undefined,
    schoolId: apiUser.schoolId || undefined,
    studentId: apiUser.studentId || apiUser.schoolId || undefined,
    birthday: apiUser.birthday || undefined,
    mustResetPassword: Boolean(apiUser.mustResetPassword),
    grade: apiUser.grade || undefined,
    department: apiUser.department || undefined,
    phone: apiUser.phone || undefined,
    address: apiUser.address || undefined,
    bio: apiUser.bio || undefined,
  }
}

const SESSION_MARKER_KEY = 'comfyhub.hasSession'
const USER_UPDATED_EVENT = 'comfyhub:user-updated'

let userSnapshot: User | null | undefined

function getUserSnapshot(): User | null {
  if (userSnapshot === undefined) userSnapshot = currentUser()
  return userSnapshot
}

function notifyUserUpdated() {
  userSnapshot = currentUser()
  window.dispatchEvent(new Event(USER_UPDATED_EVENT))
}

function subscribeUserUpdated(callback: () => void) {
  const handleUser = () => {
    userSnapshot = currentUser()
    callback()
  }
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === SESSION_MARKER_KEY || event.key === null) handleUser()
  }

  window.addEventListener(USER_UPDATED_EVENT, handleUser)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(USER_UPDATED_EVENT, handleUser)
    window.removeEventListener('storage', handleStorage)
  }
}


export function useCurrentUser(): User | null {
  return useSyncExternalStore(subscribeUserUpdated, getUserSnapshot, getUserSnapshot)
}

export function syncRemoteUser(apiUser: ApiUser) {
  const user = toUser(apiUser)
  updateDB((db) => {
    const index = db.users.findIndex(
      (item) =>
        item.id === user.id ||
        (!!user.schoolId && item.schoolId === user.schoolId) ||
        item.email.toLowerCase() === user.email.toLowerCase(),
    )
    if (index === -1) db.users.push(user)
    else db.users[index] = { ...db.users[index], ...user }
    db.sessionId = user.id
  })
  window.localStorage.setItem(SESSION_MARKER_KEY, '1')
  notifyUserUpdated()
  return user
}

let sessionRestore: Promise<void> | null = null


export function restoreSession(): Promise<void> {
  if (window.localStorage.getItem(SESSION_MARKER_KEY) !== '1') return Promise.resolve()

  if (!sessionRestore) {
    sessionRestore = authApi.session()
      .then(({ user }) => {
        syncRemoteUser(user)
      })
      .catch(() => {
        window.localStorage.removeItem(SESSION_MARKER_KEY)
        if (getDB().sessionId) {
          clearPrivateBrowserData()
          notifyUserUpdated()
        }
      })
      .finally(() => {
        sessionRestore = null
      })
  }
  return sessionRestore
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function getResources(): Resource[] {
  return getDB().resources ?? defaultResources
}

export function addResource(resource: Omit<Resource, 'id'>) {
  const created: Resource = { ...resource, id: uid() }
  updateDB((db) => {
    db.resources.unshift(created)
  })
  return created
}

export function updateResource(id: string, updates: Partial<Omit<Resource, 'id'>>) {
  updateDB((db) => {
    const index = db.resources.findIndex((item) => item.id === id)
    if (index !== -1) db.resources[index] = { ...db.resources[index], ...updates }
  })
}

export function deleteResource(id: string) {
  updateDB((db) => {
    db.resources = db.resources.filter((item) => item.id !== id)
    db.savedResources = db.savedResources.filter((item) => item !== id)
  })
}

export type SignInResult =
  | { ok: true; mustResetPassword: boolean; schoolId?: string; name?: string }
  | { ok: false; error: string }

export function lookupSchoolId(schoolId: string): Promise<{ name: string }> {
  return authApi.lookupSchoolId(schoolId)
}

export async function signIn(
  identifier: string,
  password: string,
  loginAs: LoginMode = 'student',
): Promise<SignInResult> {
  try {
    const result = await authApi.login({ identifier, password, loginAs })

    if ('requiresPasswordReset' in result) {
      return {
        ok: true,
        mustResetPassword: true,
        schoolId: result.schoolId,
        name: result.name,
      }
    }

    syncRemoteUser(result.user)
    return { ok: true, mustResetPassword: false }
  } catch (error) {
    return {
      ok: false,
      error: errorMessage(error, 'We could not sign you in. Please try again.'),
    }
  }
}

export async function verifyBirthday(
  schoolId: string,
  birthday: string,
): Promise<{ ok: true; name: string } | { ok: false; error: string }> {
  try {
    const result = await authApi.verifyBirthday(schoolId, birthday)
    return { ok: true, name: result.name }
  } catch (error) {
    return { ok: false, error: errorMessage(error, 'We could not verify that birthday.') }
  }
}

export async function resetPassword(
  schoolId: string,
  birthday: string,
  newPassword: string,
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  try {
    const result = await authApi.resetPassword(schoolId, birthday, newPassword)
    return { ok: true, user: syncRemoteUser(result.user) }
  } catch (error) {
    return { ok: false, error: errorMessage(error, 'We could not update that password.') }
  }
}

type Registration = {
  name: string
  email: string
  password: string
  role: Role
  studentId?: string
  grade?: string
  department?: string
}

export async function signOut() {
  try {
    await authApi.logout()
  } catch {
    void 0
  }

  window.localStorage.removeItem(SESSION_MARKER_KEY)
  clearPrivateBrowserData()
  notifyUserUpdated()
}

export function createUser(input: Registration & { avatar?: string }): string | null {
  const db = getDB()
  if (db.users.some((user) => user.email.toLowerCase() === input.email.trim().toLowerCase())) {
    return 'An account with this email already exists.'
  }
  const user: User = {
    id: uid(),
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
    role: input.role,
    avatar: input.avatar,
    studentId: input.studentId?.trim() || undefined,
    grade: input.grade?.trim() || undefined,
    department: input.department?.trim() || undefined,
  }
  updateDB((draft) => {
    draft.users.push(user)
  })
  return null
}

export function updateUser(id: string, updates: Partial<Omit<User, 'id'>>) {
  const signedInId = getDB().sessionId
  updateDB((db) => {
    const index = db.users.findIndex((item) => item.id === id)
    if (index !== -1) db.users[index] = { ...db.users[index], ...updates }
  })
  if (signedInId === id) notifyUserUpdated()
}

export function deleteUser(id: string) {
  const signedInId = getDB().sessionId
  updateDB((db) => {
    db.users = db.users.filter((item) => item.id !== id)
    if (db.sessionId === id) db.sessionId = null
  })
  if (signedInId === id) notifyUserUpdated()
}

export async function updateProfile(
  updates: ProfileUpdate,
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  if (!currentUser()) {
    return { ok: false, error: 'You must be signed in to update your profile.' }
  }

  try {
    const { user } = await authApi.updateProfile({
      name: updates.name,
      email: updates.email,
      grade: updates.grade,
      department: updates.department,
      phone: updates.phone,
      address: updates.address,
      bio: updates.bio,
      avatar: updates.avatar,
    })
    return { ok: true, user: syncRemoteUser(user) }
  } catch (error) {
    if (error instanceof ApiRequestError) return { ok: false, error: error.message }
    return { ok: false, error: 'Could not save your profile. Please try again.' }
  }
}

export function bookAppointment(appointment: Omit<Appointment, 'id' | 'status'>) {
  const student = currentUser()
  updateDB((db) => {
    db.appointments.push({
      ...appointment,
      id: uid(),
      status: 'confirmed',
      studentId: student?.id,
      studentName: student?.name,
      studentEmail: student?.email,
    })
  })
}

export function createAppointment(appointment: Omit<Appointment, 'id'>) {
  updateDB((db) => {
    db.appointments.push({ ...appointment, id: uid() })
  })
}

export function updateAppointment(id: string, updates: Partial<Omit<Appointment, 'id'>>) {
  updateDB((db) => {
    const index = db.appointments.findIndex((item) => item.id === id)
    if (index !== -1) db.appointments[index] = { ...db.appointments[index], ...updates }
  })
}

export function cancelAppointment(id: string) {
  updateDB((db) => {
    db.appointments = db.appointments.filter((item) => item.id !== id)
  })
}

export function toggleSavedResource(id: string) {
  let saved = false
  updateDB((db) => {
    if (db.savedResources.includes(id)) {
      db.savedResources = db.savedResources.filter((item) => item !== id)
    } else {
      db.savedResources.push(id)
      saved = true
    }
  })
  return saved
}

export function addMood(mood: string, note: string) {
  const user = currentUser()
  updateDB((db) => {
    db.moods.unshift({
      id: uid(),
      mood,
      note,
      date: todayISO(),
      userId: user?.id,
      userName: user?.name,
    })
    db.moods = db.moods.slice(0, 30)
  })
}

export function updateMood(id: string, updates: Partial<Omit<MoodEntry, 'id'>>) {
  updateDB((db) => {
    const index = db.moods.findIndex((item) => item.id === id)
    if (index !== -1) db.moods[index] = { ...db.moods[index], ...updates }
  })
}

export function deleteMood(id: string) {
  updateDB((db) => {
    db.moods = db.moods.filter((item) => item.id !== id)
  })
}

export function addJournal(text: string) {
  const user = currentUser()
  updateDB((db) => {
    db.journal.unshift({ id: uid(), text, date: todayISO(), userId: user?.id, userName: user?.name })
  })
}

export function updateJournal(id: string, text: string) {
  updateDB((db) => {
    const entry = db.journal.find((item) => item.id === id)
    if (entry) entry.text = text
  })
}

export function deleteJournal(id: string) {
  updateDB((db) => {
    db.journal = db.journal.filter((item) => item.id !== id)
  })
}

