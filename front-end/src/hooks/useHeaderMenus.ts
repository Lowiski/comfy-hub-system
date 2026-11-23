import { useRef, useState } from 'react'
import { useOutsideClick } from '@/hooks/useOutsideClick'


export function useHeaderMenus() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useOutsideClick((event) => {
    if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
      setNotificationsOpen(false)
    }
    if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
      setProfileOpen(false)
    }
  })

  function openNotifications() {
    setNotificationsOpen((current) => !current)
    setProfileOpen(false)
  }

  function openProfile() {
    setProfileOpen((current) => !current)
    setNotificationsOpen(false)
  }

  function closeMenus() {
    setNotificationsOpen(false)
    setProfileOpen(false)
  }

  return {
    notificationsOpen,
    profileOpen,
    notificationsRef,
    profileRef,
    openNotifications,
    openProfile,
    closeMenus,
    setNotificationsOpen,
    setProfileOpen,
  }
}
