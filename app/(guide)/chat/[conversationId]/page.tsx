'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useChatSocket } from '@/hooks/useChatSocket'
import {
  CONVERSATION,
  CONVERSATION_MESSAGES,
  MARK_CONVERSATION_READ,
  SEND_MESSAGE,
  type ChatMessage,
  type ConversationSummary,
} from '@/graphql/chat'

export default function ChatThreadPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user, featureFlags } = useAuth()
  const router = useRouter()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [otherTyping, setOtherTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: convData } = useQuery<{ conversation: ConversationSummary }>(
    CONVERSATION,
    {
      variables: { conversationId },
      skip: !conversationId || !featureFlags.chatEnabled,
      fetchPolicy: 'cache-and-network',
    },
  )
  const otherUserName = convData?.conversation?.otherUserName

  const { data } = useQuery<{ conversationMessages: ChatMessage[] }>(
    CONVERSATION_MESSAGES,
    {
      variables: { conversationId, limit: 50 },
      skip: !conversationId || !featureFlags.chatEnabled,
    },
  )
  useEffect(() => {
    if (data?.conversationMessages) {
      // La query viene DESC; mostramos ASC (viejo → nuevo).
      setMessages([...data.conversationMessages].reverse())
    }
  }, [data])

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE)
  const [markRead] = useMutation(MARK_CONVERSATION_READ)

  const onIncoming = useCallback(
    (m: ChatMessage) => {
      if (m.conversationId === conversationId) {
        setMessages((prev) =>
          prev.some((x) => x.id === m.id) ? prev : [...prev, m],
        )
      }
    },
    [conversationId],
  )
  const onTyping = useCallback(
    (p: { conversationId: string; from: string }) => {
      if (p.conversationId === conversationId && p.from !== user?.id) {
        setOtherTyping(true)
        setTimeout(() => setOtherTyping(false), 3000)
      }
    },
    [conversationId, user?.id],
  )

  const { sendTyping, sendRead } = useChatSocket({
    onMessage: onIncoming,
    onTyping,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    if (conversationId && featureFlags.chatEnabled) {
      markRead({ variables: { conversationId } }).catch(() => {})
      sendRead(conversationId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messages.length])

  const handleSend = async () => {
    const body = input.trim()
    if (!body || sending) return
    setInput('')
    try {
      const res = await sendMessage({
        variables: { input: { conversationId, body } },
      })
      const msg = (res.data as { sendMessage?: ChatMessage })?.sendMessage
      if (msg) {
        setMessages((prev) =>
          prev.some((x) => x.id === msg.id) ? prev : [...prev, msg],
        )
      }
    } catch {
      setInput(body)
    }
  }

  const onChange = (text: string) => {
    setInput(text)
    if (typingTimer.current) return
    sendTyping(conversationId)
    typingTimer.current = setTimeout(() => {
      typingTimer.current = null
    }, 2000)
  }

  if (!featureFlags.chatEnabled) {
    return (
      <div className='p-8'>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          El chat no está disponible.
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-[calc(100vh-120px)]'>
      <div className='flex items-center gap-3 mb-4'>
        <button
          onClick={() => router.push('/chat')}
          className='flex items-center gap-2 text-sm transition hover:opacity-80'
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={18} /> Mensajes
        </button>
        <h1
          className='truncate text-base font-bold'
          style={{ color: 'var(--color-text-heading)' }}
        >
          {otherUserName ?? 'Usuario'}
        </h1>
      </div>

      <div className='flex-1 overflow-y-auto flex flex-col gap-2 pr-2'>
        {messages.map((m) => {
          const mine = m.senderId === user?.id
          return (
            <div
              key={m.id}
              className='max-w-[75%] rounded-2xl px-4 py-2 text-sm'
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                backgroundColor: mine
                  ? 'var(--color-primary)'
                  : 'var(--color-card-bg)',
                color: mine ? '#fff' : 'var(--color-text-heading)',
                border: mine ? 'none' : '1px solid var(--color-card-border)',
              }}
            >
              {m.body}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {otherTyping && (
        <p
          className='text-xs italic py-1'
          style={{ color: 'var(--color-text-secondary)' }}
        >
          escribiendo…
        </p>
      )}

      <div className='flex items-end gap-2 pt-3'>
        <textarea
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder='Escribí un mensaje…'
          rows={1}
          className='flex-1 rounded-xl px-4 py-3 text-sm outline-none resize-none'
          style={{
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text-heading)',
            border: '1px solid var(--color-card-border)',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className='text-white px-5 py-3 rounded-xl transition disabled:opacity-50 enabled:hover:opacity-90'
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
