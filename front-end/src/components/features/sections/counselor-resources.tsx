import {
  Button,
  Card,
  CardHead,
  Field,
  FieldRow,
  Icon,
  IconButton,
  Input,
  Select,
  Textarea,
  type IconName,
} from '@/components/ui'
import { iconChoices, toneChoices, type useResourceEditor } from '@/hooks'
import type { Resource } from '@/lib/data'

type Editor = ReturnType<typeof useResourceEditor>

type Props = {
  editor: Editor
  onEdit: (resource: Resource) => void
}

export default function CounselorResources({ editor, onEdit }: Props) {
  const {
    resources,
    editingResource,
    resourceForm,
    setResourceForm,
    resetResourceForm,
    saveResource,
    removeResource,
  } = editor

  return (
    <div className="two-col">
      <Card>
        <CardHead
          actions={editingResource && <Button onClick={resetResourceForm} size="sm" type="button" variant="ghost">Cancel edit</Button>}
          subtitle="Share a guide with all students in the portal."
          title={editingResource ? 'Edit resource' : 'Add a resource'}
        />
        <form className="form-grid" onSubmit={saveResource}>
          <Field htmlFor="resource-title" label="Title">
            <Input
              id="resource-title"
              onChange={(event) => setResourceForm({ ...resourceForm, title: event.target.value })}
              placeholder="e.g. A simple study plan"
              required
              value={resourceForm.title}
            />
          </Field>
          <FieldRow>
            <Field htmlFor="resource-category" label="Category">
              <Input
                id="resource-category"
                onChange={(event) => setResourceForm({ ...resourceForm, category: event.target.value })}
                placeholder="Academic stress"
                value={resourceForm.category}
              />
            </Field>
            <Field htmlFor="resource-read" label="Reading time">
              <Input
                id="resource-read"
                onChange={(event) => setResourceForm({ ...resourceForm, readTime: event.target.value })}
                placeholder="4 min read"
                value={resourceForm.readTime}
              />
            </Field>
          </FieldRow>
          <Field htmlFor="resource-summary" label="Short summary">
            <Textarea
              id="resource-summary"
              onChange={(event) => setResourceForm({ ...resourceForm, summary: event.target.value })}
              placeholder="One or two sentences students see in the library."
              value={resourceForm.summary}
            />
          </Field>
          <Field htmlFor="resource-body" label="Full guide">
            <Textarea
              id="resource-body"
              onChange={(event) => setResourceForm({ ...resourceForm, body: event.target.value })}
              placeholder="Write the guide here..."
              required
              value={resourceForm.body}
            />
          </Field>
          <FieldRow>
            <Field htmlFor="resource-icon" label="Icon">
              <Select
                id="resource-icon"
                onChange={(event) => setResourceForm({ ...resourceForm, icon: event.target.value as IconName })}
                value={resourceForm.icon}
              >
                {iconChoices.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </Select>
            </Field>
            <Field htmlFor="resource-tone" label="Colour">
              <Select
                id="resource-tone"
                onChange={(event) => setResourceForm({ ...resourceForm, tone: event.target.value })}
                value={resourceForm.tone}
              >
                {toneChoices.map((tone) => <option key={tone} value={tone}>{tone}</option>)}
              </Select>
            </Field>
          </FieldRow>
          <Field htmlFor="resource-tags" label={<>Tags <span className="field-optional">comma separated</span></>}>
            <Input
              id="resource-tags"
              onChange={(event) => setResourceForm({ ...resourceForm, tags: event.target.value })}
              placeholder="Focus, Study, Exams"
              value={resourceForm.tags}
            />
          </Field>
          <Button type="submit" variant="teal"><Icon name="check" size={16} /> {editingResource ? 'Save changes' : 'Add resource'}</Button>
        </form>
      </Card>

      <Card>
        <CardHead subtitle="Guides currently visible to students." title="Resource library" />
        <div className="mini-list">
          {resources.map((resource) => (
            <div className="mini-item" key={resource.id}>
              <span className={`resource-icon ${resource.tone}`}>
                <Icon name={(iconChoices.includes(resource.icon as IconName) ? resource.icon : 'book') as IconName} size={17} />
              </span>
              <div style={{ minWidth: 0 }}>
                <strong style={{ fontSize: 12.5 }}>{resource.title}</strong>
                <small>{resource.category} · {resource.readTime}</small>
              </div>
              <div className="row-actions">
                <IconButton
                  iconSize={15}
                  name="key"
                  onClick={() => onEdit(resource)}
                  title="Edit resource"
                  type="button"
                />
                <IconButton
                  iconSize={15}
                  name="close"
                  onClick={() => removeResource(resource)}
                  title="Remove resource"
                  type="button"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
