import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { currentUser, updateProfile, type User } from '@/lib/data'
import { useTimedFlag } from '@/hooks/useTimedFlag'

export const programs = [
  'BS in Information Technology (BSIT)',
  'BS in Hospitality Management (BSHM)',
  'Bachelor of Elementary Education (BEEd)',
  'Bachelor of Secondary Education (BSEd)',
]

export const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year']

export type ProfileForm = {
  name: string
  email: string
  avatar: string
  studentId: string
  program: string
  yearLevel: string
  department: string
  phone: string
  address: string
  bio: string
}

function splitGrade(grade?: string) {
  if (!grade) return { program: '', yearLevel: '' }
  const [program, ...rest] = grade.split(' - ')
  return rest.length ? { program, yearLevel: rest.join(' - ') } : { program: '', yearLevel: grade }
}

function toForm(user: User | null): ProfileForm {
  const { program, yearLevel } = splitGrade(user?.grade)
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    avatar: user?.avatar ?? '',
    studentId: user?.studentId ?? '',
    program,
    yearLevel,
    department: user?.department ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    bio: user?.bio ?? '',
  }
}

export function optionsWithCurrent(options: string[], current: string) {
  return current && !options.includes(current) ? [current, ...options] : options
}

function cropAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the selected file.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('That file is not a valid image.'))
      image.onload = () => {
        const size = 256
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('Image editing is not available in this browser.'))
          return
        }
        const side = Math.min(image.width, image.height)
        const left = (image.width - side) / 2
        const top = (image.height - side) / 2
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, size, size)
        context.drawImage(image, left, top, side, side, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      image.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}


export function useProfileEditor() {
  const [user, setUser] = useState<User | null>(() => currentUser())
  const [form, setForm] = useState<ProfileForm>(() => toForm(currentUser()))
  const [baseline, setBaseline] = useState<ProfileForm>(() => toForm(currentUser()))
  const [error, setError] = useState('')
  const [saved, flashSaved] = useTimedFlag(false, 6000)
  const [saving, setSaving] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const isStudent = user?.role === 'student'
  const displayGrade = [form.program, form.yearLevel].filter(Boolean).join(' - ')
  const dirty = JSON.stringify(form) !== JSON.stringify(baseline)

  function set(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    flashSaved(false)
  }

  function discard() {
    setForm(baseline)
    setError('')
    flashSaved(false)
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file for your profile picture.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Please choose an image smaller than 8 MB.')
      return
    }

    try {
      const avatar = await cropAvatar(file)
      set('avatar', avatar)
      setError('')
    } catch {
      setError('We could not read that image. Please try another one.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    flashSaved(false)

    if (!form.name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!form.email.trim()) {
      setError('Please enter your school email address.')
      return
    }

    setSaving(true)
    try {
      const result = await updateProfile({
        name: form.name,
        email: form.email,
        avatar: form.avatar,
        grade: isStudent ? [form.program, form.yearLevel].filter(Boolean).join(' - ') || undefined : undefined,
        department: isStudent ? undefined : form.department,
        phone: form.phone,
        address: form.address,
        bio: form.bio,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      const nextForm = toForm(result.user)
      setUser(result.user)
      setForm(nextForm)
      setBaseline(nextForm)
      flashSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return {
    user,
    form,
    error,
    setError,
    saved,
    saving,
    fileInput,
    isStudent,
    displayGrade,
    dirty,
    set,
    discard,
    handleAvatarChange,
    handleSubmit,
  }
}
