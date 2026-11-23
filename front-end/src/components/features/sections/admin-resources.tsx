import {
  Badge,
  Card,
  CardHead,
  Chip,
  EmptyState,
  Icon,
  ManageHead,
  ManageRow,
  ManageTable,
  SearchField,
} from '@/components/ui'
import type { useAdminPanel } from '@/hooks'

type Admin = ReturnType<typeof useAdminPanel>

type Props = {
  admin: Admin
}

export default function AdminResources({ admin }: Props) {
  const { db, resourceFilter, resourceQuery, setResourceFilter, setResourceQuery } = admin
  const categories = ['All', ...new Set(db.resources.map((resource) => resource.category))]
  const query = resourceQuery.trim().toLowerCase()
  const resources = db.resources.filter((resource) => {
    const matchesCategory = resourceFilter === 'All' || resource.category === resourceFilter
    const haystack = [resource.title, resource.category, resource.summary, ...resource.tags]
    const matchesQuery = !query || haystack.some((value) => value.toLowerCase().includes(query))
    return matchesCategory && matchesQuery
  })

  return (
    <Card>
      <CardHead
        actions={<Badge tone="violet"><Icon name="shield" size={12} /> Read only</Badge>}
        subtitle="Filter the guides currently available to students."
        title="Resource library"
      />
      <div className="admin-filter-row">
        <div className="filter-bar">
          {categories.map((category) => (
            <Chip active={resourceFilter === category} key={category} onClick={() => setResourceFilter(category)} type="button">
              {category}
            </Chip>
          ))}
        </div>
        <SearchField
          onChange={(event) => setResourceQuery(event.target.value)}
          placeholder="Search title, category, or tag"
          value={resourceQuery}
        />
      </div>
      {resources.length === 0 ? (
        <EmptyState icon="book" iconSize={26}><p>No resources match this filter.</p></EmptyState>
      ) : (
        <ManageTable>
          <ManageHead><span>Title</span><span>Category</span><span>Reading time</span><span>Tags</span><span>Access</span></ManageHead>
          {resources.map((resource) => (
            <ManageRow key={resource.id}>
              <div>
                <strong>{resource.title}</strong>
                <small>{resource.summary.slice(0, 70)}{resource.summary.length > 70 ? '…' : ''}</small>
              </div>
              <div>{resource.category}</div>
              <div>{resource.readTime}</div>
              <div>{resource.tags.join(', ') || '—'}</div>
              <div><Badge tone="violet">Read only</Badge></div>
            </ManageRow>
          ))}
        </ManageTable>
      )}
    </Card>
  )
}
