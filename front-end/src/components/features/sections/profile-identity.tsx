import { Avatar, Badge, Icon } from '@/components/ui'
import type { useProfileEditor } from '@/hooks'

type Editor = ReturnType<typeof useProfileEditor>

type Props = Pick<Editor, 'form' | 'fileInput' | 'isStudent' | 'displayGrade' | 'set' | 'handleAvatarChange'>

export default function ProfileIdentity({
  form,
  fileInput,
  isStudent,
  displayGrade,
  set,
  handleAvatarChange,
}: Props) {
  return (
    <>
      <div className="profile-identity">
        <div className="profile-avatar-wrap">
          <Avatar className="profile-avatar" name={form.name} src={form.avatar} />
          <button
            aria-label="Change profile picture"
            className="avatar-edit"
            onClick={() => fileInput.current?.click()}
            type="button"
          >
            <Icon name="camera" size={15} />
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="card-title">{form.name || 'Your name'}</h3>
          <p className="card-sub">{isStudent ? displayGrade || 'Student' : form.department || 'Staff member'}</p>
          <div className="profile-photo-actions">
            <button className="photo-action" onClick={() => fileInput.current?.click()} type="button">
              {form.avatar ? 'Change photo' : 'Add a photo'}
            </button>
            {form.avatar && (
              <button className="photo-action remove" onClick={() => set('avatar', '')} type="button">Remove</button>
            )}
          </div>
        </div>
        <Badge tone={isStudent ? 'blue' : 'violet'}>{isStudent ? 'Student account' : 'Staff account'}</Badge>
        <input
          accept="image/*"
          className="visually-hidden"
          onChange={handleAvatarChange}
          ref={fileInput}
          type="file"
        />
      </div>
      <div className="divider" />
    </>
  )
}
