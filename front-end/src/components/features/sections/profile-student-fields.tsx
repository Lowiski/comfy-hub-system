import { Field, FieldRow, IconInput, Select } from '@/components/ui'
import { optionsWithCurrent, programs, yearLevels } from '@/hooks'
import type { useProfileEditor } from '@/hooks'

type Editor = ReturnType<typeof useProfileEditor>

type Props = Pick<Editor, 'form' | 'set'>

export default function ProfileStudentFields({ form, set }: Props) {
  return (
    <>
      <FieldRow>
        <Field htmlFor="profile-name" label="Full name">
          <IconInput
            icon="user"
            id="profile-name"
            onChange={(event) => set('name', event.target.value)}
            placeholder="Jordan Avery"
            required
            value={form.name}
          />
        </Field>
        <Field
          hint="Your school ID is issued by the office and cannot be changed here."
          htmlFor="profile-student-id"
          label="Student ID"
        >
          <IconInput icon="graduation" id="profile-student-id" readOnly value={form.studentId} />
        </Field>
      </FieldRow>

      <FieldRow>
        <Field htmlFor="profile-email" label="School email">
          <IconInput
            icon="mail"
            id="profile-email"
            onChange={(event) => set('email', event.target.value)}
            placeholder="you@school.edu"
            required
            type="email"
            value={form.email}
          />
        </Field>
        <Field htmlFor="profile-phone" label="Contact number " optional="optional">
          <IconInput
            icon="phone"
            id="profile-phone"
            onChange={(event) => set('phone', event.target.value)}
            placeholder="09xx xxx xxxx"
            type="tel"
            value={form.phone}
          />
        </Field>
      </FieldRow>

      <FieldRow>
        <Field htmlFor="profile-program" label={<>Bachelor&apos;s program</>}>
          <Select
            id="profile-program"
            onChange={(event) => set('program', event.target.value)}
            value={form.program}
          >
            <option value="">Select a program</option>
            {optionsWithCurrent(programs, form.program).map((program) => <option key={program} value={program}>{program}</option>)}
          </Select>
        </Field>
        <Field htmlFor="profile-year" label="Year level">
          <Select
            id="profile-year"
            onChange={(event) => set('yearLevel', event.target.value)}
            value={form.yearLevel}
          >
            <option value="">Select a year level</option>
            {optionsWithCurrent(yearLevels, form.yearLevel).map((year) => <option key={year} value={year}>{year}</option>)}
          </Select>
        </Field>
      </FieldRow>
    </>
  )
}
