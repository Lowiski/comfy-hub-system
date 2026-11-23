import { Badge, Icon, PageHeader, Toast, type IconName } from '@/components/ui'
import { useAdminPanel, type AdminTab } from '@/hooks'
import AdminAccounts from './sections/admin-accounts'
import AdminOverview from './sections/admin-overview'
import AdminResources from './sections/admin-resources'

const tabs: { id: AdminTab; label: string; icon: IconName }[] = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'accounts', label: 'Accounts', icon: 'users' },
  { id: 'resources', label: 'Resources', icon: 'book' },
]

export default function Admin() {
  const admin = useAdminPanel()
  const { notice, setTab, tab, user } = admin

  return (
    <>
      <PageHeader
        badge={<Badge tone="violet"><Icon name="shield" size={12} /> {user?.name ?? 'Administrator'} · Admin</Badge>}
        subtitle="Review accounts and shared resources. Add, update, and delete accounts here; private messages, appointments, and wellness entries stay hidden."
        title="Admin control center"
      />

      <div className="admin-tabs">
        {tabs.map((item) => (
          <button
            className={`admin-tab${tab === item.id ? ' active' : ''}`}
            key={item.id}
            onClick={() => setTab(item.id)}
            type="button"
          >
            <Icon name={item.icon} size={17} /> {item.label}
          </button>
        ))}
      </div>

      {notice && <Toast tone={notice.tone}>{notice.text}</Toast>}

      {tab === 'overview' && (
        <AdminOverview
          onOpenAccounts={admin.openAccounts}
          onOpenResources={admin.openResources}
          resources={admin.db.resources}
          users={admin.db.users}
        />
      )}

      {tab === 'accounts' && <AdminAccounts admin={admin} />}

      {tab === 'resources' && <AdminResources admin={admin} />}
    </>
  )
}
