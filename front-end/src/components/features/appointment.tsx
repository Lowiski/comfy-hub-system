import {
  ButtonLink,
  ConfirmModal,
  Icon,
  PageHeader,
  Toast,
} from '@/components/ui'
import { useAppointmentBooking } from '@/hooks'
import AppointmentBookingForm from '@/components/features/sections/appointment-booking-form'
import AppointmentHelp from '@/components/features/sections/appointment-help'
import AppointmentList from '@/components/features/sections/appointment-list'
import AppointmentSummary from '@/components/features/sections/appointment-summary'

export default function Appointment() {
  const booking = useAppointmentBooking()

  return (
    <>
      <PageHeader
        actions={<ButtonLink to="/messages" variant="secondary"><Icon name="message" size={16} /> Prefer to message?</ButtonLink>}
        className="appt-page-head"
        eyebrow={<><Icon name="calendar" size={13} /> Counseling / Appointments</>}
        subtitle="Choose a time that works for you. Sessions are private and free for students."
        title="Book a counseling session"
      />

      {booking.success && <Toast>{booking.success}</Toast>}
      {booking.error && <Toast tone="error">{booking.error}</Toast>}

      <div className="two-col">
        <AppointmentBookingForm booking={booking} />

        <div className="stack appt-side">
          <AppointmentSummary {...booking} />
          <AppointmentList {...booking} />
          <AppointmentHelp />
        </div>
      </div>

      {booking.confirm && (
        <ConfirmModal
          confirmLabel={booking.confirm.confirmLabel}
          danger
          message={booking.confirm.message}
          onCancel={() => booking.setConfirm(null)}
          onConfirm={booking.confirm.onConfirm}
          title={booking.confirm.title}
        />
      )}
    </>
  )
}
