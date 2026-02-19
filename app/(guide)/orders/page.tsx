'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_GUIDE_RESERVATIONS, UPDATE_RESERVATION_STATUS } from '@/graphql/reservations'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { toast } from 'sonner'
import Link from 'next/link'

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

  const { data, loading, refetch } = useQuery<{ tourReservationsByGuide: Order[] }>(
    GET_GUIDE_RESERVATIONS,
    {
      variables: { guideId: user?.id },
      skip: !user
    }
  )

  const [updateStatusMutation, { loading: updating }] = useMutation(UPDATE_RESERVATION_STATUS, {
    onCompleted: () => {
      refetch()
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
  const completedCount = orders.filter((o) => o.reservation_status === 'COMPLETED').length

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
      <div className='p-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/4'></div>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='h-24 bg-gray-200 rounded-lg'></div>
            ))}
          </div>
          <div className='h-96 bg-gray-200 rounded-lg'></div>
        </div>
      </div>
    )
  }

  const modalConfig = getActionModalConfig()

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold mb-8'>Orders & Reservations</h1>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Total Orders</p>
          <p className='text-3xl font-bold'>{orders.length}</p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Pending</p>
          <p className='text-3xl font-bold text-yellow-600'>{pendingCount}</p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Confirmed</p>
          <p className='text-3xl font-bold text-blue-600'>{confirmedCount}</p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Total Revenue</p>
          <p className='text-3xl font-bold text-green-600'>${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-6'>
        {(['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
          <FilterButton key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </FilterButton>
        ))}
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-12 text-center'>
          <p className='text-gray-500'>No reservations found</p>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>Customer</th>
                <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>Tour</th>
                <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>Date</th>
                <th className='text-right py-3 px-4 text-sm font-medium text-gray-600'>Amount</th>
                <th className='text-center py-3 px-4 text-sm font-medium text-gray-600'>Payment</th>
                <th className='text-center py-3 px-4 text-sm font-medium text-gray-600'>Status</th>
                <th className='text-right py-3 px-4 text-sm font-medium text-gray-600'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className='border-t hover:bg-gray-50'>
                  <td className='py-3 px-4'>
                    <p className='text-sm font-medium'>{order.user.fullName || order.user.username}</p>
                    <p className='text-xs text-gray-500'>{order.user.email}</p>
                  </td>
                  <td className='py-3 px-4 text-sm'>{order.tour.title}</td>
                  <td className='py-3 px-4 text-sm'>
                    {format(new Date(order.schedule.startTime), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className='py-3 px-4 text-sm text-right font-medium'>
                    ${order.total_amount?.toFixed(2)}
                  </td>
                  <td className='py-3 px-4 text-center'>
                    <PaymentStatusBadge status={order.payment_status} />
                  </td>
                  <td className='py-3 px-4 text-center'>
                    <ReservationStatusBadge status={order.reservation_status} />
                  </td>
                  <td className='py-3 px-4 text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      {order.reservation_status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setActionTarget({ order, action: 'CONFIRM' })}
                            className='text-green-600 hover:text-green-800 text-xs font-medium'
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setActionTarget({ order, action: 'CANCEL' })}
                            className='text-red-600 hover:text-red-800 text-xs font-medium'
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {order.reservation_status === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => setActionTarget({ order, action: 'COMPLETE' })}
                            className='text-blue-600 hover:text-blue-800 text-xs font-medium'
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => setActionTarget({ order, action: 'CANCEL' })}
                            className='text-red-600 hover:text-red-800 text-xs font-medium'
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <Link
                        href={`/orders/${order.id}`}
                        className='text-blue-600 hover:text-blue-800 text-xs font-medium ml-2'
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
      )}

      {/* Action Modal - for Cancel show reason input */}
      {actionTarget && actionTarget.action === 'CANCEL' ? (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-8 max-w-md w-full'>
            <h2 className='text-xl font-bold mb-2'>Cancel Reservation</h2>
            <p className='text-sm text-gray-600 mb-6'>
              Cancel reservation for &quot;{actionTarget.order.tour.title}&quot; by{' '}
              {actionTarget.order.user.fullName || actionTarget.order.user.username}?
            </p>
            <div className='mb-6'>
              <label className='block text-sm font-medium mb-2'>Cancellation Reason (optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className='w-full px-4 py-3 border rounded focus:ring-2 focus:ring-red-500'
                rows={3}
                placeholder='Provide a reason for cancellation...'
              />
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => { setActionTarget(null); setCancelReason('') }}
                disabled={updating}
                className='flex-1 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50'
              >
                Go Back
              </button>
              <button
                onClick={handleAction}
                disabled={updating}
                className='flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2'
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

function FilterButton({
  children,
  active,
  onClick
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-medium text-sm transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50 border'
      }`}
    >
      {children}
    </button>
  )
}

function ReservationStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-purple-100 text-purple-800'
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}
