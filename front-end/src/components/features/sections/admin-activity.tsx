import { Badge, Card, CardHead, EmptyState, Icon, type IconName } from '@/components/ui'
import type { AdminActivity } from '@/hooks'

const icons: Record<string, IconName> = {
  Added: 'plus',
  Updated: 'edit',
  Deleted: 'trash',
  'Already added': 'alert',
  Blocked: 'shield',
}

export default function AdminActivity({ items }: { items: AdminActivity[] }) {
  return (
    <Card>
      <CardHead
        actions={<Badge tone="violet">This session</Badge>}
        subtitle="Account changes made from this admin session."
        title="Recent activity"
      />
      {items.length === 0 ? (
        <EmptyState icon="clock" iconSize={24}><p>No account changes yet.</p></EmptyState>
      ) : (
        <div className="mini-list">
          {items.map((item) => (
            <div className="mini-item" key={item.id}>
              <Icon name={icons[item.action] ?? 'info'} size={17} />
              <div>
                <strong>{item.action}: {item.name}</strong>
                <small>{item.detail}</small>
              </div>
              <div className="activity-meta">
                <Badge tone={item.tone}>{item.action}</Badge>
                <small>{item.time}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
