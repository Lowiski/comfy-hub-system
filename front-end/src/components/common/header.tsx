import { cn } from '@/lib/cn'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { signOut, useCurrentUser } from '@/lib/data'
import { useUnreadCount } from '@/lib/messages'
import { notificationTime, useNotifications } from '@/lib/notifications'
import { Avatar } from '@/components/ui/avatar'
import { Icon } from '@/components/ui/icon'
import { useHeaderMenus } from '@/hooks'

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link className={cn('brand', light ? 'brand-light' : '')} to="/" aria-label="ComfyHub home">
      <span className="brand-mark">
        <Icon name="heart" size={20} strokeWidth={2.2} />
      </span>
      <span className="brand-name">
        Comfy<span>Hub</span>
      </span>
    </Link>
  )
}

export function GuestHeader() {
  const [open, setOpen] = useState(false)
  const user = useCurrentUser()

  return (
    <>
      <header className="guest-header">
        <div className="container header-inner">
          <Brand />
          <nav className="guest-nav" aria-label="Main navigation">
            <Link to="/#support">Support</Link>
            <Link to="/#how-it-works">How it works</Link>
            <Link to="/#counselors">Counselors</Link>
            <Link to="/#faq">FAQ</Link>
          </nav>
          <div className="header-actions">
            {user ? (
              <Link className="btn btn-primary btn-sm" to={user.role === 'counselor' ? '/counselor' : '/dashboard'}>
                {user.role === 'counselor' ? 'My workspace' : 'My dashboard'} <Icon name="arrowRight" size={16} />
              </Link>
            ) : (
              <Link className="btn btn-primary btn-sm" to="/login">
                Log in <Icon name="arrowRight" size={16} />
              </Link>
            )}
          </div>
          <button
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="mobile-menu-button"
            onClick={() => setOpen(!open)}
            type="button"
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </header>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link onClick={() => setOpen(false)} to="/#support">Support</Link>
          <Link onClick={() => setOpen(false)} to="/#how-it-works">How it works</Link>
          <Link onClick={() => setOpen(false)} to="/#counselors">Counselors</Link>
          <Link onClick={() => setOpen(false)} to="/#faq">FAQ</Link>
          <div className="mobile-nav-actions">
            {user ? (
              <Link className="btn btn-primary btn-block" to={user.role === 'counselor' ? '/counselor' : '/dashboard'}>
                {user.role === 'counselor' ? 'My workspace' : 'My dashboard'}
              </Link>
            ) : (
              <Link className="btn btn-primary btn-block" to="/login">Log in</Link>
            )}
          </div>
        </nav>
      )}
    </>
  )
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your counseling space at a glance' },
  '/appointment': { title: 'Appointments', subtitle: 'Book and manage your counseling sessions' },
  '/messages': { title: 'Messages', subtitle: 'Private conversations with your counseling team' },
  '/resources': { title: 'Resources', subtitle: 'Guides and tools for whatever you are facing' },
  '/wellness': { title: 'Wellness', subtitle: 'Small daily habits that make a difference' },
  '/profile': { title: 'Profile', subtitle: 'View and update your account details' },
  '/counselor': { title: 'Counselor workspace', subtitle: 'Bookings, student messages and resources' },
  '/admin': { title: 'Admin control center', subtitle: 'Oversee accounts and shared resources' },
}

export function AppHeader({ onMenu }: { onMenu: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { notifications, count } = useNotifications()
  const [search, setSearch] = useState('')
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const {
    notificationsOpen,
    profileOpen,
    notificationsRef,
    profileRef,
    openNotifications,
    openProfile,
    closeMenus,
    setProfileOpen,
  } = useHeaderMenus()
  const meta = pageTitles[location.pathname] ?? pageTitles['/dashboard']

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(search.trim() ? `/resources?q=${encodeURIComponent(search.trim())}` : '/resources')
    setSearch('')
  }

  async function handleSignOut() {
    setConfirmSignOut(false)
    closeMenus()
    await signOut()
    navigate('/')
  }

  return (
    <>
      <header className="topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" aria-label="Open navigation" onClick={onMenu} type="button">
          <Icon name="menu" size={21} />
        </button>
        <div>
          <p className="topbar-eyebrow">
            {user?.role === 'admin' ? 'Admin portal' : user?.role === 'counselor' ? 'Counselor portal' : 'Student portal'}
          </p>
          <h1 className="topbar-title">{meta.title}</h1>
        </div>
      </div>
      <div className="topbar-actions">
        <form className="topbar-search" onSubmit={handleSearch} role="search">
          <Icon name="search" size={17} />
          <input
            aria-label="Search resources"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search resources..."
            value={search}
          />
        </form>
        <div className="dropdown-wrap" ref={notificationsRef}>
          <button
            aria-expanded={notificationsOpen}
            aria-label={count > 0 ? `Notifications, ${count} unread messages` : 'Notifications'}
            className="icon-button notification-button"
            onClick={openNotifications}
            type="button"
          >
            <Icon name="bell" size={19} />
            {count > 0 && <span className="notification-count">{count > 99 ? '99+' : count}</span>}
          </button>
          {notificationsOpen && (
            <div className="dropdown notifications-dropdown">
              <div className="dropdown-head">
                <strong>Notifications</strong>
                <span className={cn('badge', count > 0 ? 'badge-rose' : 'badge-teal')}>
                  {count > 0 ? `${count} unread` : notifications.length > 0 ? 'Updates' : 'All caught up'}
                </span>
              </div>
              {notifications.length === 0 ? (
                <p className="notification-empty">Nothing new right now. You’re all caught up.</p>
              ) : notifications.slice(0, 6).map((item) => (
                <Link className="notification-item" key={item.id} onClick={closeMenus} to={item.href}>
                  <span className={cn('notification-icon', item.tone)}><Icon name={item.icon} size={16} /></span>
                  <span className="notification-copy">
                    <p>{item.title}</p>
                    <small>{item.body}</small>
                    <small className="notification-time">{notificationTime(item.time)}</small>
                  </span>
                </Link>
              ))}
              <Link
                className="dropdown-link"
                onClick={closeMenus}
                to={user?.role === 'admin' ? '/admin' : user?.role === 'counselor' ? '/counselor' : '/messages'}
              >
                {user?.role === 'admin' ? 'Open admin center' : 'Open messages'}
                <Icon name="arrowRight" size={14} />
              </Link>
            </div>
          )}
        </div>
        <div className="dropdown-wrap" ref={profileRef}>
          <button
            aria-expanded={profileOpen}
            className="profile-trigger"
            onClick={openProfile}
            type="button"
          >
            <Avatar name={user?.name} src={user?.avatar} />
            <span className="profile-text">
              <strong>{user?.name ?? 'Guest student'}</strong>
              <small>
                {user?.role === 'admin'
                  ? 'Administrator'
                  : user?.role === 'counselor'
                    ? 'Counselor'
                    : user?.grade ?? 'Student'}
              </small>
            </span>
            <Icon name="chevronDown" size={16} />
          </button>
          {profileOpen && (
            <div className="dropdown profile-dropdown">
              <div className="dropdown-head">
                <strong>{user?.name ?? 'Guest student'}</strong>
                <small>{user?.email ?? 'Not signed in'}</small>
              </div>
              <Link className="dropdown-item" to="/profile" onClick={() => setProfileOpen(false)}>
                <Icon name="user" size={17} /> Edit profile
              </Link>
              {user?.role !== 'counselor' && (
                <Link className="dropdown-item" to="/dashboard" onClick={() => setProfileOpen(false)}>
                  <Icon name="grid" size={17} /> Dashboard
                </Link>
              )}
              <Link className="dropdown-item" to="/messages" onClick={() => setProfileOpen(false)}>
                <Icon name="message" size={17} /> Messages
              </Link>
              {(user?.role === 'counselor' || user?.role === 'admin') && (
                <Link className="dropdown-item" to="/counselor" onClick={() => setProfileOpen(false)}>
                  <Icon name="users" size={17} /> Counselor workspace
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link className="dropdown-item" to="/admin" onClick={() => setProfileOpen(false)}>
                  <Icon name="shield" size={17} /> Admin control center
                </Link>
              )}
              {!user && (
                <Link className="dropdown-item" to="/login" onClick={() => setProfileOpen(false)}>
                  <Icon name="logout" size={17} /> Sign in
                </Link>
              )}
              {user && (
                <button className="dropdown-item danger" onClick={() => setConfirmSignOut(true)} type="button">
                  <Icon name="logout" size={17} /> Sign out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      </header>

      {confirmSignOut && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmSignOut(false)
          }}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="logout-title" style={{ width: 'min(100%, 440px)' }}>
            <div className="modal-head">
              <div>
                <h2 id="logout-title">Log out of ComfyHub?</h2>
                <p className="card-sub">You will need to sign in again to open your portal.</p>
              </div>
              <button aria-label="Close" className="btn btn-ghost" onClick={() => setConfirmSignOut(false)} type="button">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmSignOut(false)} type="button">Cancel</button>
              <button className="btn btn-primary" onClick={handleSignOut} type="button">
                <Icon name="logout" size={16} /> Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useCurrentUser()
  const unreadCount = useUnreadCount()

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: 'grid' as const },
    { to: '/appointment', label: 'Appointments', icon: 'calendar' as const },
    { to: '/messages', label: 'Messages', icon: 'message' as const },
    { to: '/resources', label: 'Resources', icon: 'book' as const },
    { to: '/wellness', label: 'Wellness', icon: 'heart' as const },
    { to: '/profile', label: 'Profile', icon: 'user' as const },
  ]
  const teacherLinks = [
    { to: '/counselor', label: 'Counselor workspace', icon: 'users' as const },
    { to: '/messages', label: 'Messages', icon: 'message' as const },
    { to: '/resources', label: 'Resources', icon: 'book' as const },
    { to: '/profile', label: 'Profile', icon: 'user' as const },
  ]
  const adminLinks = [
    { to: '/admin', label: 'Admin center', icon: 'shield' as const },
    { to: '/resources', label: 'Resources', icon: 'book' as const },
    { to: '/profile', label: 'Profile', icon: 'user' as const },
  ]
  const links = user?.role === 'admin'
    ? adminLinks
    : user?.role === 'student' || !user
      ? studentLinks
      : teacherLinks

  return (
    <>
      {open && <button aria-label="Close navigation" className="sidebar-backdrop" onClick={onClose} type="button" />}
      <aside className={cn('sidebar', open ? 'sidebar-open' : '')}>
        <div className="sidebar-top">
          <Brand />
          <button aria-label="Close navigation" className="sidebar-close" onClick={onClose} type="button">
            <Icon name="close" size={20} />
          </button>
        </div>
        <p className="sidebar-label">Workspace</p>
        <nav className="sidebar-nav" aria-label={`${user?.role === 'admin' ? 'Admin' : user?.role === 'counselor' ? 'Counselor' : 'Student'} navigation`}>
          {links.map((link) => (
            <NavLink
              className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
              key={link.to}
              onClick={onClose}
              to={link.to}
            >
              <Icon name={link.icon} size={19} />
              <span>{link.label}</span>
              {link.to === '/messages' && unreadCount > 0 && (
                <span className="side-count">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        {user?.role !== 'admin' && (
          <div className="sidebar-help">
            <span className="sidebar-help-icon"><Icon name="shield" size={19} /></span>
            <strong>Need help right now?</strong>
            <p>Talk to a trusted adult or call your school’s support line. ComfyHub is not an emergency service.</p>
            <Link to="/resources" onClick={onClose}>Find support <Icon name="arrowRight" size={15} /></Link>
          </div>
        )}
        <Link className="sidebar-user" onClick={onClose} to="/profile">
          <Avatar className="avatar-teal" name={user?.name} src={user?.avatar} />
          <div>
            <strong>{user?.name ?? 'Student'}</strong>
            <small>
              {user?.role === 'admin' ? 'Administrator' : user?.role === 'counselor' ? 'Counselor' : 'Student'} · Edit profile
            </small>
          </div>
        </Link>
      </aside>
    </>
  )
}
