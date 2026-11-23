import { cn } from '@/lib/cn'
import { Badge, Button, Card, CardActions, Field, Icon, Select, Textarea } from '@/components/ui'
import { appointmentTopics, type useAppointmentBooking } from '@/hooks'
import AppointmentCounselorField from './appointment-counselor-field'
import AppointmentDateFields from './appointment-date-format-fields'
import AppointmentSlots from './appointment-slots'

type Booking = ReturnType<typeof useAppointmentBooking>

type Props = { booking: Booking }

export default function AppointmentBookingForm({ booking }: Props) {
  const {
    counselors,
    counselorId,
    date,
    topic,
    setTopic,
    notes,
    setNotes,
    bookingId,
    resetForm,
    handleSubmit,
  } = booking

  return (
    <Card className="booking-card">
      <div className="booking-top">
        <div>
          <h3 className="card-title">{bookingId ? 'Reschedule your session' : 'Session details'}</h3>
          <p className="card-sub">A few quick details, then your counselor will see the request.</p>
        </div>
        <Badge tone="teal"><Icon name="lock" size={12} /> Private</Badge>
      </div>

      <div className="booking-steps" aria-hidden="true">
        <span className={cn('booking-step', counselorId ? 'done' : 'active')}><b>1</b> Counselor</span>
        <span className={cn('booking-step', !counselorId ? '' : date ? 'done' : 'active')}><b>2</b> Date &amp; format</span>
        <span className={cn('booking-step', date ? 'active' : '')}><b>3</b> Your notes</span>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <AppointmentCounselorField {...booking} />

        <div className="section-label"><span>2</span> When &amp; how</div>
        <AppointmentDateFields {...booking} />
        <AppointmentSlots {...booking} />

        <div className="section-label"><span>3</span> What you would like help with</div>
        <Field htmlFor="appt-topic" label="Session topic">
          <Select id="appt-topic" onChange={(event) => setTopic(event.target.value)} value={topic}>
            {appointmentTopics.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>

        <Field htmlFor="appt-notes" label="Anything you want your counselor to know? (optional)">
          <div className="notes-wrap">
            <Textarea
              id="appt-notes"
              maxLength={500}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="A few lines is plenty. You can always share more in the session."
              value={notes}
            />
            <span className="char-count">{notes.length}/500</span>
          </div>
        </Field>

        <CardActions variant="form">
          <Button disabled={!counselorId || counselors.length === 0} type="submit" variant="primary">
            <Icon name={bookingId ? 'checkCircle' : 'calendar'} size={17} /> {bookingId ? 'Save changes' : 'Request appointment'}
          </Button>
          {bookingId && <Button onClick={resetForm} size="sm" type="button" variant="ghost">Cancel edit</Button>}
          <span className="hint">You can reschedule or cancel any time.</span>
        </CardActions>
      </form>
    </Card>
  )
}
