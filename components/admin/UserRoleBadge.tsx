'use client'

interface UserRoleBadgeProps {
  role: string
  size?: 'sm' | 'md'
}

const roleConfig: Record<string, { label: string; bg: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' },
  ADMIN: { label: 'Admin', bg: 'rgba(168, 85, 247, 0.12)', color: '#A855F7' },
  SUPPORT: { label: 'Support', bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' },
  GUIDE: { label: 'Guide', bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981' },
  TOURIST: { label: 'Tourist', bg: 'rgba(107, 114, 128, 0.12)', color: '#6B7280' },
}

export function UserRoleBadge({ role, size = 'sm' }: UserRoleBadgeProps) {
  const config = roleConfig[role] || {
    label: role,
    bg: 'rgba(107, 114, 128, 0.12)',
    color: '#6B7280',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  )
}
