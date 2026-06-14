'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { AdminDataTable, AdminColumn } from '@/components/admin/AdminDataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  ADMIN_GET_ALL_RESERVATIONS,
  ADMIN_UPDATE_RESERVATION,
  AdminReservation,
  AdminReservationsData,
} from '@/graphql/admin/reservations'
import { Ban, Eye } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function AdminReservationsPage() {
  const { data, loading, refetch } = useQuery<AdminReservationsData>(ADMIN_GET_ALL_RESERVATIONS)
  const [updateReservation] = useMutation(ADMIN_UPDATE_RESERVATION)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const [cancelModal, setCancelModal] = useState<{ open: boolean; reservation: AdminReservation | null }>({
    open: false,
    reservation: null,
  })
  const [detailModal, setDetailModal] = useState<{ open: boolean; reservation: AdminReservation | null }>({
    open: false,
    reservation: null,
  })

  const allReservations: AdminReservation[] = useMemo(
    () => data?.tourReservations || [],
    [data]
  )

  const filteredReservations = useMemo(() => {
    let result = allReservations

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.user?.fullName?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q) ||
          r.tour?.title?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q)
      )
    }

    if (statusFilter) {
      result = result.filter((r) => r.reservation_status === statusFilter)
    }

    if (paymentFilter) {
      result = result.filter((r) => r.payment_status === paymentFilter)
    }

    result = [...result].sort((a, b) => {
      const aVal = a[sortKey as keyof AdminReservation] ?? ''
      const bVal = b[sortKey as keyof AdminReservation] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDirection === 'asc' ? cmp : -cmp
    })

    return result
  }, [allReservations, search, statusFilter, paymentFilter, sortKey, sortDirection])

  const totalCount = filteredReservations.length
  const paginatedReservations = filteredReservations.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const handleCancel = async () => {
    if (!cancelModal.reservation) return
    try {
      await updateReservation({
        variables: {
          id: cancelModal.reservation.id,
          input: {
            reservation_status: 'CANCELLED',
            cancellation_reason: 'Cancelled by admin',
          },
        },
      })
      setCancelModal({ open: false, reservation: null })
      refetch()
    } catch (error) {
      console.error('Failed to cancel reservation:', error)
    }
  }

  const columns: AdminColumn<AdminReservation>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (r) => (
        <span className='text-xs font-mono' style={{ color: 'var(--color-text-muted)' }}>
          {r.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: 'user',
      header: 'Tourist',
      render: (r) => (
        <div>
          <p className='font-medium text-sm' style={{ color: 'var(--color-text-heading)' }}>
            {r.user?.fullName || r.user?.username || 'Unknown'}
          </p>
          <p className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
            {r.user?.email}
          </p>
        </div>
      ),
    },
    {
      key: 'tour',
      header: 'Tour',
      render: (r) => (
        <span className='text-sm'>{r.tour?.title || 'Unknown'}</span>
      ),
    },
    {
      key: 'schedule',
      header: 'Date',
      sortable: true,
      sortKey: 'created_at',
      render: (r) => (
        <span className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
          {r.schedule?.startTime
            ? new Date(r.schedule.startTime).toLocaleDateString()
            : new Date(r.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      render: (r) => (
        <span className='font-semibold text-sm' style={{ color: 'var(--color-text-heading)' }}>
          ${Number(r.total_amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'reservation_status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.reservation_status} />,
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (r) => <StatusBadge status={r.payment_status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className='flex items-center gap-1 justify-end'>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDetailModal({ open: true, reservation: r })
            }}
            className='p-1.5 rounded-md transition-colors'
            title='View details'
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-section-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Eye size={16} />
          </button>
          {r.reservation_status !== 'CANCELLED' && r.reservation_status !== 'COMPLETED' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCancelModal({ open: true, reservation: r })
              }}
              className='p-1.5 rounded-md transition-colors'
              title='Cancel reservation'
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                e.currentTarget.style.color = '#EF4444'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--color-text-muted)'
              }}
            >
              <Ban size={16} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title='Reservations'
        subtitle={`${allReservations.length} total reservations`}
      />

      <AdminDataTable
        columns={columns}
        data={paginatedReservations}
        keyExtractor={(r) => r.id}
        loading={loading}
        emptyMessage='No reservations found'
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder='Search by tourist, tour, or ID...'
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key, dir) => {
          setSortKey(key)
          setSortDirection(dir)
        }}
        filters={
          <>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className='text-sm rounded-lg border px-3 py-2 outline-none'
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-body)',
              }}
            >
              <option value=''>All statuses</option>
              <option value='PENDING'>Pending</option>
              <option value='CONFIRMED'>Confirmed</option>
              <option value='CANCELLED'>Cancelled</option>
              <option value='COMPLETED'>Completed</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value)
                setPage(1)
              }}
              className='text-sm rounded-lg border px-3 py-2 outline-none'
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-body)',
              }}
            >
              <option value=''>All payments</option>
              <option value='PENDING'>Pending</option>
              <option value='PAID'>Paid</option>
              <option value='REFUNDED'>Refunded</option>
              <option value='FAILED'>Failed</option>
            </select>
          </>
        }
      />

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, reservation: null })}
        onConfirm={handleCancel}
        title='Cancel Reservation'
        description={`Are you sure you want to cancel this reservation for ${cancelModal.reservation?.user?.fullName || 'this user'}?`}
        variant='danger'
        confirmText='Cancel Reservation'
      />

      {/* Detail Modal */}
      {detailModal.open && detailModal.reservation && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div
            className='rounded-xl border p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto'
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
            }}
          >
            <h3 className='text-lg font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>
              Reservation Details
            </h3>
            <div className='space-y-3'>
              {[
                { label: 'ID', value: detailModal.reservation.id },
                { label: 'Tourist', value: detailModal.reservation.user?.fullName || 'N/A' },
                { label: 'Email', value: detailModal.reservation.user?.email || 'N/A' },
                { label: 'Tour', value: detailModal.reservation.tour?.title || 'N/A' },
                { label: 'Amount', value: `$${Number(detailModal.reservation.total_amount || 0).toFixed(2)}` },
                { label: 'Status', value: detailModal.reservation.reservation_status },
                { label: 'Payment', value: detailModal.reservation.payment_status },
                { label: 'Created', value: new Date(detailModal.reservation.created_at).toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className='flex justify-between text-sm'>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                  <span className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
                    {value}
                  </span>
                </div>
              ))}
              {detailModal.reservation.cancellation_reason && (
                <div className='text-sm'>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Cancel Reason: </span>
                  <span style={{ color: 'var(--color-danger)' }}>
                    {detailModal.reservation.cancellation_reason}
                  </span>
                </div>
              )}
            </div>
            <div className='flex justify-end mt-6'>
              <button
                onClick={() => setDetailModal({ open: false, reservation: null })}
                className='text-sm px-4 py-2 rounded-lg border transition-colors'
                style={{
                  borderColor: 'var(--color-card-border)',
                  color: 'var(--color-text-body)',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
