import { Badge, Card, Icon, PageHeader, Toast } from '@/components/ui'
import { useProfileEditor } from '@/hooks'
import ProfileFields from '@/components/features/sections/profile-fields'
import ProfileIdentity from '@/components/features/sections/profile-identity'
import ProfilePreview from '@/components/features/sections/profile-preview'

export default function Profile() {
  const editor = useProfileEditor()

  if (!editor.user) return null

  return (
    <>
      <PageHeader
        badge={<Badge tone="teal"><Icon name="lock" size={12} /> Private to you</Badge>}
        subtitle="Add or update your personal information. Changes are saved to your school account."
        title="Your profile"
      />

      {editor.saved && (
        <Toast role="status">
          <span><strong>Changes saved.</strong> Your profile has been updated in your account.</span>
        </Toast>
      )}

      <div className="two-col">
        <Card>
          <ProfileIdentity {...editor} />
          <ProfileFields {...editor} />
        </Card>
        <ProfilePreview {...editor} />
      </div>
    </>
  )
}
