import { cn } from '@/lib/cn'
import { appointmentTimes, type useAppointmentBooking } from '@/hooks'

type Booking = ReturnType<typeof useAppointmentBooking>

type Props = Pick<Booking, 'time' | 'setTime' | 'bookedSlots'>

export default function AppointmentSlots({ time, setTime, bookedSlots }: Props) {
  return (
    <div className="field">
      <div className="slot-section-head">
        <label>Available times</label>
        <div className="slot-legend">
          <span><i className="legend-dot" /> Free</span>
          <span><i className="legend-dot selected" /> Selected</span>
          <span><i className="legend-dot booked" /> Booked</span>
        </div>
      </div>
      <div className="slot-grid">
        {appointmentTimes.map((slot) => {
          const taken = bookedSlots.has(slot)
          return (
            <button
              aria-pressed={time === slot}
              className={cn('slot', time === slot ? 'active' : '', taken ? 'slot-taken' : '')}
              disabled={taken}
              key={slot}
              onClick={() => setTime(slot)}
              title={taken ? 'Already booked with this counselor' : undefined}
              type="button"
            >
              {slot}
            </button>
          )
        })}
      </div>
      <p className="hint">Booked times with this counselor on the chosen date are disabled.</p>
    </div>
  )
}
