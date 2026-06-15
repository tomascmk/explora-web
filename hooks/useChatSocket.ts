'use client'

import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { connectChatSocket } from '@/lib/chatSocket'
import type { ChatMessage } from '@/graphql/chat'

interface ChatSocketHandlers {
  onMessage?: (message: ChatMessage) => void
  onTyping?: (payload: { conversationId: string; from: string }) => void
  onRead?: (payload: { conversationId: string; by: string }) => void
}

/**
 * Conecta al gateway de chat (`/chat`) con un ws-ticket propio. Handlers en un ref
 * para no reconectar en cada render. El envío de mensajes va por la mutation
 * GraphQL `sendMessage`; este socket es para recibir en vivo + emitir typing/read.
 */
export function useChatSocket(handlers: ChatSocketHandlers) {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    let active = true
    let socket: Socket | null = null

    connectChatSocket()
      .then((s) => {
        if (!s) return
        if (!active) {
          s.disconnect()
          return
        }
        socket = s
        socketRef.current = s
        s.on('connect', () => setConnected(true))
        s.on('disconnect', () => setConnected(false))
        s.on('chat:message', (m: ChatMessage) =>
          handlersRef.current.onMessage?.(m),
        )
        s.on('chat:typing', (p: { conversationId: string; from: string }) =>
          handlersRef.current.onTyping?.(p),
        )
        s.on('chat:read', (p: { conversationId: string; by: string }) =>
          handlersRef.current.onRead?.(p),
        )
      })
      .catch(() => {})

    return () => {
      active = false
      socket?.disconnect()
      socketRef.current = null
    }
  }, [])

  const sendTyping = (conversationId: string) =>
    socketRef.current?.emit('chat:typing', { conversationId })
  const sendRead = (conversationId: string) =>
    socketRef.current?.emit('chat:read', { conversationId })

  return { connected, sendTyping, sendRead }
}
