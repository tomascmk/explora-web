'use client'

import { ReactNode, useMemo } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from 'lucide-react'
import { SearchInput } from './SearchInput'
import { Pagination } from './Pagination'

export interface AdminColumn<T> {
  key: string
  header: string
  align?: 'left' | 'center' | 'right'
  render: (item: T) => ReactNode
  className?: string
  sortable?: boolean
  sortKey?: string
}

interface AdminDataTableProps<T> {
  columns: AdminColumn<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  emptyMessage?: string
  onRowClick?: (item: T) => void
  loading?: boolean

  // Search
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string

  // Pagination
  page?: number
  pageSize?: number
  totalCount?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void

  // Selection
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void

  // Sorting
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void

  // Toolbar extras
  toolbarActions?: ReactNode
  filters?: ReactNode
}

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  onRowClick,
  loading = false,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  page = 1,
  pageSize = 25,
  totalCount,
  onPageChange,
  onPageSizeChange,
  selectable = false,
  selectedIds,
  onSelectionChange,
  sortKey,
  sortDirection = 'asc',
  onSortChange,
  toolbarActions,
  filters,
}: AdminDataTableProps<T>) {
  const allSelected = useMemo(() => {
    if (!selectable || data.length === 0) return false
    return data.every((item) => selectedIds?.has(keyExtractor(item)))
  }, [data, selectedIds, selectable, keyExtractor])

  const someSelected = useMemo(() => {
    if (!selectable || data.length === 0) return false
    return data.some((item) => selectedIds?.has(keyExtractor(item))) && !allSelected
  }, [data, selectedIds, selectable, allSelected, keyExtractor])

  const handleSelectAll = () => {
    if (!onSelectionChange) return
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      const newIds = new Set(data.map(keyExtractor))
      onSelectionChange(newIds)
    }
  }

  const handleSelectItem = (id: string) => {
    if (!onSelectionChange || !selectedIds) return
    const newIds = new Set(selectedIds)
    if (newIds.has(id)) {
      newIds.delete(id)
    } else {
      newIds.add(id)
    }
    onSelectionChange(newIds)
  }

  const handleSort = (key: string) => {
    if (!onSortChange) return
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    onSortChange(key, newDirection)
  }

  const hasToolbar = onSearchChange || toolbarActions || filters

  return (
    <div
      className='rounded-xl border overflow-hidden'
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-card-border)',
      }}
    >
      {/* Toolbar */}
      {hasToolbar && (
        <div
          className='flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b'
          style={{ borderColor: 'var(--color-card-border)' }}
        >
          {onSearchChange && (
            <div className='w-full sm:w-72'>
              <SearchInput
                value={searchValue || ''}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            </div>
          )}
          {filters && <div className='flex items-center gap-2'>{filters}</div>}
          {toolbarActions && (
            <div className='sm:ml-auto flex items-center gap-2'>{toolbarActions}</div>
          )}
        </div>
      )}

      {/* Selection bar */}
      {selectable && selectedIds && selectedIds.size > 0 && (
        <div
          className='flex items-center gap-3 px-4 py-2 text-sm'
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--color-primary)',
          }}
        >
          <span className='font-medium'>{selectedIds.size} selected</span>
          <button
            onClick={() => onSelectionChange?.(new Set())}
            className='underline text-xs'
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className='overflow-x-auto'>
        {loading ? (
          <div className='flex items-center justify-center py-16'>
            <Loader2
              size={24}
              className='animate-spin'
              style={{ color: 'var(--color-primary)' }}
            />
          </div>
        ) : data.length === 0 ? (
          <div className='py-16 text-center'>
            <p style={{ color: 'var(--color-text-muted)' }}>{emptyMessage}</p>
          </div>
        ) : (
          <table className='w-full'>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-section-bg)' }}>
                {selectable && (
                  <th className='py-3 px-4 w-10'>
                    <input
                      type='checkbox'
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected
                      }}
                      onChange={handleSelectAll}
                      className='rounded border-gray-300'
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    } ${col.className || ''} ${
                      col.sortable ? 'cursor-pointer select-none' : ''
                    }`}
                    style={{ color: 'var(--color-text-secondary)' }}
                    onClick={() => col.sortable && handleSort(col.sortKey || col.key)}
                  >
                    <div
                      className={`flex items-center gap-1 ${
                        col.align === 'center'
                          ? 'justify-center'
                          : col.align === 'right'
                          ? 'justify-end'
                          : ''
                      }`}
                    >
                      {col.header}
                      {col.sortable && (
                        <span className='inline-flex'>
                          {sortKey === (col.sortKey || col.key) ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )
                          ) : (
                            <ArrowUpDown size={14} style={{ opacity: 0.4 }} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const id = keyExtractor(item)
                const isSelected = selectedIds?.has(id)
                return (
                  <tr
                    key={id}
                    className={`border-t transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                    style={{
                      borderColor: 'var(--color-card-border)',
                      backgroundColor: isSelected
                        ? 'rgba(59, 130, 246, 0.05)'
                        : 'transparent',
                    }}
                    onClick={() => onRowClick?.(item)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--color-section-bg)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isSelected
                        ? 'rgba(59, 130, 246, 0.05)'
                        : 'transparent'
                    }}
                  >
                    {selectable && (
                      <td className='py-3 px-4 w-10'>
                        <input
                          type='checkbox'
                          checked={isSelected || false}
                          onChange={() => handleSelectItem(id)}
                          onClick={(e) => e.stopPropagation()}
                          className='rounded border-gray-300'
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3 px-4 text-sm ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        } ${col.className || ''}`}
                        style={{ color: 'var(--color-text-body)' }}
                      >
                        {col.render(item)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {onPageChange && totalCount !== undefined && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}
