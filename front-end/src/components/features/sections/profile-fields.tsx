import { Button, CardActions, Field, Icon, IconInput, Textarea } from '@/components/ui'
import type { useProfileEditor } from '@/hooks'
import ProfileStaffFields from './profile-staff-fields'
import ProfileStudentFields from './profile-student-fields'

type Editor = ReturnType<typeof useProfileEditor>

type Props = Pick<
  Editor,
  'form' | 'error' | 'isStudent' | 'dirty' | 'saving' | 'set' | 'discard' | 'handleSubmit'
>

export default function ProfileFields({
  form,
  error,
  isStudent,
  dirty,
  saving,
  set,
  discard,
  handleSubmit,
}: Props) {
  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {error && <div className="form-alert error"><Icon name="alert" size={17} /> {error}</div>}

      {isStudent ? <ProfileStudentFields form={form} set={set} /> : <ProfileStaffFields form={form} set={set} />}

      <Field htmlFor="profile-address" label="Address " optional="optional">
        <IconInput
          icon="location"
          id="profile-address"
          onChange={(event) => set('address', event.target.value)}
          placeholder="City or full address"
          value={form.address}
        />
      </Field>

      <Field hint={`${form.bio.length}/300 characters`} htmlFor="profile-bio" label="About me " optional="optional">
        <Textarea
          id="profile-bio"
          maxLength={300}
          onChange={(event) => set('bio', event.target.value)}
          placeholder="Share a few things you would like your counselor to know."
          value={form.bio}
        />
      </Field>

      <CardActions variant="form">
        <Button disabled={!dirty || saving} type="submit" variant="teal">
          <Icon name="check" size={16} /> {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button disabled={!dirty || saving} onClick={discard} type="button" variant="secondary">Discard</Button>
        {saving && <span className="hint">Saving to your account…</span>}
        {!saving && dirty && <span className="hint">You have unsaved changes.</span>}
        {!saving && !dirty && <span className="hint">All changes saved.</span>}
      </CardActions>
    </form>
  )
}
