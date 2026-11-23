import { cn } from '@/lib/cn'
import { Avatar } from '@/components/ui/avatar'

type ConversationItemProps = {
  name: string
  avatar?: string
  subject: string
  lastMessage?: string
  time?: string
  unread?: number
  active?: boolean
  onClick: () => void
}

export function ConversationItem({
  name,
  avatar,
  subject,
  lastMessage,
  time,
  unread = 0,
  active = false,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      className={cn('conversation', active ? 'active' : '')}
      onClick={onClick}
      type="button"
    >
      <Avatar className="avatar-teal" name={name} src={avatar} />
      <span className="conversation-body">
        <span className="conversation-row"><strong>{name}</strong><small>{time}</small></span>
        <p>{subject}</p>
        <span className="conversation-row">
          <small style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lastMessage || 'No messages yet'}
          </small>
          {unread > 0 && <span className="unread-dot">{unread}</span>}
        </span>
      </span>
    </button>
  )
}
