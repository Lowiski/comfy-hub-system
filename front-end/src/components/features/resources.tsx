import { cn } from '@/lib/cn'
import { badgeTone } from '@/lib/badge-tone'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  Badge,
  Button,
  ButtonLink,
  Chip,
  EmptyState,
  Icon,
  Modal,
  ModalActions,
  ModalBody,
  ModalHead,
  PageHeader,
  SearchField,
  Toast,
  type IconName,
} from '@/components/ui'
import { useCurrentUser, getDB, resourceCategories, toggleSavedResource, type Resource } from '@/lib/data'
import { useResourceEditor, useTimedFlag } from '@/hooks'
import CounselorResources from './sections/counselor-resources'

export default function Resources() {
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState('All')
  const [db, setDb] = useState(getDB())
  const [selected, setSelected] = useState<Resource | null>(null)
  const user = useCurrentUser()
  const [notice, flashNotice] = useTimedFlag('', 3500)
  const editor = useResourceEditor(flashNotice)
  const canManage = user?.role === 'counselor'

  const categories = [...new Set(['All', ...resourceCategories, ...editor.resources.map((item) => item.category)])]
  const filtered = editor.resources.filter((resource) => {
    const matchesCategory = category === 'All' || resource.category === category
    const haystack = `${resource.title} ${resource.summary} ${resource.tags.join(' ')} ${resource.category}`.toLowerCase()
    return matchesCategory && haystack.includes(query.trim().toLowerCase())
  })

  function toggleSave(id: string) {
    toggleSavedResource(id)
    setDb(getDB())
  }

  return (
    <>
      <PageHeader
        badge={<Badge tone="teal"><Icon name="lock" size={12} /> Private to you</Badge>}
        subtitle="Short, practical reads you can use whenever you need a little clarity."
        title="Resources & self-help guides"
      />

      <div className="resource-toolbar">
        <SearchField
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search topics, tags or titles..."
          value={query}
        />
        <span style={{ color: 'var(--muted)', fontSize: 12.5 }}>
          {filtered.length} guide{filtered.length === 1 ? '' : 's'} · {db.savedResources.length} saved
        </span>
      </div>

      <div className="filter-bar">
        {categories.map((item) => (
          <Chip active={category === item} key={item} onClick={() => setCategory(item)} type="button">
            {item}
          </Chip>
        ))}
      </div>

      {canManage && (
        <section className="resource-management" id="resource-editor">
          {notice && <Toast>{notice}</Toast>}
          <div className="section-head">
            <span className="section-kicker">Counselor tools</span>
            <h2 className="section-title">Manage guides</h2>
            <p className="section-sub">Changes here are visible to every student in the resource library.</p>
          </div>
          <CounselorResources
            editor={editor}
            onEdit={(resource) => {
              editor.editResource(resource)
              document.getElementById('resource-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          />
        </section>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="search" iconSize={28}>
          <p>No guides match that search. Try a different word or choose “All”.</p>
        </EmptyState>
      ) : (
        <div className="resource-grid">
          {filtered.map((resource) => {
            const saved = db.savedResources.includes(resource.id)
            return (
              <article className="resource-card" key={resource.id}>
                <div className="resource-top">
                  <span className={cn('resource-icon', resource.tone)}>
                    <Icon name={resource.icon as IconName} size={21} />
                  </span>
                  <button
                    aria-label={saved ? 'Remove from saved' : 'Save resource'}
                    className={cn('save-button', saved ? 'saved' : '')}
                    onClick={() => toggleSave(resource.id)}
                    title={saved ? 'Remove from saved' : 'Save for later'}
                    type="button"
                  >
                    <Icon name="bookmark" size={17} />
                  </button>
                </div>
                <h3>{resource.title}</h3>
                <p>{resource.summary}</p>
                <div className="resource-meta">
                  <Badge tone={badgeTone(resource.tone)}>{resource.category}</Badge>
                  <span><Icon name="clock" size={13} /> {resource.readTime}</span>
                </div>
                <div className="tag-row">
                  {resource.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
                </div>
                <button className="text-link" onClick={() => setSelected(resource)} type="button">
                  Read guide <Icon name="arrowRight" size={15} />
                </button>
              </article>
            )
          })}
        </div>
      )}

      <div className="info-panel" style={{ marginTop: 24 }}>
        <h4><Icon name="heart" size={17} /> Need more than a guide?</h4>
        <p>Resources help, but talking to a person can make a bigger difference. Book a session whenever you are ready.</p>
        <ButtonLink size="sm" style={{ marginTop: 12 }} to="/appointment" variant="teal">Book a session</ButtonLink>
      </div>

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <ModalHead closeLabel="Close" onClose={() => setSelected(null)}>
            <Badge tone={badgeTone(selected.tone)}>{selected.category}</Badge>
            <h2 style={{ marginTop: 10 }}>{selected.title}</h2>
            <p className="card-sub">{selected.readTime}</p>
          </ModalHead>
          <ModalBody>
            <p>{selected.body}</p>
            <div className="info-panel">
              <h4><Icon name="info" size={16} /> A gentle reminder</h4>
              <p>If this topic feels heavy or personal, you can talk it through with a counselor in a private session.</p>
            </div>
          </ModalBody>
          <ModalActions>
            <Button
              onClick={() => toggleSave(selected.id)}
              type="button"
              variant={db.savedResources.includes(selected.id) ? 'teal' : 'secondary'}
            >
              <Icon name="bookmark" size={16} />
              {' '}{db.savedResources.includes(selected.id) ? 'Saved' : 'Save for later'}
            </Button>
            <Button onClick={() => setSelected(null)} type="button" variant="primary">Done</Button>
          </ModalActions>
        </Modal>
      )}
    </>
  )
}
