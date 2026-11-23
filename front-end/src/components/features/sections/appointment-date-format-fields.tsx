import { cn } from '@/lib/cn'
import { appointmentFormatIcons, todayISO } from '@/lib/appointments'
import { Field, FieldRow, Icon, IconInput } from '@/components/ui'
import { appointmentFormats, type useAppointmentBooking } from '@/hooks'

type Booking = ReturnType<typeof useAppointmentBooking>

type Props = Pick<
  Booking,
  'date' | 'setDate' | 'time' | 'setTime' | 'format' | 'setFormat' | 'quickDates'
>

export default function AppointmentDateFields({
  date,
  setDate,
  setTime,
  format,
  setFormat,
  quickDates,
}: Props) {
  const chooseDate = (value: string) => { setDate(value); setTime('10:30 AM') }

  return (
    <FieldRow>
      <Field htmlFor="appt-date" label="Preferred date">
        <IconInput
          icon="calendar"
          id="appt-date"
          min={todayISO()}
          onChange={(event) => chooseDate(event.target.value)}
          required
          type="date"
          value={date}
        />
        <div className="quick-dates">
          {quickDates.map((quick) => (
            <button
              className={cn('quick-date', date === quick.value ? 'active' : '')}
              key={quick.label}
              onClick={() => chooseDate(quick.value)}
              type="button"
            >
              {quick.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Session format">
        <div aria-label="Session format" className="format-switch" role="group">
          {appointmentFormats.map((item) => (
            <button
              aria-pressed={format === item}
              className={cn('format-option', format === item ? 'active' : '')}
              key={item}
              onClick={() => setFormat(item)}
              type="button"
            >
              <Icon name={appointmentFormatIcons[item]} size={18} />
              <span>
                <strong>{item}</strong>
                <small>{item === 'Online' ? 'In Messages' : 'Counseling office'}</small>
              </span>
            </button>
          ))}
        </div>
      </Field>
    </FieldRow>
  )
}
