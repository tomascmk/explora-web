'use client'

import { ReactNode } from 'react'

interface FilterButtonProps {
  children: ReactNode
  active: boolean
  onClick: () => void
}

export function FilterButton({ children, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
        active
          ? 'text-white shadow-sm'
          : 'border hover:shadow-sm'
      }`}
      style={
        active
          ? { backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }
          : {
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-secondary)',
            }
      }
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--color-primary)'
          e.currentTarget.style.color = 'var(--color-primary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--color-card-border)'
          e.currentTarget.style.color = 'var(--color-text-secondary)'
        }
      }}
    >
      {children}
    </button>
  )
}
