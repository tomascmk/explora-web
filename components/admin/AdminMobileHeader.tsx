'use client'

import { Menu, Shield } from 'lucide-react'

interface AdminMobileHeaderProps {
  onMenuClick: () => void
}

export function AdminMobileHeader({ onMenuClick }: AdminMobileHeaderProps) {
  return (
    <header
      className='lg:hidden flex items-center justify-between h-14 px-4 border-b flex-shrink-0'
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-card-border)',
      }}
    >
      <button
        onClick={onMenuClick}
        className='p-2 -ml-2 rounded-lg transition-colors'
        style={{ color: 'var(--color-text-heading)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-section-bg)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <Menu size={22} />
      </button>

      <div className='flex items-center gap-2'>
        <div
          className='w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs'
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          E
        </div>
        <span
          className='text-base font-bold'
          style={{ color: 'var(--color-text-heading)' }}
        >
          Explora
        </span>
        <span
          className='text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded'
          style={{
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            color: '#C084FC',
          }}
        >
          Admin
        </span>
      </div>

      <div className='p-2 -mr-2'>
        <Shield size={20} style={{ color: 'var(--color-text-secondary)' }} />
      </div>
    </header>
  )
}
