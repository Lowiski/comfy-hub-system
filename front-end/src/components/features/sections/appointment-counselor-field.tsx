import { Avatar, Badge, Field, Icon, Select } from '@/components/ui'
import type { useAppointmentBooking } from '@/hooks'

type Booking = ReturnType<typeof useAppointmentBooking>

type Props = Pick<Booking, 'counselors' | 'loading' | 'counselorId' | 'setCounselorId' | 'counselor'>

export default function AppointmentCounselorField({
  counselors,
  loading,
  counselorId,
  setCounselorId,
  counselor,
}: Props) {
  return (
    <Field htmlFor="appt-counselor" label="Choose your counselor">
      <Select
        id="appt-counselor"
        onChange={(event) => setCounselorId(event.target.value)}
        required
        value={counselorId}
      >
        {counselors.length === 0 && <option value="">{loading ? 'Loading counselors…' : 'No counselors available yet'}</option>}
        {counselors.map((item) => (
          <option key={item.id} value={item.id}>{item.name}{item.department ? ` — ${item.department}` : ''}</option>
        ))}
      </Select>
      {counselor ? (
        <div className="counselor-preview">
          <Avatar className="avatar-teal" name={counselor.name} src={counselor.avatar ?? undefined} />
          <div className="counselor-preview-copy">
            <strong>{counselor.name}</strong>
            <small>{counselor.department ?? 'School counselor'}{counselor.schoolId ? ` · ID ${counselor.schoolId}` : ''}</small>
          </div>
          <Badge tone="teal"><Icon name="checkCircle" size={12} /> Active</Badge>
        </div>
      ) : (
        <div className="counselor-preview counselor-preview-empty">
          <span className="avatar avatar-teal"><Icon name="user" size={18} /></span>
          <div className="counselor-preview-copy">
            <strong>{loading ? 'Loading counselor accounts…' : 'Choose an active counselor'}</strong>
            <small>Only school-approved counselor accounts can be booked.</small>
          </div>
        </div>
      )}
    </Field>
  )
}
