import {
  Button,
  Field,
  Modal,
  ModalActions,
  ModalBody,
  ModalHead,
  Textarea,
} from '@/components/ui'
import { formatAppointmentDate } from '@/lib/appointments'
import type { useCounselorAppointments } from '@/hooks'

type Booking = ReturnType<typeof useCounselorAppointments>
type Note = NonNullable<Booking['noteFor']>

type Props = {
  noteFor: Note
  noteText: string
  setNoteText: (value: string) => void
  onClose: () => void
  onSave: () => void
}

export default function CounselorNoteModal({ noteFor, noteText, setNoteText, onClose, onSave }: Props) {
  return (
    <Modal
      closeOn="mousedown"
      labelledBy="counselor-note-title"
      onClose={onClose}
      role="dialog"
    >
      <ModalHead closeIconSize={16} closeTitle="Close" onClose={onClose}>
        <h3 id="counselor-note-title">Counselor note</h3>
        <p>Only you and the student can see notes on this session.</p>
      </ModalHead>
      <ModalBody>
        <p className="hint">Session with {noteFor.studentName} · {formatAppointmentDate(noteFor.date)} at {noteFor.time}</p>
        <Field htmlFor="counselor-note" label="Session note">
          <Textarea
            id="counselor-note"
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="What would you like to remember or follow up on?"
            value={noteText}
          />
        </Field>
      </ModalBody>
      <ModalActions>
        <Button onClick={onClose} type="button" variant="secondary">Cancel</Button>
        <Button onClick={onSave} type="button" variant="primary">Save note</Button>
      </ModalActions>
    </Modal>
  )
}
