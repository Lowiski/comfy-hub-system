import { appointmentFormatIcons, formatAppointmentDate } from '@/lib/appointments'
import { Avatar, Badge, Card, CardHead, Icon } from '@/components/ui'
import type { useAppointmentBooking } from '@/hooks'

type Booking = ReturnType<typeof useAppointmentBooking>

type Props = Pick<Booking, 'counselor' | 'date' | 'time' | 'format' | 'topic'>

export default function AppointmentSummary({ counselor, date, time, format, topic }: Props) {
  return (
    <Card className="summary-card">
      <CardHead
        actions={<Badge tone="blue">Live</Badge>}
        subtitle="Your request at a glance."
        title="Session summary"
      />
      <div className="summary-hero">
        {counselor ? (
          <>
            <Avatar className="avatar-teal" name={counselor.name} src={counselor.avatar ?? undefined} />
            <div>
              <strong>{counselor.name}</strong>
              <small>{counselor.department ?? 'School counselor'}</small>
            </div>
          </>
        ) : (
          <>
            <span className="avatar avatar-teal"><Icon name="user" size={18} /></span>
            <div>
              <strong>No counselor selected</strong>
              <small>Choose one above to begin.</small>
            </div>
          </>
        )}
      </div>
      <dl className="summary-list">
        <div><dt>Date</dt><dd>{date ? formatAppointmentDate(date) : 'Choose a date'}</dd></div>
        <div><dt>Time</dt><dd><Icon name="clock" size={13} /> {time}</dd></div>
        <div><dt>Format</dt><dd><Icon name={appointmentFormatIcons[format]} size={13} /> {format}</dd></div>
        <div><dt>Topic</dt><dd>{topic}</dd></div>
      </dl>
      <div className="summary-note"><Icon name="shield" size={15} /> Only you and your counselor can see this session.</div>
    </Card>
  )
}
