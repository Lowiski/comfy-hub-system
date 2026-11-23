import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { signIn } from '@/lib/data'
import type { LoginMode } from '@/lib/api'
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility'


export function useLoginForm(mode: LoginMode) {
  const navigate = useNavigate()
  const [loginAs, setLoginAs] = useState<LoginMode>(mode)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const visibility = usePasswordVisibility()

  const isAdmin = mode === 'admin'
  const idLabel = isAdmin
    ? 'Admin email'
    : loginAs === 'teacher'
      ? 'Teacher ID'
      : 'Student ID'

  function changeMode(next: LoginMode) {
    setLoginAs(next)
    setIdentifier('')
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await signIn(identifier, password, loginAs)

    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }

    if (result.mustResetPassword) {
      navigate('/reset-password', {
        state: { schoolId: result.schoolId, firstLogin: true, name: result.name },
      })
      return
    }

    navigate(isAdmin ? '/admin' : '/dashboard')
  }

  return {
    loginAs,
    identifier,
    setIdentifier,
    password,
    setPassword,
    error,
    isAdmin,
    idLabel,
    changeMode,
    handleSubmit,
    submitting,
    visible: visibility.visible,
    inputType: visibility.inputType,
    toggle: visibility.toggle,
  }
}
