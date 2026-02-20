'use client'

import { Menu, Bell } from 'lucide-react'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
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
      </div>

      <button
        className='p-2 -mr-2 rounded-lg transition-colors relative'
        style={{ color: 'var(--color-text-secondary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-section-bg)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <Bell size={20} />
      </button>
    </header>
  )
}
