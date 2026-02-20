'use client'

import { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  align?: 'left' | 'center' | 'right'
  render: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  emptyMessage?: string
  onRowClick?: (item: T) => void
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className='rounded-xl border p-12 text-center'
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
        }}
      >
        <p style={{ color: 'var(--color-text-muted)' }}>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      className='rounded-xl border overflow-hidden'
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-card-border)',
      }}
    >
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-section-bg)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  } ${col.className || ''}`}
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={`border-t transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                style={{ borderColor: 'var(--color-card-border)' }}
                onClick={() => onRowClick?.(item)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-section-bg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 px-4 text-sm ${
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.className || ''}`}
                    style={{ color: 'var(--color-text-body)' }}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
