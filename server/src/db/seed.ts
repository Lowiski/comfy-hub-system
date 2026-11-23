import bcrypt from 'bcryptjs'
import type { User } from './schema'

type SeedUser = {
  id: string
  name: string
  email: string
  password: string
  role: User['role']
  schoolId: string | null
  birthday: string | null
  mustResetPassword: boolean
  grade?: string | null
  department?: string | null
}

const seedUsers: SeedUser[] = [
  {
    id: 'u-demo',
    name: 'Louie P. Tajanlangit',
    email: 'tajanlangit.louie@gmail.com',
    password: '123456',
    role: 'student',
    schoolId: '20240748',
    birthday: '2006-01-17',
    mustResetPassword: true,
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
    grade: null,
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
    id: 'u-michael',
    name: 'Michael Anthony Tura',
    email: 'turamichaelanthony@gmail.com',
    password: '123456',
    role: 'counselor',
    schoolId: '20240941',
    birthday: '2005-09-29',
    mustResetPassword: true,
  },
  {
    id: 'u-admin',
    name: 'Admin Taylor',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    schoolId: null,
    birthday: null,
    mustResetPassword: false,
    department: 'Portal Administration',
  },
]

export async function buildSeedUsers(): Promise<User[]> {
  return Promise.all(
    seedUsers.map(async (user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: await bcrypt.hash(user.password, 10),
      role: user.role,
      schoolId: user.schoolId,
      birthday: user.birthday,
      mustResetPassword: user.mustResetPassword,
      grade: user.grade ?? null,
      department: user.department ?? null,
      phone: null,
      address: null,
      bio: null,
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  )
}

