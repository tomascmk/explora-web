'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize)
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  if (totalCount === 0) return null

  return (
    <div
      className='flex items-center justify-between px-4 py-3 border-t'
      style={{ borderColor: 'var(--color-card-border)' }}
    >
      {/* Info */}
      <div className='flex items-center gap-4'>
        <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>
          Showing <span style={{ color: 'var(--color-text-body)' }} className='font-medium'>{start}</span>
          {' '}to{' '}
          <span style={{ color: 'var(--color-text-body)' }} className='font-medium'>{end}</span>
          {' '}of{' '}
          <span style={{ color: 'var(--color-text-body)' }} className='font-medium'>{totalCount}</span>
        </p>

        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className='text-sm rounded-md border px-2 py-1 outline-none'
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-body)',
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Controls */}
      <div className='flex items-center gap-1'>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className='p-1.5 rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
          style={{
            borderColor: 'var(--color-card-border)',
            color: 'var(--color-text-body)',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = 'var(--color-section-bg)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <span
          className='text-sm px-3 py-1'
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className='p-1.5 rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
          style={{
            borderColor: 'var(--color-card-border)',
            color: 'var(--color-text-body)',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = 'var(--color-section-bg)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
