import { cn } from '@/lib/cn'
import { appointmentFormatIcons, appointmentDateParts, appointmentStatusLabels, isUpcoming } from '@/lib/appointments'
import {
  Badge,
  Card,
  CardHead,
  Chip,
  EmptyState,
  Icon,
  LinkButton,
} from '@/components/ui'
import type { useAppointmentBooking } from '@/hooks'

type Booking = ReturnType<typeof useAppointmentBooking>

type Props = Pick<
  Booking,
  'mine' | 'counts' | 'filter' | 'setFilter' | 'loading' | 'visible' | 'handleReschedule' | 'askCancel'
>

export default function AppointmentList({
  mine,
  counts,
  filter,
  setFilter,
  loading,
  visible,
  handleReschedule,
  askCancel,
}: Props) {
  return (
    <Card className="appt-panel">
      <CardHead
        actions={<span className="appt-count">{mine.length}</span>}
        subtitle="Saved to your account and visible to your counselor."
        title="Your appointments"
      />

      <div className="filter-row">
        {([
          ['upcoming', 'Upcoming'],
          ['past', 'Past'],
          ['cancelled', 'Cancelled'],
        ] as const).map(([id, label]) => (
          <Chip active={filter === id} key={id} onClick={() => setFilter(id)} type="button">
            {label} <span className="chip-count">{counts[id]}</span>
          </Chip>
        ))}
      </div>

      {loading ? (
        <EmptyState loading><p>Loading appointments…</p></EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon="calendar" iconSize={26}>
          <p>{filter === 'upcoming' ? 'No upcoming sessions. Choose a time and your counselor will see it right away.' : `No ${filter} sessions.`}</p>
        </EmptyState>
      ) : (
        <div className="appt-list">
          {visible.map((item) => {
            const parts = appointmentDateParts(item.date)
            return (
              <article className={cn('appt-item', isUpcoming(item) ? 'upcoming' : '')} key={item.id}>
                <div className="appt-date-tile">
                  <small>{parts.month}</small>
                  <strong>{parts.day}</strong>
                  <small>{parts.weekday}</small>
                </div>
                <div className="appt-item-body">
                  <div className="appt-item-head">
                    <div>
                      <h4>{item.counselorName}</h4>
                      <p>{item.topic}</p>
                    </div>
                    <Badge tone={item.status}>{appointmentStatusLabels[item.status]}</Badge>
                  </div>
                  <div className="appt-meta">
                    <span><Icon name="clock" size={13} /> {item.time}</span>
                    <span><Icon name={appointmentFormatIcons[item.format]} size={13} /> {item.format}</span>
                  </div>
                  {item.notes && <p className="appt-note"><strong>You:</strong> {item.notes}</p>}
                  {item.counselorNotes && <p className="appt-note counselor-note"><strong>Counselor:</strong> {item.counselorNotes}</p>}
                  <div className="appt-actions">
                    <LinkButton primary to="/messages">Message counselor <Icon name="arrowRight" size={13} /></LinkButton>
                    {(item.status === 'pending' || item.status === 'confirmed') && (
                      <>
                        <button className="link-button" onClick={() => handleReschedule(item)} type="button">Reschedule</button>
                        <button className="link-button link-button-danger" onClick={() => askCancel(item)} type="button">Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </Card>
  )
}
