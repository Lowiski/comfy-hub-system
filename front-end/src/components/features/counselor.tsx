import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  ButtonLink,
  ConfirmModal,
  Icon,
  PageHeader,
  StatCard,
  Toast,
  type IconName,
} from '@/components/ui'
import { useCurrentUser } from '@/lib/data'
import {
  useCounselorAppointments,
  useCounselorMessages,
  useResourceEditor,
  useTimedFlag,
  type CounselorConfirm,
} from '@/hooks'
import CounselorBookings from '@/components/features/sections/counselor-bookings'
import CounselorMessages from '@/components/features/sections/counselor-messages'
import CounselorNoteModal from '@/components/features/sections/counselor-note-modal'
import CounselorResources from '@/components/features/sections/counselor-resources'

type CounselorTab = 'appointments' | 'messages' | 'resources'

export default function Counselor() {
  const user = useCurrentUser()
  const [searchParams] = useSearchParams()
  const requestedConversation = searchParams.get('conversation')
  const [tab, setTab] = useState<CounselorTab>('appointments')
  const [notice, flashNotice] = useTimedFlag('', 4000)
  const [confirm, setConfirm] = useState<CounselorConfirm | null>(null)
  const booking = useCounselorAppointments(flashNotice)
  const resourceEditor = useResourceEditor(flashNotice)
  const inbox = useCounselorMessages(setConfirm, flashNotice)

  useEffect(() => {
    if (requestedConversation) void Promise.resolve().then(() => setTab('messages'))
  }, [requestedConversation])

  const tabs: { id: CounselorTab; label: string; icon: IconName; count?: number }[] = [
    { id: 'appointments', label: 'Who booked the counselor', icon: 'calendar', count: booking.upcomingCount },
    { id: 'messages', label: 'Who messaged me', icon: 'message', count: inbox.unreadCount },
    { id: 'resources', label: 'Resources', icon: 'book', count: resourceEditor.resources.length },
  ]

  return (
    <>
      <PageHeader
        actions={<ButtonLink to="/dashboard" variant="secondary"><Icon name="grid" size={16} /> Overview</ButtonLink>}
        subtitle={`Welcome back, ${user?.name ?? 'Counselor'}. Here is what your students need today.`}
        title="Counselor workspace"
      />

      <div className="stat-grid">
        <StatCard icon="calendar" label="Upcoming bookings" tone="teal" value={booking.upcomingCount} />
        <StatCard icon="message" label="Unread student messages" value={inbox.unreadCount} />
        <StatCard icon="book" label="Resources available" tone="violet" value={resourceEditor.resources.length} />
        <StatCard icon="users" label="Students with sessions" tone="amber" value={booking.studentCount} />
      </div>

      <div className="admin-tabs">
        {tabs.map((item) => (
          <button
            className={`admin-tab${tab === item.id ? ' active' : ''}`}
            key={item.id}
            onClick={() => setTab(item.id)}
            type="button"
          >
            <Icon name={item.icon} size={17} /> {item.label}
            {item.count !== undefined && <span className="tab-count">{item.count}</span>}
          </button>
        ))}
      </div>

      {notice && <Toast>{notice}</Toast>}
      {inbox.error && <Toast icon="alert" role="alert">{inbox.error}</Toast>}

      {tab === 'appointments' && (
        <CounselorBookings
          appointments={booking.appointments}
          changeStatus={booking.changeStatus}
          loading={booking.loading}
          openNote={booking.openNote}
          removeAppointment={booking.removeAppointment}
        />
      )}

      {tab === 'messages' && <CounselorMessages inbox={inbox} user={user} />}

      {tab === 'resources' && (
        <CounselorResources
          editor={resourceEditor}
          onEdit={(resource) => { resourceEditor.editResource(resource); setTab('resources') }}
        />
      )}

      {booking.noteFor && (
        <CounselorNoteModal
          noteFor={booking.noteFor}
          noteText={booking.noteText}
          onClose={() => booking.setNoteFor(null)}
          onSave={() => void booking.saveNote()}
          setNoteText={booking.setNoteText}
        />
      )}

      {confirm && (
        <ConfirmModal
          confirmLabel={confirm.confirmLabel}
          danger
          message={confirm.message}
          onCancel={() => setConfirm(null)}
          onConfirm={confirm.onConfirm}
          title={confirm.title}
        />
      )}
    </>
  )
}
