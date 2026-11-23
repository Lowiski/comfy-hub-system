import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { currentUser, type Role } from '@/lib/data'

export function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const user = currentUser()
  if (!user) return <Navigate replace to="/login" />
  if (!allow.includes(user.role)) return <Navigate replace to="/dashboard" />
  return children
}
