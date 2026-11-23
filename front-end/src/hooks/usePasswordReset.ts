import { useState } from 'react'
import type { FormEvent } from 'react'
import { lookupSchoolId, resetPassword, verifyBirthday } from '@/lib/data'
import { isPasswordValid, PASSWORD_HINT } from '@/lib/password'

export type ResetStep = 'id' | 'birthday' | 'password' | 'done'
export type ResetState = { schoolId?: string; firstLogin?: boolean; name?: string } | null

const stepOrder: ResetStep[] = ['id', 'birthday', 'password']


export function usePasswordReset(incoming: ResetState) {
  const [step, setStep] = useState<ResetStep>(incoming?.schoolId ? 'birthday' : 'id')
  const [schoolId, setSchoolId] = useState(incoming?.schoolId ?? '')
  const [birthday, setBirthday] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [verifiedName, setVerifiedName] = useState(incoming?.name ?? '')

  const isFirstLogin = !!incoming?.firstLogin
  const currentStep = step === 'done' ? 3 : stepOrder.indexOf(step)
  const today = new Date().toISOString().slice(0, 10)

  const titles: Record<ResetStep, { title: string; subtitle: string }> = {
    id: {
      title: 'Reset your password',
      subtitle: 'Enter your school ID and we will verify your birthday.',
    },
    birthday: {
      title: isFirstLogin ? 'Set up your account' : 'Verify your birthday',
      subtitle: isFirstLogin
        ? 'First time logging in? Choose your birthday from the calendar to create your own password.'
        : 'Choose the birthday on your school record from the calendar to continue.',
    },
    password: {
      title: 'Choose a new password',
      subtitle: `Create a new password for ${verifiedName || 'your account'}.`,
    },
    done: {
      title: 'Password updated',
      subtitle: 'Your new password is ready. You can now use the portal.',
    },
  }

  function goToId() {
    setStep('id')
    setError('')
    setBirthday('')
    setPassword('')
    setConfirm('')
  }

  async function handleId(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const account = await lookupSchoolId(schoolId)
      setVerifiedName(account.name)
      setStep('birthday')
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'We could not find that school ID.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBirthday(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await verifyBirthday(schoolId, birthday)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setVerifiedName(result.name)
    setStep('password')
  }

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isPasswordValid(password)) {
      setError(PASSWORD_HINT)
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setError('')
    setSubmitting(true)
    const result = await resetPassword(schoolId, birthday, password)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setStep('done')
  }

  return {
    step,
    schoolId,
    setSchoolId,
    birthday,
    setBirthday,
    password,
    setPassword,
    confirm,
    setConfirm,
    error,
    submitting,
    verifiedName,
    isFirstLogin,
    currentStep,
    today,
    titles,
    goToId,
    handleId,
    handleBirthday,
    handlePassword,
  }
}
