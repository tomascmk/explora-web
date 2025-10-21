'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

interface Order {
  id: string
  user: {
    username: string
    email: string
  }
  tour: {
    id: string
    title: string
  }
  schedule: {
    startTime: string
  }
  totalAmount: number
  paymentStatus: string
  reservationStatus: string
  createdAt: string
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<
    'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  >('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      // TODO: Create GraphQL query for guide's tour reservations
      // Mock data for now
      setOrders([
        {
          id: '1',
          user: { username: 'John Doe', email: 'john@example.com' },
          tour: { id: 'tour-1', title: 'Historic City Tour' },
          schedule: { startTime: new Date(2025, 9, 25, 10, 0).toISOString() },
          totalAmount: 75,
          paymentStatus: 'COMPLETED',
          reservationStatus: 'CONFIRMED',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          user: { username: 'Sarah Smith', email: 'sarah@example.com' },
          tour: { id: 'tour-2', title: 'Food Tour' },
          schedule: { startTime: new Date(2025, 9, 26, 15, 0).toISOString() },
          totalAmount: 95,
          paymentStatus: 'COMPLETED',
          reservationStatus: 'CONFIRMED',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          user: { username: 'Mike Johnson', email: 'mike@example.com' },
          tour: { id: 'tour-1', title: 'Historic City Tour' },
          schedule: { startTime: new Date(2025, 9, 24, 10, 0).toISOString() },
          totalAmount: 75,
          paymentStatus: 'COMPLETED',
          reservationStatus: 'COMPLETED',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders =
    filter === 'all'
      ? orders
      : orders.filter((o) => o.reservationStatus === filter)

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalAmount, 0)

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
          <p className='text-sm text-gray-600 mb-1'>Confirmed</p>
          <p className='text-3xl font-bold text-green-600'>
            {orders.filter((o) => o.reservationStatus === 'CONFIRMED').length}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Completed</p>
          <p className='text-3xl font-bold text-blue-600'>
            {orders.filter((o) => o.reservationStatus === 'COMPLETED').length}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Total Revenue</p>
          <p className='text-3xl font-bold text-green-600'>${totalRevenue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-6'>
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All
        </FilterButton>
        <FilterButton
          active={filter === 'PENDING'}
          onClick={() => setFilter('PENDING')}
        >
          Pending
        </FilterButton>
        <FilterButton
          active={filter === 'CONFIRMED'}
          onClick={() => setFilter('CONFIRMED')}
        >
          Confirmed
        </FilterButton>
        <FilterButton
          active={filter === 'COMPLETED'}
          onClick={() => setFilter('COMPLETED')}
        >
          Completed
        </FilterButton>
        <FilterButton
          active={filter === 'CANCELLED'}
          onClick={() => setFilter('CANCELLED')}
        >
          Cancelled
        </FilterButton>
      </div>

      {/* Orders Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>
                Customer
              </th>
              <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>
                Tour
              </th>
              <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>
                Date
              </th>
              <th className='text-right py-3 px-4 text-sm font-medium text-gray-600'>
                Amount
              </th>
              <th className='text-center py-3 px-4 text-sm font-medium text-gray-600'>
                Status
              </th>
              <th className='text-right py-3 px-4 text-sm font-medium text-gray-600'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className='border-t'>
                <td className='py-3 px-4'>
                  <p className='text-sm font-medium'>{order.user.username}</p>
                  <p className='text-xs text-gray-500'>{order.user.email}</p>
                </td>
                <td className='py-3 px-4 text-sm'>{order.tour.title}</td>
                <td className='py-3 px-4 text-sm'>
                  {format(
                    new Date(order.schedule.startTime),
                    'MMM d, yyyy h:mm a'
                  )}
                </td>
                <td className='py-3 px-4 text-sm text-right font-medium'>
                  ${order.totalAmount}
                </td>
                <td className='py-3 px-4 text-center'>
                  <ReservationStatusBadge status={order.reservationStatus} />
                </td>
                <td className='py-3 px-4 text-right'>
                  <button className='text-blue-600 hover:text-blue-800 text-sm'>
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[status as keyof typeof colors]
      }`}
    >
      {status}
    </span>
  )
}
