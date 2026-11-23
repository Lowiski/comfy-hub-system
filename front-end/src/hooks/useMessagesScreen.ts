import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiRequestError, messagesApi } from '@/lib/api'
import { useCurrentUser } from '@/lib/data'
import { messageDayLabel, refreshUnreadNow, toChatMessage } from '@/lib/messages'
import { refreshNotificationsNow } from '@/lib/notifications'
import { useConversationThread } from '@/hooks/useConversationThread'

export type MessageConfirm = {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
}


export function useMessagesScreen() {
  const user = useCurrentUser()
  const thread = useConversationThread({ includePeople: true })
  const [draft, setDraft] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newCounselor, setNewCounselor] = useState('')
  const [newText, setNewText] = useState('')
  const [sending, setSending] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [editingText, setEditingText] = useState('')
  const [confirm, setConfirm] = useState<MessageConfirm | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  const active = thread.conversations.find((item) => item.id === thread.activeId) ?? thread.conversations[0]
  const selectedCounselorId = newCounselor || thread.people[0]?.id || ''

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [thread.messages.length, thread.activeId])

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!active || !draft.trim() || sending) return
    const id = active.id
    const text = draft.trim()

    setSending(true)
    try {
      const result = await messagesApi.sendMessage(id, text)
      thread.setMessages((current) => [...current, toChatMessage(result.message)])
      setDraft('')
      void thread.load(id)
    } catch (cause) {
      thread.setError(cause instanceof ApiRequestError ? cause.message : 'Could not send your message.')
    } finally {
      setSending(false)
    }
  }

  async function handleSaveEdit(messageId: string) {
    if (!active || !editingText.trim()) return
    try {
      const result = await messagesApi.editMessage(active.id, messageId, editingText.trim())
      thread.setMessages((current) => current.map((item) => item.id === messageId ? toChatMessage(result.message) : item))
      setEditingId('')
      setEditingText('')
      void thread.load(active.id)
    } catch (cause) {
      thread.setError(cause instanceof ApiRequestError ? cause.message : 'Could not edit that message.')
    }
  }

  function askDeleteMessage(messageId: string) {
    setConfirm({
      title: 'Delete message',
      message: 'This message will be removed from the conversation for both people.',
      confirmLabel: 'Delete message',
      onConfirm: () => void deleteMessage(messageId),
    })
  }

  async function deleteMessage(messageId: string) {
    if (!active) return
    try {
      await messagesApi.deleteMessage(active.id, messageId)
      thread.setMessages((current) => current.filter((item) => item.id !== messageId))
      void thread.load(active.id)
    } catch (cause) {
      thread.setError(cause instanceof ApiRequestError ? cause.message : 'Could not delete that message.')
    } finally {
      setConfirm(null)
    }
  }

  function askDeleteConversation() {
    if (!active) return
    const id = active.id
    const name = active.counselor
    setConfirm({
      title: 'Delete conversation',
      message: `Delete the whole conversation with ${name}? Every message in it will be removed for both people.`,
      confirmLabel: 'Delete conversation',
      onConfirm: () => void deleteConversation(id),
    })
  }

  async function deleteConversation(id: string) {
    try {
      await messagesApi.deleteConversation(id)
      thread.setActive('')
      thread.setMessages([])
      setConfirm(null)
      await thread.load()
      refreshUnreadNow()
      refreshNotificationsNow()
    } catch (cause) {
      thread.setError(cause instanceof ApiRequestError ? cause.message : 'Could not delete that conversation.')
      setConfirm(null)
    }
  }

  async function handleNewConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedCounselorId || !newSubject.trim() || !newText.trim()) return

    try {
      const result = await messagesApi.createConversation({
        counselorId: selectedCounselorId,
        subject: newSubject.trim(),
        body: newText.trim(),
      })
      thread.setActive(result.conversationId)
      setNewSubject('')
      setNewText('')
      setComposeOpen(false)
      await thread.load(result.conversationId)
    } catch (cause) {
      thread.setError(cause instanceof ApiRequestError ? cause.message : 'Could not start that conversation.')
    }
  }

  const dayLabel = thread.messages[0] ? messageDayLabel(thread.messages[0].createdAt) : 'Today'

  return {
    user,
    active,
    conversations: thread.conversations,
    messages: thread.messages,
    people: thread.people,
    loading: thread.loading,
    error: thread.error,
    setError: thread.setError,
    selectConversation: thread.selectConversation,
    draft,
    setDraft,
    composeOpen,
    setComposeOpen,
    newSubject,
    setNewSubject,
    newCounselor: selectedCounselorId,
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
  }
}
