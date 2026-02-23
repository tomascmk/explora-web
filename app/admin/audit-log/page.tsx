'use client'

import { useQuery } from '@apollo/client/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { AdminDataTable, AdminColumn } from '@/components/admin/AdminDataTable'
import { ADMIN_GET_AUDIT_LOG } from '@/graphql/admin/audit-log'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

interface AuditLogItem {
  id: string
  action: string
  entity: string
  entityId: string
  changes?: any
  metadata?: any
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export default function AdminAuditLogPage() {
  const { data, loading } = useQuery(ADMIN_GET_AUDIT_LOG, {
    variables: { limit: 500, offset: 0 },
  })

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const allLogs: AuditLogItem[] = useMemo(() => (data as any)?.myAuditLog || [], [data])

  // Get unique actions and entities for filters
  const actions = useMemo(() => {
    const set = new Set(allLogs.map((l) => l.action))
    return Array.from(set).sort()
  }, [allLogs])

  const entities = useMemo(() => {
    const set = new Set(allLogs.map((l) => l.entity))
    return Array.from(set).sort()
  }, [allLogs])

  const filteredLogs = useMemo(() => {
    let result = allLogs

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.action?.toLowerCase().includes(q) ||
          l.entity?.toLowerCase().includes(q) ||
          l.entityId?.toLowerCase().includes(q) ||
          l.ipAddress?.toLowerCase().includes(q)
      )
    }

    if (actionFilter) {
      result = result.filter((l) => l.action === actionFilter)
    }

    if (entityFilter) {
      result = result.filter((l) => l.entity === entityFilter)
    }

    return result
  }, [allLogs, search, actionFilter, entityFilter])

  const totalCount = filteredLogs.length
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize)

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }
      case 'UPDATE':
        return { bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }
      case 'DELETE':
      case 'REMOVE':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }
      case 'LOGIN':
        return { bg: 'rgba(168, 85, 247, 0.12)', color: '#A855F7' }
      default:
        return { bg: 'rgba(107, 114, 128, 0.12)', color: '#6B7280' }
    }
  }

  const columns: AdminColumn<AuditLogItem>[] = [
    {
      key: 'expand',
      header: '',
      className: 'w-8',
      render: (l) => {
        const hasDetails = l.changes || l.metadata
        if (!hasDetails) return null
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleExpand(l.id)
            }}
            className='p-0.5'
            style={{ color: 'var(--color-text-muted)' }}
          >
            {expandedIds.has(l.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )
      },
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (l) => (
        <span className='text-xs font-mono' style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(l.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (l) => {
        const colors = getActionColor(l.action)
        return (
          <span
            className='text-xs font-semibold px-2 py-0.5 rounded'
            style={{ backgroundColor: colors.bg, color: colors.color }}
          >
            {l.action}
          </span>
        )
      },
    },
    {
      key: 'entity',
      header: 'Entity',
      render: (l) => (
        <span className='text-sm' style={{ color: 'var(--color-text-body)' }}>
          {l.entity}
        </span>
      ),
    },
    {
      key: 'entityId',
      header: 'Entity ID',
      render: (l) => (
        <span className='text-xs font-mono' style={{ color: 'var(--color-text-muted)' }}>
          {l.entityId?.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (l) => (
        <span className='text-xs font-mono' style={{ color: 'var(--color-text-muted)' }}>
          {l.ipAddress || 'N/A'}
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title='Audit Log'
        subtitle={`${allLogs.length} total entries`}
      />

      <AdminDataTable
        columns={columns}
        data={paginatedLogs}
        keyExtractor={(l) => l.id}
        loading={loading}
        emptyMessage='No audit log entries found'
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder='Search by action, entity, or IP...'
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        filters={
          <>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setPage(1)
              }}
              className='text-sm rounded-lg border px-3 py-2 outline-none'
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-body)',
              }}
            >
              <option value=''>All actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value)
                setPage(1)
              }}
              className='text-sm rounded-lg border px-3 py-2 outline-none'
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-body)',
              }}
            >
              <option value=''>All entities</option>
              {entities.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </>
        }
      />

      {/* Expanded details below table */}
      {paginatedLogs
        .filter((l) => expandedIds.has(l.id))
        .map((l) => (
          <div
            key={`detail-${l.id}`}
            className='rounded-lg border p-4 mt-2'
            style={{
              backgroundColor: 'var(--color-section-bg)',
              borderColor: 'var(--color-card-border)',
            }}
          >
            <p className='text-xs font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>
              Details for {l.entity} #{l.entityId?.slice(0, 8)}
            </p>
            {l.changes && (
              <div className='mb-2'>
                <p className='text-xs font-medium mb-1' style={{ color: 'var(--color-text-secondary)' }}>
                  Changes:
                </p>
                <pre
                  className='text-xs font-mono p-2 rounded overflow-auto max-h-40'
                  style={{
                    backgroundColor: 'var(--color-card-bg)',
                    color: 'var(--color-text-body)',
                  }}
                >
                  {typeof l.changes === 'string' ? l.changes : JSON.stringify(l.changes, null, 2)}
                </pre>
              </div>
            )}
            {l.metadata && (
              <div>
                <p className='text-xs font-medium mb-1' style={{ color: 'var(--color-text-secondary)' }}>
                  Metadata:
                </p>
                <pre
                  className='text-xs font-mono p-2 rounded overflow-auto max-h-40'
                  style={{
                    backgroundColor: 'var(--color-card-bg)',
                    color: 'var(--color-text-body)',
                  }}
                >
                  {typeof l.metadata === 'string' ? l.metadata : JSON.stringify(l.metadata, null, 2)}
                </pre>
              </div>
            )}
            {l.userAgent && (
              <p className='text-xs mt-2' style={{ color: 'var(--color-text-muted)' }}>
                User Agent: {l.userAgent}
              </p>
            )}
          </div>
        ))}
    </>
  )
}
