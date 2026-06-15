'use client'

import { useQuery } from '@apollo/client/react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  MY_CONVERSATIONS,
  type ConversationSummary,
} from '@/graphql/chat'
import { PageHeader } from '@/components/ui/PageHeader'

export default function ChatInboxPage() {
  const { featureFlags } = useAuth()
  const { data, loading } = useQuery<{ myConversations: ConversationSummary[] }>(
    MY_CONVERSATIONS,
    { skip: !featureFlags.chatEnabled, fetchPolicy: 'cache-and-network' },
  )

  if (!featureFlags.chatEnabled) {
    return (
      <div className='p-8'>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          El chat no está disponible.
        </p>
      </div>
    )
  }

  const conversations = data?.myConversations ?? []

  return (
    <div>
      <PageHeader title='Mensajes' />
      <div
        className='rounded-xl border overflow-hidden'
        style={{ borderColor: 'var(--color-card-border)' }}
      >
        {loading && conversations.length === 0 ? (
          <p className='p-6 text-sm' style={{ color: 'var(--color-text-secondary)' }}>
            Cargando…
          </p>
        ) : conversations.length === 0 ? (
          <p className='p-6 text-sm' style={{ color: 'var(--color-text-secondary)' }}>
            Todavía no tenés conversaciones.
          </p>
        ) : (
          conversations.map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className='flex items-center gap-3 px-5 py-4 border-b transition hover:opacity-80'
              style={{ borderColor: 'var(--color-card-border)' }}
            >
              <div className='flex-1 min-w-0'>
                <p
                  className='truncate text-sm font-semibold'
                  style={{ color: 'var(--color-text-heading)' }}
                >
                  {c.otherUserName ?? 'Usuario'}
                </p>
                <p
                  className='truncate text-sm'
                  style={{ color: 'var(--color-text-body)' }}
                >
                  {c.lastMessagePreview ?? '—'}
                </p>
              </div>
              {c.unreadCount > 0 && (
                <span
                  className='min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold text-white flex items-center justify-center'
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {c.unreadCount}
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
