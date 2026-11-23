import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import Login from '@/components/auth/login'
import { currentUser } from '@/lib/data'
import { AppHeader, Sidebar } from '@/components/common/header'

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const user = currentUser()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const path = location.pathname.replace(/\/$/, '')
  const isAdminRoute = path === '/admin'
  const isDashboardRoute = path === '/dashboard'
  const isCounselorRoute = path === '/counselor'
  const isMessagesRoute = path === '/messages'
  const isStudentOnlyRoute = path === '/appointment' || path === '/wellness'

  if (!user) {
    if (isAdminRoute) return <Login mode="admin" />
    return <Navigate replace to="/login" />
  }

  if (isAdminRoute && user.role !== 'admin') return <Navigate replace to="/dashboard" />
  if (isDashboardRoute && user.role === 'admin') return <Navigate replace to="/admin" />
  if (isDashboardRoute && user.role === 'counselor') return <Navigate replace to="/counselor" />
  if (isCounselorRoute && user.role !== 'counselor') return <Navigate replace to={user.role === 'admin' ? '/admin' : '/dashboard'} />
  if (isMessagesRoute && user.role === 'admin') return <Navigate replace to="/admin" />
  if (isStudentOnlyRoute && user.role === 'admin') return <Navigate replace to="/admin" />
  if (isStudentOnlyRoute && user.role === 'counselor') return <Navigate replace to="/counselor" />

  return (
    <div className="app-shell">
      <Sidebar onClose={() => setMenuOpen(false)} open={menuOpen} />
      <div className="app-main">
        <AppHeader onMenu={() => setMenuOpen(true)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
