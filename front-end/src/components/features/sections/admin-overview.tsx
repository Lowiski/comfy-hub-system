import { Badge, Button, Card, CardHead, Icon, StatCard, type IconName } from '@/components/ui'
import type { AccountFilter } from '@/hooks'
import type { Resource, Role, User } from '@/lib/data'

type Props = {
  users: User[]
  resources: Resource[]
  onOpenAccounts: (filter: AccountFilter) => void
  onOpenResources: (category?: string) => void
}

const roleRows: { role: Role; label: string; icon: IconName; tone: string }[] = [
  { role: 'student', label: 'Students', icon: 'graduation', tone: 'teal' },
  { role: 'counselor', label: 'Counselors', icon: 'shield', tone: 'blue' },
  { role: 'admin', label: 'Administrators', icon: 'key', tone: 'violet' },
]

export default function AdminOverview({ users, resources, onOpenAccounts, onOpenResources }: Props) {
  const roleCount = (role: Role) => users.filter((user) => user.role === role).length
  const categoryCounts = Object.entries(
    resources.reduce<Record<string, number>>((totals, resource) => {
      totals[resource.category] = (totals[resource.category] ?? 0) + 1
      return totals
    }, {}),
  ).sort((a, b) => b[1] - a[1])

  const stats: { label: string; value: number; icon: IconName; tone: string; onClick: () => void }[] = [
    { label: 'Total accounts', value: users.length, icon: 'users', tone: '', onClick: () => onOpenAccounts('all') },
    { label: 'Students', value: roleCount('student'), icon: 'graduation', tone: 'teal', onClick: () => onOpenAccounts('student') },
    { label: 'Counselors', value: roleCount('counselor'), icon: 'shield', tone: 'blue', onClick: () => onOpenAccounts('counselor') },
    { label: 'Resources', value: resources.length, icon: 'book', tone: 'amber', onClick: () => onOpenResources() },
  ]

  return (
    <div className="stack">
      <div className="stat-grid">
        {stats.map((stat) => (
          <button className="stat-card-button" key={stat.label} onClick={stat.onClick} type="button">
            <StatCard
              icon={stat.icon}
              label={stat.label}
              tone={stat.tone}
              value={stat.value}
            />
          </button>
        ))}
      </div>

      <div className="grid-2">
        <Card>
          <CardHead
            actions={<Badge tone="violet"><Icon name="shield" size={12} /> Read only</Badge>}
            subtitle="Who can access the school portals."
            title="Accounts by role"
          />
          <div className="mini-list">
            {roleRows.map((row) => (
              <button className="mini-item mini-item-button" key={row.role} onClick={() => onOpenAccounts(row.role)} type="button">
                <Icon name={row.icon} size={17} />
                <div>
                  <strong>{row.label}</strong>
                  <small>Portal access</small>
                </div>
                <Badge tone={row.tone}>{roleCount(row.role)}</Badge>
              </button>
            ))}
          </div>
          <div className="admin-overview-actions">
            <Button onClick={() => onOpenAccounts('all')} size="sm" type="button" variant="secondary">View accounts</Button>
          </div>
        </Card>

        <Card>
          <CardHead
            actions={<Badge tone="violet"><Icon name="shield" size={12} /> Read only</Badge>}
            subtitle="Shared guides available to students."
            title="Resource library"
          />
          {categoryCounts.length === 0 ? (
            <p className="card-sub">No resources have been added yet.</p>
          ) : (
            <div className="mini-list">
              {categoryCounts.slice(0, 4).map(([category, total]) => (
                <button className="mini-item mini-item-button" key={category} onClick={() => onOpenResources(category)} type="button">
                  <Icon name="book" size={17} />
                  <div>
                    <strong>{category}</strong>
                    <small>Resource category</small>
                  </div>
                  <Badge tone="amber">{total}</Badge>
                </button>
              ))}
            </div>
          )}
          <div className="admin-overview-actions">
            <Button onClick={() => onOpenResources()} size="sm" type="button" variant="secondary">View resources</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
