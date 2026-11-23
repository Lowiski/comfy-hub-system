import {
  Avatar,
  Card,
  ConversationItem,
  EmptyState,
  IconButton,
  MessageBubble,
  MessageComposer,
} from '@/components/ui'
import { messageDayLabel } from '@/lib/messages'
import type { User } from '@/lib/data'
import type { useCounselorMessages } from '@/hooks'

type Inbox = ReturnType<typeof useCounselorMessages>

type Props = {
  user: User | null
  inbox: Inbox
}

export default function CounselorMessages({ user, inbox }: Props) {
  const {
    active,
    conversations,
    messages,
    selectConversation,
    reply,
    setReply,
    editingMessageId,
    setEditingMessageId,
    editingMessageText,
    setEditingMessageText,
    sendReply,
    askDeleteConversation,
    handleSaveEdit,
    askDeleteMessage,
  } = inbox

  return (
    <div className="message-layout">
      <Card className="conversation-list">
        <div className="conversation-head"><strong>Who messaged me</strong><span className="badge badge-teal">{conversations.length}</span></div>
        {conversations.length === 0 && <EmptyState><p>No messages yet.</p></EmptyState>}
        {conversations.map((conversation) => (
          <ConversationItem
            active={active?.id === conversation.id}
            avatar={conversation.studentAvatar ?? undefined}
            key={conversation.id}
            lastMessage={conversation.lastMessage}
            name={conversation.studentName}
            onClick={() => void selectConversation(conversation.id)}
            subject={conversation.subject}
            time={conversation.lastMessageAt ? messageDayLabel(conversation.lastMessageAt) : ''}
            unread={conversation.unread}
          />
        ))}
      </Card>

      <Card className="chat-panel counselor-thread">
        {active ? (
          <>
            <div className="chat-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <Avatar
                  className="avatar-teal"
                  name={active.studentName ?? 'Student'}
                  src={active.studentAvatar ?? undefined}
                />
                <div>
                  <h3>{active.studentName ?? 'Student'}</h3>
                  <p>{active.subject} · {active.studentSchoolId ?? 'Student'}</p>
                </div>
              </div>
              <IconButton
                danger
                aria-label="Delete conversation"
                iconSize={16}
                name="trash"
                onClick={() => askDeleteConversation(active.id, active.studentName ?? 'this student')}
                title="Delete conversation"
                type="button"
              />
            </div>
            <div className="chat-body">
              {messages.map((message) => {
                const mine = message.from === 'me'
                const name = mine ? (user?.name ?? 'Counselor') : message.senderName
                return (
                  <MessageBubble
                    avatar={mine ? user?.avatar ?? undefined : message.senderAvatar ?? undefined}
                    editedAt={message.editedAt}
                    editing={editingMessageId === message.id}
                    editingText={editingMessageText}
                    key={message.id}
                    mine={mine}
                    name={name}
                    onCancelEdit={() => setEditingMessageId('')}
                    onDelete={() => askDeleteMessage(message.id)}
                    onEditStart={() => { setEditingMessageId(message.id); setEditingMessageText(message.text) }}
                    onEditingText={setEditingMessageText}
                    onSaveEdit={() => void handleSaveEdit(message.id)}
                    readAt={message.readAt}
                    text={message.text}
                    time={message.time}
                  />
                )
              })}
            </div>
            <MessageComposer
              ariaLabel="Reply to student"
              disabled={!reply.trim()}
              note="Replies appear in the student’s private inbox · Enter to send · Shift + Enter for a new line"
              onChange={setReply}
              onSubmit={sendReply}
              placeholder="Write a reply to this student..."
              sendLabel="Send reply"
              value={reply}
            />
          </>
        ) : (
          <EmptyState icon="message" iconSize={28}><p>Choose a conversation to read and reply.</p></EmptyState>
        )}
      </Card>
    </div>
  )
}
