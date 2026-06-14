'use client'

import { useQuery } from '@apollo/client/react'
import { AlertTriangle, Info, Megaphone, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  ACTIVE_ANNOUNCEMENTS,
  type ActiveAnnouncementsData,
  type Announcement,
  type AnnouncementType,
} from '@/graphql/announcements'

interface TypeStyle {
  bg: string
  border: string
  accent: string
  icon: typeof Info
}

const TYPE_STYLES: Record<AnnouncementType, TypeStyle> = {
  INFO: {
    bg: 'var(--color-info-light)',
    border: 'var(--color-info)',
    accent: 'var(--color-info)',
    icon: Info,
  },
  WARNING: {
    bg: 'var(--color-warning-light)',
    border: 'var(--color-warning)',
    accent: 'var(--color-warning)',
    icon: AlertTriangle,
  },
  PROMOTION: {
    bg: 'var(--color-success-light)',
    border: 'var(--color-success)',
    accent: 'var(--color-success)',
    icon: Megaphone,
  },
}

function BannerRow({
  announcement,
  onDismiss,
}: {
  announcement: Announcement
  onDismiss: (id: string) => void
}) {
  const style = TYPE_STYLES[announcement.type]
  const Icon = style.icon

  return (
    <div
      className='flex items-start gap-3 rounded-lg border px-4 py-3'
      style={{ backgroundColor: style.bg, borderColor: style.border }}
      role='status'
    >
      <Icon size={18} color={style.accent} className='mt-0.5 flex-shrink-0' />
      <div className='flex-1 min-w-0'>
        <p
          className='text-sm font-semibold'
          style={{ color: style.accent }}
        >
          {announcement.title}
        </p>
        <p className='text-sm' style={{ color: 'var(--color-text-body)' }}>
          {announcement.message}
        </p>
      </div>
      <button
        type='button'
        onClick={() => onDismiss(announcement.id)}
        aria-label='Dismiss'
        className='flex-shrink-0 p-0.5 hover:opacity-70'
        style={{ color: style.accent }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

/**
 * Banner de anuncios activos para el guía autenticado (PLAN-035). El backend
 * filtra por audiencia (ALL / GUIDES) según el rol del JWT. Cada anuncio es
 * descartable en memoria (no persiste entre sesiones).
 */
export function GuideBanner() {
  const { isAuthenticated } = useAuth()
  const { data } = useQuery<ActiveAnnouncementsData>(ACTIVE_ANNOUNCEMENTS, {
    skip: !isAuthenticated,
  })
  const [dismissed, setDismissed] = useState<string[]>([])

  const announcements = data?.activeAnnouncements ?? []
  const visible = announcements.filter((a) => !dismissed.includes(a.id))

  if (visible.length === 0) return null

  return (
    <div className='flex flex-col gap-2 mb-4'>
      {visible.map((a) => (
        <BannerRow
          key={a.id}
          announcement={a}
          onDismiss={(id) => setDismissed((prev) => [...prev, id])}
        />
      ))}
    </div>
  )
}
