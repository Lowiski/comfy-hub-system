export type PasswordRule = {
  id: string
  label: string
  test: (value: string) => boolean
}

export const passwordRules: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { id: 'max', label: '72 characters or fewer', test: (value) => value.length <= 72 },
  { id: 'upper', label: '1 capital letter', test: (value) => /[A-Z]/.test(value) },
  { id: 'lower', label: '1 lowercase letter', test: (value) => /[a-z]/.test(value) },
  { id: 'number', label: '1 number', test: (value) => /[0-9]/.test(value) },
  { id: 'special', label: '1 special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
  { id: 'default', label: 'Not the default password', test: (value) => value !== '123456' },
]

export function passwordErrors(value: string) {
  return passwordRules.filter((rule) => !rule.test(value)).map((rule) => rule.label)
}

export function isPasswordValid(value: string) {
  return passwordErrors(value).length === 0
}

export const PASSWORD_HINT =
  'Use at least 8 characters with 1 capital letter, 1 lowercase letter, 1 number, and 1 special character.'
