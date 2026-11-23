import { useCallback, useState } from 'react'
import { messagesApi } from '@/lib/api'
import { toLiveConversation, type LiveConversation } from '@/lib/messages'
import { usePolling } from '@/hooks/usePolling'


export function useLiveConversations() {
  const [conversations, setConversations] = useState<LiveConversation[]>([])

  const load = useCallback(async () => {
    try {
      const result = await messagesApi.listConversations()
      setConversations(result.conversations.map(toLiveConversation))
    } catch {
      setConversations([])
    }
  }, [])

  usePolling(load)

  return { conversations, load }
}
