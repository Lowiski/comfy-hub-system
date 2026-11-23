import { Field, FieldRow, IconInput } from '@/components/ui'
import type { useProfileEditor } from '@/hooks'

type Editor = ReturnType<typeof useProfileEditor>

type Props = Pick<Editor, 'form' | 'set'>

export default function ProfileStaffFields({ form, set }: Props) {
  return (
    <>
      <FieldRow>
        <Field htmlFor="profile-name" label="Full name">
          <IconInput
            icon="user"
            id="profile-name"
            onChange={(event) => set('name', event.target.value)}
            placeholder="Ms. Elena Rivera"
            required
            value={form.name}
          />
        </Field>
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
      </FieldRow>

      <FieldRow>
        <Field htmlFor="profile-department" label="Department">
          <IconInput
            icon="users"
            id="profile-department"
            onChange={(event) => set('department', event.target.value)}
            placeholder="Guidance & Counseling"
            value={form.department}
          />
        </Field>
        <Field htmlFor="profile-phone" label="Contact number " optional="optional">
          <IconInput
            icon="phone"
            id="profile-phone"
            onChange={(event) => set('phone', event.target.value)}
            placeholder="+15551234567"
            type="tel"
            value={form.phone}
          />
        </Field>
      </FieldRow>
    </>
  )
}
