import '@/styles/global.css'

import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { AppShell } from '@/components/common/app-shell'
import { restoreSession } from '@/lib/data'

import GuestLayout from '@/pages/dashboard/guest/layout'
import HomePage from '@/pages/dashboard/guest/home'
import LoginPage from '@/pages/dashboard/guest/login'
import ForgotPasswordPage from '@/pages/dashboard/guest/forgotpass'
import ResetPasswordPage from '@/pages/dashboard/guest/resetpassword'

import AdminPage from '@/pages/dashboard/admin'

import CounselorPage from '@/pages/dashboard/users/teacher'
import DashboardPage from '@/pages/dashboard/users/student'
import AppointmentPage from '@/pages/dashboard/users/student/appointment'
import MessagesPage from '@/pages/dashboard/users/student/messages'
import ProfilePage from '@/pages/dashboard/users/student/profile'
import ResourcesPage from '@/pages/dashboard/users/student/resources'
import WellnessPage from '@/pages/dashboard/users/student/wellness'

export function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void restoreSession().finally(() => setReady(true))
  }, [])

  if (!ready) {
    return <div className="app-boot"><span className="spinner" /> Loading ComfyHub…</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forgotpass" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<AppShell />}>
          <Route path="admin" element={<AdminPage />} />

          <Route path="counselor" element={<CounselorPage />} />

          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="appointment" element={<AppointmentPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="wellness" element={<WellnessPage />} />
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
