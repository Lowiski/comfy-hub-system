import {
  Badge,
  Card,
  CardHead,
  EmptyState,
  Icon,
  IconButton,
  ManageHead,
  ManageRow,
  ManageTable,
  Select,
} from '@/components/ui'
import { appointmentStatusLabels, formatAppointmentDate } from '@/lib/appointments'
import type { useCounselorAppointments } from '@/hooks'

type Booking = ReturnType<typeof useCounselorAppointments>

type Props = Pick<
  Booking,
  'appointments' | 'loading' | 'changeStatus' | 'removeAppointment' | 'openNote'
>

export default function CounselorBookings({
  appointments,
  loading,
  changeStatus,
  removeAppointment,
  openNote,
}: Props) {
  return (
    <Card>
      <CardHead
        actions={<Badge tone="teal"><Icon name="lock" size={12} /> Student details</Badge>}
        subtitle="Every appointment requested by a student, with status you can manage."
        title="Who booked a session"
      />
      {loading ? (
        <EmptyState loading><p>Loading bookings…</p></EmptyState>
      ) : appointments.length === 0 ? (
        <EmptyState icon="calendar" iconSize={26}><p>No bookings yet.</p></EmptyState>
      ) : (
        <ManageTable className="appointments-table">
          <ManageHead><span>Student</span><span>Session</span><span>Format</span><span>Status</span><span>Actions</span></ManageHead>
          {appointments.map((appointment) => (
            <ManageRow key={appointment.id}>
              <div>
                <strong>{appointment.studentName}</strong>
                <small>{appointment.studentSchoolId ? `ID ${appointment.studentSchoolId}` : 'Student account'}</small>
              </div>
              <div>
                <strong>{formatAppointmentDate(appointment.date)} · {appointment.time}</strong>
                <small>{appointment.topic}</small>
                {appointment.notes && <small className="row-note">Student: {appointment.notes}</small>}
                {appointment.counselorNotes && <small className="row-note">Note: {appointment.counselorNotes}</small>}
              </div>
              <div><Badge tone="blue">{appointment.format}</Badge></div>
              <div>
                <Select
                  className={`status-select status-${appointment.status}`}
                  onChange={(event) => void changeStatus(appointment, event.target.value as typeof appointment.status)}
                  unstyled
                  value={appointment.status}
                >
                  {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
                    <option key={status} value={status}>{appointmentStatusLabels[status]}</option>
                  ))}
                </Select>
              </div>
              <div className="row-actions">
                <IconButton iconSize={15} name="edit" onClick={() => openNote(appointment)} title="Counselor note" type="button" />
                <IconButton danger iconSize={15} name="trash" onClick={() => removeAppointment(appointment)} title="Remove booking" type="button" />
              </div>
            </ManageRow>
          ))}
        </ManageTable>
      )}
    </Card>
  )
}
