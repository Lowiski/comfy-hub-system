import { Link } from 'react-router'
import { Avatar, Card, CardHead, Icon } from '@/components/ui'
import type { useProfileEditor } from '@/hooks'

type Editor = ReturnType<typeof useProfileEditor>

type Props = Pick<Editor, 'form' | 'isStudent' | 'displayGrade'>

export default function ProfilePreview({ form, isStudent, displayGrade }: Props) {
  return (
    <div className="stack">
      <Card>
        <CardHead
          actions={<Icon name="eye" size={18} />}
          subtitle="A quick look at the details you have added."
          title="Profile preview"
        />
        <div className="profile-preview">
          <Avatar className="profile-preview-avatar" name={form.name} src={form.avatar} />
          <h4>{form.name || 'Your name'}</h4>
          <p>{isStudent ? displayGrade || 'Add your program and year level' : form.department || 'Add your department'}</p>
        </div>
        <div className="profile-details">
          <div><Icon name="mail" size={16} /><span>{form.email || 'No email added'}</span></div>
          <div><Icon name="phone" size={16} /><span>{form.phone || 'No contact number added'}</span></div>
          <div><Icon name="location" size={16} /><span>{form.address || 'No address added'}</span></div>
        </div>
        {form.bio ? (
          <p className="profile-bio">“{form.bio}”</p>
        ) : (
          <p className="hint" style={{ marginTop: 14 }}>Add a short introduction so your counselor can get to know you.</p>
        )}
      </Card>

      <div className="info-panel">
        <h4><Icon name="shield" size={17} /> Your information stays private</h4>
        <p>
          Your personal details help your counseling team support you. They are stored with your school account
          and are never used for advertising.
        </p>
        <Link className="text-link" style={{ marginTop: 12 }} to="/resources">
          Read our support guide <Icon name="arrowRight" size={15} />
        </Link>
      </div>
    </div>
  )
}
