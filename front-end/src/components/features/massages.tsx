import {
  Avatar,
  Badge,
  Button,
  Card,
  CardActions,
  ConfirmModal,
  ConversationItem,
  DateGroupHeader,
  EmptyState,
  Field,
  Icon,
  IconButton,
  Input,
  MessageBubble,
  MessageComposer,
  Modal,
  ModalActions,
  ModalBody,
  ModalHead,
  PageHeader,
  Select,
  Textarea,
  Toast,
} from '@/components/ui'
import { messageDayLabel } from '@/lib/messages'
import { useMessagesScreen } from '@/hooks'

export default function Messages() {
  const {
    user,
    active,
    conversations,
    messages,
    people,
    loading,
    error,
    selectConversation,
    draft,
    setDraft,
    composeOpen,
    setComposeOpen,
    newSubject,
    setNewSubject,
    newCounselor,
    setNewCounselor,
    newText,
    setNewText,
    sending,
    editingId,
    setEditingId,
    editingText,
    setEditingText,
    confirm,
    setConfirm,
    chatRef,
    dayLabel,
    handleSend,
    handleSaveEdit,
    askDeleteMessage,
    askDeleteConversation,
    handleNewConversation,
  } = useMessagesScreen()

  const unreadTotal = conversations.reduce((total, item) => total + item.unread, 0)

  return (
    <>
      <PageHeader
        actions={<Button onClick={() => setComposeOpen(true)} type="button"><Icon name="plus" size={17} /> New conversation</Button>}
        badge={unreadTotal > 0 ? <Badge tone="rose">{unreadTotal} unread</Badge> : undefined}
        subtitle="Private conversations with your counseling team. Messages save to your account and update live."
        title="Messages"
      />

      {error && <Toast icon="alert" role="alert">{error}</Toast>}

      <div className="message-layout">
        <Card className="conversation-list">
          <div className="conversation-head">
            <strong>Conversations</strong>
            <span className="badge badge-teal">{conversations.length}</span>
          </div>
          {loading && <EmptyState loading><p>Loading conversations…</p></EmptyState>}
          {!loading && conversations.length === 0 && (
            <EmptyState icon="message" iconSize={26}><p>No conversations yet. Start one above.</p></EmptyState>
          )}
          {conversations.map((conversation) => (
            <ConversationItem
              active={active?.id === conversation.id}
              avatar={conversation.counselorAvatar ?? undefined}
              key={conversation.id}
              lastMessage={conversation.lastMessage}
              name={conversation.counselor}
              onClick={() => void selectConversation(conversation.id)}
              subject={conversation.subject}
              time={conversation.lastMessageAt ? messageDayLabel(conversation.lastMessageAt) : ''}
              unread={conversation.unread}
            />
          ))}
        </Card>

        <Card className="chat-panel">
          {active ? (
            <>
              <div className="chat-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Avatar
                    className="avatar-teal"
                    name={active.counselor}
                    src={active.counselorAvatar ?? undefined}
                  />
                  <div>
                    <h3>{active.counselor}</h3>
                    <p>{active.role} · {active.subject}</p>
                  </div>
                </div>
                <CardActions variant="chat">
                  <span className="badge badge-teal"><Icon name="lock" size={12} /> Private</span>
                  <IconButton
                    danger
                    aria-label="Delete conversation"
                    iconSize={16}
                    name="trash"
                    onClick={askDeleteConversation}
                    title="Delete conversation"
                    type="button"
                  />
                </CardActions>
              </div>

              <div className="chat-body" ref={chatRef}>
                <DateGroupHeader>{dayLabel}</DateGroupHeader>
                {messages.map((message) => {
                  const mine = message.from === 'me'
                  return (
                    <MessageBubble
                      avatar={mine ? user?.avatar ?? undefined : message.senderAvatar ?? undefined}
                      editedAt={message.editedAt}
                      editing={editingId === message.id}
                      editingText={editingText}
                      key={message.id}
                      mine={mine}
                      name={mine ? user?.name ?? 'You' : message.senderName}
                      onCancelEdit={() => setEditingId('')}
                      onDelete={() => askDeleteMessage(message.id)}
                      onEditStart={() => { setEditingId(message.id); setEditingText(message.text) }}
                      onEditingText={setEditingText}
                      onSaveEdit={() => void handleSaveEdit(message.id)}
                      readAt={message.readAt}
                      text={message.text}
                      time={message.time}
                    />
                  )
                })}
              </div>

              <MessageComposer
                ariaLabel="Write a message"
                disabled={!draft.trim() || sending}
                enterToSend
                note="Saved to your account · Updates live · Enter to send · Shift + Enter for a new line"
                onChange={setDraft}
                onSubmit={handleSend}
                placeholder="Write a message..."
                sendLabel="Send message"
                value={draft}
              />
            </>
          ) : (
            <EmptyState icon="message" iconSize={28}><p>Start a conversation with a counselor.</p></EmptyState>
          )}
        </Card>
      </div>

      {composeOpen && (
        <Modal onClose={() => setComposeOpen(false)}>
          <ModalHead closeLabel="Close" onClose={() => setComposeOpen(false)}>
            <h2>New conversation</h2>
            <p className="card-sub">Your counselor will see it in their private inbox.</p>
          </ModalHead>
          <form onSubmit={handleNewConversation}>
            <ModalBody style={{ display: 'grid', gap: 16 }}>
              <Field htmlFor="new-counselor" label="Counselor">
                <Select
                  id="new-counselor"
                  onChange={(event) => setNewCounselor(event.target.value)}
                  required
                  value={newCounselor}
                >
                  {people.filter((person) => person.role === 'counselor').map((person) => (
                    <option key={person.id} value={person.id}>{person.name}{person.department ? ` — ${person.department}` : ''}</option>
                  ))}
                </Select>
              </Field>
              <Field htmlFor="new-subject" label="Subject">
                <Input
                  id="new-subject"
                  onChange={(event) => setNewSubject(event.target.value)}
                  placeholder="e.g. Questions about exams"
                  required
                  value={newSubject}
                />
              </Field>
              <Field htmlFor="new-text" label="Your message">
                <Textarea
                  id="new-text"
                  onChange={(event) => setNewText(event.target.value)}
                  placeholder="Write as much or as little as you like..."
                  required
                  value={newText}
                />
              </Field>
            </ModalBody>
            <ModalActions>
              <Button onClick={() => setComposeOpen(false)} type="button" variant="secondary">Cancel</Button>
              <Button type="submit"><Icon name="send" size={16} /> Send message</Button>
            </ModalActions>
          </form>
        </Modal>
      )}

      {confirm && (
        <ConfirmModal
          confirmLabel={confirm.confirmLabel}
          danger
          message={confirm.message}
          onCancel={() => setConfirm(null)}
          onConfirm={confirm.onConfirm}
          title={confirm.title}
        />
      )}
    </>
  )
}
