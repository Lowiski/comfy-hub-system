import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiRequestError, authApi, type AdminAccountInput, type ApiUser } from '@/lib/api'
import { deleteUser, getDB, updateDB, useCurrentUser, type Role, type User } from '@/lib/data'
import { useTimedFlag } from './useTimedFlag'

export type AdminTab = 'overview' | 'accounts' | 'resources'
export type AccountFilter = 'all' | Role
export type AdminNotice = { tone: 'success' | 'error'; text: string }
export type ActivityTone = 'teal' | 'blue' | 'red' | 'amber'
export type AdminActivity = {
  id: string
  action: string
  name: string
  detail: string
  time: string
  tone: ActivityTone
}
export type AccountForm = {
  name: string
  email: string
  schoolId: string
  birthday: string
  role: Role
  grade: string
  department: string
}

export const emptyAccountForm: AccountForm = {
  name: '',
  email: '',
  schoolId: '',
  birthday: '',
  role: 'student',
  grade: '',
  department: '',
}

function toLocalUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    password: '',
    role: apiUser.role,
    avatar: apiUser.avatar || undefined,
    schoolId: apiUser.schoolId || undefined,
    studentId: apiUser.schoolId || apiUser.studentId || undefined,
    birthday: apiUser.birthday || undefined,
    mustResetPassword: apiUser.mustResetPassword,
    grade: apiUser.grade || undefined,
    department: apiUser.department || undefined,
    phone: apiUser.phone || undefined,
    address: apiUser.address || undefined,
    bio: apiUser.bio || undefined,
  }
}

function toForm(user: User): AccountForm {
  return {
    name: user.name,
    email: user.email,
    schoolId: user.schoolId ?? user.studentId ?? '',
    birthday: user.birthday ?? '',
    role: user.role,
    grade: user.grade ?? '',
    department: user.department ?? '',
  }
}

function message(error: unknown, fallback: string) {
  return error instanceof ApiRequestError ? error.message : fallback
}

function isDuplicate(error: unknown) {
  return error instanceof ApiRequestError
    && ['EMAIL_TAKEN', 'SCHOOL_ID_TAKEN'].includes(error.code ?? '')
}

export function useAdminPanel() {
  const user = useCurrentUser()
  const [users, setUsers] = useState<User[]>([])
  const [tab, setTab] = useState<AdminTab>('overview')
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all')
  const [accountQuery, setAccountQuery] = useState('')
  const [resourceFilter, setResourceFilter] = useState('All')
  const [resourceQuery, setResourceQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [accountForm, setAccountForm] = useState<AccountForm>({ ...emptyAccountForm })
  const [pendingRemove, setPendingRemove] = useState<User | null>(null)
  const [activities, setActivities] = useState<AdminActivity[]>([])
  const [notice, setNotice] = useTimedFlag<AdminNotice | null>(null, 5000)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    authApi.listAccounts()
      .then((result) => setUsers(result.users.map(toLocalUser)))
      .catch(() => {
        setUsers([])
        setNotice({ tone: 'error', text: 'Could not load accounts from the server.' })
      })
  }, [setNotice])

  function pushActivity(action: string, name: string, detail: string, tone: ActivityTone) {
    setActivities((current) => [
      { id: `${Date.now()}-${Math.random()}`, action, name, detail, tone, time: new Date().toLocaleTimeString() },
      ...current,
    ].slice(0, 6))
  }

  function openAccounts(filter: AccountFilter = 'all') {
    setAccountFilter(filter)
    setTab('accounts')
  }

  function openResources(category = 'All') {
    setResourceFilter(category)
    setTab('resources')
  }

  function openAdd() {
    setEditingId(null)
    setAccountForm({ ...emptyAccountForm })
    setAddOpen(true)
  }

  function openEdit(target: User) {
    setEditingId(target.id)
    setAccountForm(toForm(target))
    setAddOpen(true)
  }

  function closeAccountModal() {
    setAddOpen(false)
    setEditingId(null)
    setAccountForm({ ...emptyAccountForm })
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    if (!accountForm.name.trim() || !accountForm.email.trim() || !accountForm.schoolId.trim() || !accountForm.birthday.trim()) {
      setNotice({ tone: 'error', text: 'Name, email, school ID, and birthday are required.' })
      return
    }

    const input = {
      name: accountForm.name,
      email: accountForm.email,
      schoolId: accountForm.schoolId,
      birthday: accountForm.birthday,
      role: accountForm.role,
      grade: accountForm.grade || undefined,
      department: accountForm.department || undefined,
    }

    setPending(true)
    try {
      const result = editingId
        ? await authApi.updateAccount(editingId, input)
        : await authApi.createAccount(input)
      const saved = toLocalUser(result.user)

      updateDB((draft) => {
        draft.users = [...draft.users.filter((item) => item.id !== saved.id), saved]
      })
      setUsers((current) => [...current.filter((item) => item.id !== saved.id), saved])

      if (editingId) {
        pushActivity('Updated', saved.name, `${saved.role} · ${saved.schoolId}`, 'blue')
        setNotice({ tone: 'success', text: `${saved.name} was updated.` })
      } else {
        pushActivity('Added', saved.name, `${saved.role} · ${saved.schoolId}`, 'teal')
        setNotice({ tone: 'success', text: `${saved.name} was added. Default password is 123456.` })
      }

      closeAccountModal()
      setAccountFilter('all')
      setAccountQuery('')
    } catch (error) {
      if (isDuplicate(error)) {
        pushActivity('Already added', accountForm.name, message(error, 'Duplicate account.'), 'amber')
        setNotice({ tone: 'error', text: `${accountForm.name} is already added. ${message(error, '')}`.trim() })
      } else {
        setNotice({ tone: 'error', text: message(error, 'Could not save the account.') })
      }
    } finally {
      setPending(false)
    }
  }

  async function importAccounts(rows: AdminAccountInput[]) {
    setPending(true)
    try {
      const result = await authApi.bulkCreateAccounts(rows)
      const list = await authApi.listAccounts()
      const nextUsers = list.users.map(toLocalUser)
      setUsers(nextUsers)
      updateDB((draft) => { draft.users = nextUsers })
      pushActivity('Imported', `${result.added} account${result.added === 1 ? '' : 's'}`, `${result.skipped} already added`, 'teal')
      setNotice({
        tone: 'success',
        text: `${result.added} account${result.added === 1 ? ' was' : 's were'} imported. ${result.skipped} already added.`,
      })
      return result
    } finally {
      setPending(false)
    }
  }

  async function removeAccount(id: string) {
    const target = users.find((item) => item.id === id)
    if (!target) return
    if (id === user?.id) {
      pushActivity('Blocked', target.name, 'You cannot delete your own account.', 'amber')
      setNotice({ tone: 'error', text: 'You cannot delete your own account.' })
      return
    }

    if (pending) return
    setPending(true)
    try {
      await authApi.deleteAccount(id)
      deleteUser(id)
      setUsers((current) => current.filter((item) => item.id !== id))
      setPendingRemove(null)
      pushActivity('Deleted', target.name, `${target.role} · ${target.schoolId ?? 'admin'}`, 'red')
      setNotice({ tone: 'success', text: `${target.name} was deleted.` })
    } catch (error) {
      setNotice({ tone: 'error', text: message(error, 'Could not delete the account.') })
    } finally {
      setPending(false)
    }
  }

  return {
    accountFilter,
    accountForm,
    accountQuery,
    activities,
    addOpen,
    closeAccountModal,
    db: { ...getDB(), users },
    editingId,
    importAccounts,
    notice,
    openAccounts,
    openAdd,
    openEdit,
    openResources,
    pending,
    pendingRemove,
    removeAccount,
    resourceFilter,
    resourceQuery,
    saveAccount,
    setAccountFilter,
    setAccountForm,
    setAccountQuery,
    setPendingRemove,
    setResourceFilter,
    setResourceQuery,
    setTab,
    tab,
    user,
  }
}
