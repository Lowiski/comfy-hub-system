import { useCallback, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ApiRequestError, messagesApi } from '@/lib/api'
import { refreshNotificationsNow } from '@/lib/notifications'
import { usePolling } from '@/hooks/usePolling'
import {
  refreshUnreadNow,
  toChatMessage,
  toLiveConversation,
  type ChatMessage,
  type LiveConversation,
  type MessagePerson,
} from '@/lib/messages'

type Options = {
  includePeople?: boolean
  errorMessage?: string
}


export function useConversationThread({
  includePeople = false,
  errorMessage = 'Could not load your conversations.',
}: Options = {}) {
  const [conversations, setConversations] = useState<LiveConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [people, setPeople] = useState<MessagePerson[]>([])
  const [activeId, setActiveId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedConversation = searchParams.get('conversation')
  const activeIdRef = useRef('')

  const load = useCallback(async (preferredId?: string) => {
    try {
      const [conversationResult, peopleResult] = await Promise.all([
        messagesApi.listConversations(),
        includePeople ? messagesApi.listPeople() : Promise.resolve(null),
      ])
      const mapped = conversationResult.conversations.map(toLiveConversation)
      const requested = requestedConversation && mapped.some((item) => item.id === requestedConversation)
        ? requestedConversation
        : ''
      const targetId = requested || preferredId || activeIdRef.current
      const target = mapped.find((item) => item.id === targetId)?.id ?? mapped[0]?.id ?? ''

      setConversations(mapped)
      if (peopleResult) setPeople(peopleResult.people)
      activeIdRef.current = target
      setActiveId(target)

      if (target) {
        const thread = await messagesApi.listMessages(target)
        setMessages(thread.messages.map(toChatMessage))
      } else {
        setMessages([])
      }

      setError('')
      if (requested) {
        try {
          await messagesApi.markRead(requested)
          setConversations((current) => current.map((item) => item.id === requested ? { ...item, unread: 0 } : item))
          refreshUnreadNow()
          refreshNotificationsNow()
        } catch (cause) {
          setError(cause instanceof ApiRequestError ? cause.message : 'Could not open that conversation.')
        }
        setSearchParams({}, { replace: true })
      }
    } catch (cause) {
      setError(cause instanceof ApiRequestError ? cause.message : errorMessage)
    } finally {
      setLoading(false)
    }
  }, [errorMessage, includePeople, requestedConversation, setSearchParams])

  usePolling(load)

  const selectConversation = useCallback(async (id: string) => {
    activeIdRef.current = id
    setActiveId(id)
    try {
      const thread = await messagesApi.listMessages(id)
      setMessages(thread.messages.map(toChatMessage))
      await messagesApi.markRead(id)
      setConversations((current) => current.map((item) => item.id === id ? { ...item, unread: 0 } : item))
      refreshUnreadNow()
      refreshNotificationsNow()
    } catch (cause) {
      setError(cause instanceof ApiRequestError ? cause.message : 'Could not open that conversation.')
    }
  }, [])

  const setActive = useCallback((id: string) => {
    activeIdRef.current = id
    setActiveId(id)
  }, [])

  return {
    conversations,
    messages,
    people,
    activeId,
    setActive,
    activeIdRef,
    loading,
    error,
    setError,
    setMessages,
    setConversations,
    load,
    selectConversation,
  }
}
