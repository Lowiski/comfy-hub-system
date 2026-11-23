import type { FormEvent } from 'react'
import { cn } from '@/lib/cn'
import { Avatar } from '@/components/ui/avatar'
import { Icon } from '@/components/ui/icon'

type MessageBubbleProps = {
  name: string
  avatar?: string
  text: string
  time: string
  mine: boolean
  editedAt?: string | null
  readAt?: string | null
  editing?: boolean
  editingText?: string
  onEditStart?: () => void
  onEditingText?: (value: string) => void
  onSaveEdit?: () => void
  onCancelEdit?: () => void
  onDelete?: () => void
}

export function MessageBubble({
  name,
  avatar,
  text,
  time,
  mine,
  editedAt,
  readAt,
  editing = false,
  editingText = '',
  onEditStart,
  onEditingText,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: MessageBubbleProps) {
  function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSaveEdit?.()
  }

  return (
    <div className={cn('message-row', mine ? 'me' : '')}>
      <Avatar className={mine ? 'avatar-blue' : 'avatar-teal'} name={name} src={avatar} />
      {editing ? (
        <form className="bubble bubble-edit" onSubmit={submitEdit}>
          <textarea
            aria-label="Edit message"
            autoFocus
            onChange={(event) => onEditingText?.(event.target.value)}
            value={editingText}
          />
          <div className="bubble-edit-actions">
            <button className="btn btn-sm btn-primary" disabled={!editingText.trim()} type="submit">Save</button>
            <button className="btn btn-sm btn-secondary" onClick={onCancelEdit} type="button">Cancel</button>
          </div>
        </form>
      ) : (
        <div className={cn('bubble', mine ? 'me' : '')}>
          {text}
          <small>
            {name} · {time}
            {editedAt ? ' · Edited' : ''}
            {mine && readAt ? ' · Seen' : ''}
          </small>
          {mine && (
            <span className="message-actions">
              <button
                aria-label="Edit message"
                className="message-action"
                onClick={onEditStart}
                title="Edit message"
                type="button"
              >
                <Icon name="edit" size={13} />
              </button>
              <button
                aria-label="Delete message"
                className="message-action message-action-danger"
                onClick={onDelete}
                title="Delete message"
                type="button"
              >
                <Icon name="trash" size={13} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
