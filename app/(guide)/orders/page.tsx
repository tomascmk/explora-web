'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_GUIDE_RESERVATIONS, UPDATE_RESERVATION_STATUS } from '@/graphql/reservations'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { FilterButton } from '@/components/ui/FilterButton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { toast } from 'sonner'
import Link from 'next/link'
import { ShoppingCart, Clock, CheckCircle, DollarSign } from 'lucide-react'

interface Order {
  id: string
  user: {
    id: string
    username: string
    fullName?: string
    email: string
  }
  tour: {
    id: string
    title: string
  }
  schedule: {
    id: string
    startTime: string
    endTime?: string
    maxCapacity?: number
  }
  total_amount: number
  payment_status: string
  reservation_status: string
  created_at: string
  cancellation_reason?: string
}

type FilterType = 'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export default function OrdersPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<FilterType>('all')
  const [actionTarget, setActionTarget] = useState<{ order: Order; action: string } | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const { data, loading } = useQuery<{ tourReservationsByGuide: Order[] }>(
    GET_GUIDE_RESERVATIONS,
    {
      variables: { guideId: user?.id },
      skip: !user
    }
  )

  // Apollo automatically merges by `id` so the updated reservation is patched in cache.
  // No refetch() needed as long as the mutation response includes the changed fields.
  const [updateStatusMutation, { loading: updating }] = useMutation(UPDATE_RESERVATION_STATUS, {
    onCompleted: () => {
      setActionTarget(null)
      setCancelReason('')
    },
    onError: (error) => {
      console.error('Error updating reservation:', error)
      toast.error('Failed to update reservation')
    }
  })

  const orders = data?.tourReservationsByGuide || []

  const filteredOrders =
    filter === 'all'
      ? orders
      : orders.filter((o) => o.reservation_status === filter)

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'COMPLETED')
    .reduce((sum, o) => sum + o.total_amount, 0)

  const pendingCount = orders.filter((o) => o.reservation_status === 'PENDING').length
  const confirmedCount = orders.filter((o) => o.reservation_status === 'CONFIRMED').length

  const handleAction = async () => {
    if (!actionTarget) return

    const { order, action } = actionTarget
    const input: any = {}

    switch (action) {
      case 'CONFIRM':
        input.reservation_status = 'CONFIRMED'
        break
      case 'COMPLETE':
        input.reservation_status = 'COMPLETED'
        input.payment_status = 'COMPLETED'
        break
      case 'CANCEL':
        input.reservation_status = 'CANCELLED'
        if (cancelReason) input.cancellation_reason = cancelReason
        break
      default:
        return
    }

    try {
      await updateStatusMutation({
        variables: { id: order.id, input }
      })
      const actionLabels: Record<string, string> = {
        CONFIRM: 'confirmed',
        COMPLETE: 'completed',
        CANCEL: 'cancelled'
      }
      toast.success(`Reservation ${actionLabels[action]}`)
    } catch (error) {
      // Handled by onError
    }
  }

  const getActionModalConfig = () => {
    if (!actionTarget) return { title: '', description: '', variant: 'primary' as const, confirmText: '' }

    const { order, action } = actionTarget
    const customerName = order.user.fullName || order.user.username

    switch (action) {
      case 'CONFIRM':
        return {
          title: 'Confirm Reservation',
          description: `Confirm reservation for "${order.tour.title}" by ${customerName}? The customer will be notified.`,
          variant: 'primary' as const,
          confirmText: 'Confirm'
        }
      case 'COMPLETE':
        return {
          title: 'Complete Reservation',
          description: `Mark reservation for "${order.tour.title}" by ${customerName} as completed?`,
          variant: 'primary' as const,
          confirmText: 'Complete'
        }
      case 'CANCEL':
        return {
          title: 'Cancel Reservation',
          description: `Cancel reservation for "${order.tour.title}" by ${customerName}? This action cannot be undone.`,
          variant: 'danger' as const,
          confirmText: 'Cancel Reservation'
        }
      default:
        return { title: '', description: '', variant: 'primary' as const, confirmText: '' }
    }
  }

  if (loading) {
    return (
      <div>
        <div className='animate-pulse space-y-4'>
          <div
            className='h-8 rounded w-1/4'
            style={{ backgroundColor: 'var(--color-section-bg)' }}
          />
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className='h-24 rounded-xl'
                style={{ backgroundColor: 'var(--color-section-bg)' }}
              />
            ))}
          </div>
          <div
            className='h-96 rounded-xl'
            style={{ backgroundColor: 'var(--color-section-bg)' }}
          />
        </div>
      </div>
    )
  }

  const modalConfig = getActionModalConfig()

  return (
    <div>
      <PageHeader title='Orders & Reservations' />

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatsCard
          label='Total Orders'
          value={orders.length}
          icon={<ShoppingCart size={20} />}
          variant='default'
        />
        <StatsCard
          label='Pending'
          value={pendingCount}
          icon={<Clock size={20} />}
          variant='warning'
        />
        <StatsCard
          label='Confirmed'
          value={confirmedCount}
          icon={<CheckCircle size={20} />}
          variant='primary'
        />
        <StatsCard
          label='Total Revenue'
          value={totalRevenue.toFixed(2)}
          prefix='$'
          icon={<DollarSign size={20} />}
          variant='success'
        />
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {(['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
          <FilterButton key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </FilterButton>
        ))}
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div
          className='rounded-xl border p-12 text-center'
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-muted)' }}>No reservations found</p>
        </div>
      ) : (
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
                  <th
                    className='text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Customer
                  </th>
                  <th
                    className='text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Tour
                  </th>
                  <th
                    className='text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Date
                  </th>
                  <th
                    className='text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Amount
                  </th>
                  <th
                    className='text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Payment
                  </th>
                  <th
                    className='text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Status
                  </th>
                  <th
                    className='text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className='border-t transition-colors hover:bg-[var(--color-section-bg)]'
                    style={{ borderColor: 'var(--color-card-border)' }}
                  >
                    <td className='py-3 px-4'>
                      <p
                        className='text-sm font-medium'
                        style={{ color: 'var(--color-text-heading)' }}
                      >
                        {order.user.fullName || order.user.username}
                      </p>
                      <p
                        className='text-xs'
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {order.user.email}
                      </p>
                    </td>
                    <td
                      className='py-3 px-4 text-sm'
                      style={{ color: 'var(--color-text-body)' }}
                    >
                      {order.tour.title}
                    </td>
                    <td
                      className='py-3 px-4 text-sm'
                      style={{ color: 'var(--color-text-body)' }}
                    >
                      {format(new Date(order.schedule.startTime), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td
                      className='py-3 px-4 text-sm text-right font-medium'
                      style={{ color: 'var(--color-text-heading)' }}
                    >
                      ${order.total_amount?.toFixed(2)}
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <StatusBadge status={order.payment_status} />
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <StatusBadge status={order.reservation_status} />
                    </td>
                    <td className='py-3 px-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        {order.reservation_status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => setActionTarget({ order, action: 'CONFIRM' })}
                              className='text-xs font-medium transition hover:opacity-70'
                              style={{ color: 'var(--color-success)' }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setActionTarget({ order, action: 'CANCEL' })}
                              className='text-xs font-medium transition hover:opacity-70'
                              style={{ color: 'var(--color-danger)' }}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {order.reservation_status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => setActionTarget({ order, action: 'COMPLETE' })}
                              className='text-xs font-medium transition hover:opacity-70'
                              style={{ color: 'var(--color-primary)' }}
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => setActionTarget({ order, action: 'CANCEL' })}
                              className='text-xs font-medium transition hover:opacity-70'
                              style={{ color: 'var(--color-danger)' }}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        <Link
                          href={`/orders/${order.id}`}
                          className='text-xs font-medium ml-2 transition hover:opacity-70'
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Modal - for Cancel show reason input */}
      {actionTarget && actionTarget.action === 'CANCEL' ? (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div
            className='rounded-xl p-8 max-w-md w-full shadow-xl'
            style={{ backgroundColor: 'var(--color-card-bg)' }}
          >
            <h2
              className='text-xl font-bold mb-2'
              style={{ color: 'var(--color-text-heading)' }}
            >
              Cancel Reservation
            </h2>
            <p
              className='text-sm mb-6'
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Cancel reservation for &quot;{actionTarget.order.tour.title}&quot; by{' '}
              {actionTarget.order.user.fullName || actionTarget.order.user.username}?
            </p>
            <div className='mb-6'>
              <label
                className='block text-sm font-medium mb-2'
                style={{ color: 'var(--color-text-body)' }}
              >
                Cancellation Reason (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className='w-full px-4 py-3 border rounded-lg outline-none transition'
                style={{ borderColor: 'var(--color-card-border)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-danger)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-danger-light)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-card-border)'; e.currentTarget.style.boxShadow = 'none' }}
                rows={3}
                placeholder='Provide a reason for cancellation...'
              />
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => { setActionTarget(null); setCancelReason('') }}
                disabled={updating}
                className='flex-1 px-4 py-2 border rounded-lg transition disabled:opacity-50 hover:bg-[var(--color-section-bg)]'
                style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
              >
                Go Back
              </button>
              <button
                onClick={handleAction}
                disabled={updating}
                className='flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 enabled:hover:opacity-90 flex items-center justify-center gap-2'
                style={{ backgroundColor: 'var(--color-danger)' }}
              >
                {updating && (
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                )}
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      ) : (
        <ConfirmModal
          isOpen={!!actionTarget}
          onClose={() => setActionTarget(null)}
          onConfirm={handleAction}
          title={modalConfig.title}
          description={modalConfig.description}
          confirmText={modalConfig.confirmText}
          variant={modalConfig.variant}
          loading={updating}
        />
      )}
    </div>
  )
}
