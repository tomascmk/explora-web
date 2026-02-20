'use client'

import { theme, StatusKey } from '@/lib/theme'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  // Normalize status key: "IN_PROGRESS" → "in_progress", "Pending" → "pending"
  const normalizedKey = status.toLowerCase().replace(/\s+/g, '_') as StatusKey
  const colors = theme.status[normalizedKey] || { bg: '#F1F5F9', text: '#475569' }

  // Display label: "PENDING" → "Pending", "in_progress" → "In Progress"
  const displayLabel = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b(OF|THE|IN|AND|OR|TO|A|AN)\b/gi, (m) => m.toLowerCase())

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {displayLabel}
    </span>
  )
}
