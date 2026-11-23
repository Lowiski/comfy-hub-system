import { useState } from 'react'
import type { FormEvent } from 'react'
import { ApiRequestError, messagesApi } from '@/lib/api'
import { refreshUnreadNow, toChatMessage } from '@/lib/messages'
import { refreshNotificationsNow } from '@/lib/notifications'
import type { CounselorConfirm } from '@/hooks/useCounselorAppointments'
import { useConversationThread } from '@/hooks/useConversationThread'


export function useCounselorMessages(
  setConfirm: (value: CounselorConfirm | null) => void,
  notify: (message: string) => void,
) {
  const thread = useConversationThread({ errorMessage: 'Could not load student messages.' })
  const [reply, setReply] = useState('')
  const [editingMessageId, setEditingMessageId] = useState('')
  const [editingMessageText, setEditingMessageText] = useState('')

  const active = thread.conversations.find((item) => item.id === thread.activeId) ?? thread.conversations[0]
  const unreadCount = thread.conversations.reduce((total, item) => total + item.unread, 0)

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!active || !reply.trim()) return
    try {
      const result = await messagesApi.sendMessage(active.id, reply.trim())
      thread.setMessages((current) => [...current, toChatMessage(result.message)])
      setReply('')
      notify('Reply added to the conversation.')
      void thread.load(active.id)
    } catch (cause) {
      thread.setError(cause instanceof ApiRequestError ? cause.message : 'Could not send your reply.')
    }
  }

  function askDeleteConversation(id: string, name: string) {
    setConfirm({
      title: 'Delete conversation',
      message: `Delete the whole conversation with ${name}? Every message in it will be removed for both people.`,
      confirmLabel: 'Delete conversation',
      onConfirm: () => void removeConversation(id),
    })
  }

  async function removeConversation(id: string) {
    try {
      await messagesApi.deleteConversation(id)
      const fallback = thread.activeIdRef.current === id ? '' : thread.activeIdRef.current
      if (thread.activeIdRef.current === id) thread.setActive('')
      setConfirm(null)
      notify('Conversation deleted.')
      await thread.load(fallback || undefined)
      refreshUnreadNow()
      refreshNotificationsNow()
    } catch (cause) {
      thread.setError(cause instanceof ApiRequestError ? cause.message : 'Could not delete that conversation.')
      setConfirm(null)
    }
  }

  async function handleSaveEdit(messageId: string) {
    if (!active || !editingMessageText.trim()) return
    try {
      const result = await messagesApi.editMessage(active.id, messageId, editingMessageText.trim())
      thread.setMessages((current) => current.map((item) => item.id === messageId ? toChatMessage(result.message) : item))
      setEditingMessageId('')
      setEditingMessageText('')
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

  return {
    ...thread,
    active,
    unreadCount,
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
  }
}
