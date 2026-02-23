'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface BulkActionBarProps {
  selectedCount: number
  onClear: () => void
  children: ReactNode
}

export function BulkActionBar({ selectedCount, onClear, children }: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-3 rounded-xl shadow-xl border'
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-primary)',
      }}
    >
      <div className='flex items-center gap-2'>
        <span
          className='text-sm font-semibold px-2 py-0.5 rounded-full'
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--color-primary)',
          }}
        >
          {selectedCount}
        </span>
        <span className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>
          selected
        </span>
      </div>

      <div
        className='w-px h-6'
        style={{ backgroundColor: 'var(--color-card-border)' }}
      />

      <div className='flex items-center gap-2'>{children}</div>

      <button
        onClick={onClear}
        className='p-1.5 rounded-md transition-colors ml-1'
        style={{ color: 'var(--color-text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-section-bg)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <X size={16} />
      </button>
    </div>
  )
}
