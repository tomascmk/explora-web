'use client'

import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
      <div>
        <h1
          className='text-2xl lg:text-3xl font-bold'
          style={{ color: 'var(--color-text-heading)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className='text-sm mt-1'
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className='flex items-center gap-3 flex-shrink-0'>
          {actions}
        </div>
      )}
    </div>
  )
}
