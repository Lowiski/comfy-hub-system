import { useState } from 'react'
import type { FormEvent } from 'react'
import { addResource, deleteResource, getResources, updateResource, type Resource } from '@/lib/data'
import type { IconName } from '@/components/ui/icon'

export const iconChoices: IconName[] = ['book', 'sparkles', 'heart', 'leaf', 'shield', 'moon', 'sun', 'brain', 'target']
export const toneChoices = ['teal', 'blue', 'violet', 'amber', 'rose']
export const emptyResource = {
  title: '',
  category: '',
  summary: '',
  body: '',
  readTime: '4 min read',
  icon: 'book' as IconName,
  tone: 'teal',
  tags: '',
}


export function useResourceEditor(notify: (message: string) => void) {
  const [resources, setResources] = useState(getResources())
  const [editingResource, setEditingResource] = useState<string | null>(null)
  const [resourceForm, setResourceForm] = useState({ ...emptyResource })

  function refresh() {
    setResources(getResources())
  }

  function editResource(resource: Resource) {
    setEditingResource(resource.id)
    setResourceForm({
      title: resource.title,
      category: resource.category,
      summary: resource.summary,
      body: resource.body,
      readTime: resource.readTime,
      icon: (iconChoices.includes(resource.icon as IconName) ? resource.icon : 'book') as IconName,
      tone: toneChoices.includes(resource.tone) ? resource.tone : 'teal',
      tags: resource.tags.join(', '),
    })
  }

  function resetResourceForm() {
    setEditingResource(null)
    setResourceForm({ ...emptyResource })
  }

  function saveResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = {
      title: resourceForm.title.trim(),
      category: resourceForm.category.trim() || 'Wellbeing',
      summary: resourceForm.summary.trim(),
      body: resourceForm.body.trim(),
      readTime: resourceForm.readTime.trim() || '4 min read',
      icon: resourceForm.icon,
      tone: resourceForm.tone,
      tags: resourceForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    }
    if (!payload.title || !payload.body) {
      notify('Add at least a title and guide content before saving.')
      return
    }
    if (editingResource) {
      updateResource(editingResource, payload)
      notify('Resource updated.')
    } else {
      addResource(payload)
      notify('Resource added for students.')
    }
    resetResourceForm()
    refresh()
  }

  function removeResource(resource: Resource) {
    if (!window.confirm(`Remove “${resource.title}” from the resource library?`)) return
    deleteResource(resource.id)
    if (editingResource === resource.id) resetResourceForm()
    notify('Resource removed.')
    refresh()
  }

  return {
    resources,
    editingResource,
    resourceForm,
    setResourceForm,
    editResource,
    resetResourceForm,
    saveResource,
    removeResource,
    refresh,
  }
}
