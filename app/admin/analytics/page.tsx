'use client'

import { useQuery } from '@apollo/client/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { ADMIN_GET_ALL_USERS, AdminUsersData } from '@/graphql/admin/users'
import { ADMIN_GET_ALL_RESERVATIONS, AdminReservationsData } from '@/graphql/admin/reservations'
import { ADMIN_GET_ALL_TOURS, AdminToursData } from '@/graphql/admin/tours'
import {
  Users,
  DollarSign,
  Loader2,
  Compass,
  ClipboardList,
} from 'lucide-react'
import { useMemo } from 'react'

export default function AdminAnalyticsPage() {
  const { data: usersData, loading: usersLoading } = useQuery<AdminUsersData>(ADMIN_GET_ALL_USERS)
  const { data: reservationsData, loading: reservationsLoading } = useQuery<AdminReservationsData>(ADMIN_GET_ALL_RESERVATIONS)
  const { data: toursData, loading: toursLoading } = useQuery<AdminToursData>(ADMIN_GET_ALL_TOURS)

  const loading = usersLoading || reservationsLoading || toursLoading

  const stats = useMemo(() => {
    const users = usersData?.users || []
    const reservations = reservationsData?.tourReservations || []
    const tours = toursData?.tours || []

    const totalRevenue = reservations
      .filter((r) => r.payment_status === 'PAID')
      .reduce((sum, r) => sum + (parseFloat(String(r.total_amount)) || 0), 0)

    const confirmedReservations = reservations.filter((r) => r.reservation_status === 'CONFIRMED')
    const cancelledReservations = reservations.filter((r) => r.reservation_status === 'CANCELLED')
    const guides = users.filter((u) => u.roles?.includes('GUIDE'))
    const tourists = users.filter((u) => u.roles?.includes('TOURIST'))

    // Monthly breakdown
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentReservations = reservations.filter(
      (r) => new Date(r.created_at) >= thirtyDaysAgo
    )
    const recentRevenue = recentReservations
      .filter((r) => r.payment_status === 'PAID')
      .reduce((sum, r) => sum + (parseFloat(String(r.total_amount)) || 0), 0)

    // Top tours by reservations
    const tourReservationCount: Record<string, { title: string; count: number; revenue: number }> = {}
    reservations.forEach((r) => {
      if (r.tour?.id) {
        if (!tourReservationCount[r.tour.id]) {
          tourReservationCount[r.tour.id] = { title: r.tour.title, count: 0, revenue: 0 }
        }
        tourReservationCount[r.tour.id].count++
        if (r.payment_status === 'PAID') {
          tourReservationCount[r.tour.id].revenue += parseFloat(String(r.total_amount)) || 0
        }
      }
    })
    const topTours = Object.values(tourReservationCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalUsers: users.length,
      totalGuides: guides.length,
      totalTourists: tourists.length,
      totalTours: tours.length,
      activeTours: tours.filter((t) => t.status === 'PUBLISHED' || t.status === 'ACTIVE').length,
      totalReservations: reservations.length,
      confirmedReservations: confirmedReservations.length,
      cancelledReservations: cancelledReservations.length,
      totalRevenue,
      recentReservations: recentReservations.length,
      recentRevenue,
      cancellationRate: reservations.length > 0
        ? ((cancelledReservations.length / reservations.length) * 100).toFixed(1)
        : '0.0',
      topTours,
    }
  }, [usersData, reservationsData, toursData])

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 size={32} className='animate-spin' style={{ color: 'var(--color-primary)' }} />
      </div>
    )
  }

  return (
    <>
      <PageHeader title='Analytics' subtitle='Platform metrics and insights' />

      {/* Overview Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <StatsCard
          label='Total Users'
          value={stats.totalUsers}
          icon={<Users size={20} />}
          variant='primary'
        />
        <StatsCard
          label='Total Revenue'
          value={stats.totalRevenue.toFixed(0)}
          prefix='$'
          icon={<DollarSign size={20} />}
          variant='success'
        />
        <StatsCard
          label='Total Reservations'
          value={stats.totalReservations}
          icon={<ClipboardList size={20} />}
          variant='warning'
        />
        <StatsCard
          label='Active Tours'
          value={stats.activeTours}
          icon={<Compass size={20} />}
          variant='default'
        />
      </div>

      {/* Breakdown */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
        {/* User Breakdown */}
        <div
          className='rounded-xl border p-5'
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <h3 className='text-sm font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>
            User Breakdown
          </h3>
          <div className='space-y-3'>
            {[
              { label: 'Guides', value: stats.totalGuides, color: 'var(--color-success)' },
              { label: 'Tourists', value: stats.totalTourists, color: 'var(--color-primary)' },
              { label: 'Total', value: stats.totalUsers, color: 'var(--color-text-heading)' },
            ].map(({ label, value, color }) => (
              <div key={label} className='flex items-center justify-between'>
                <span className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>
                  {label}
                </span>
                <span className='text-sm font-semibold' style={{ color }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reservation Breakdown */}
        <div
          className='rounded-xl border p-5'
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <h3 className='text-sm font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>
            Reservation Breakdown
          </h3>
          <div className='space-y-3'>
            {[
              { label: 'Confirmed', value: stats.confirmedReservations, color: 'var(--color-success)' },
              { label: 'Cancelled', value: stats.cancelledReservations, color: 'var(--color-danger)' },
              { label: 'Cancellation Rate', value: `${stats.cancellationRate}%`, color: 'var(--color-warning)' },
            ].map(({ label, value, color }) => (
              <div key={label} className='flex items-center justify-between'>
                <span className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>
                  {label}
                </span>
                <span className='text-sm font-semibold' style={{ color }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Last 30 Days */}
        <div
          className='rounded-xl border p-5'
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <h3 className='text-sm font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>
            Last 30 Days
          </h3>
          <div className='space-y-3'>
            {[
              { label: 'New Reservations', value: stats.recentReservations, color: 'var(--color-primary)' },
              { label: 'Revenue', value: `$${stats.recentRevenue.toFixed(0)}`, color: 'var(--color-success)' },
            ].map(({ label, value, color }) => (
              <div key={label} className='flex items-center justify-between'>
                <span className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>
                  {label}
                </span>
                <span className='text-sm font-semibold' style={{ color }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Tours */}
      <div
        className='rounded-xl border overflow-hidden'
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
        }}
      >
        <div className='px-5 py-4 border-b' style={{ borderColor: 'var(--color-card-border)' }}>
          <h3 className='text-base font-semibold' style={{ color: 'var(--color-text-heading)' }}>
            Top Tours by Reservations
          </h3>
        </div>
        <div className='divide-y' style={{ borderColor: 'var(--color-card-border)' }}>
          {stats.topTours.length === 0 ? (
            <p className='p-5 text-sm text-center' style={{ color: 'var(--color-text-muted)' }}>
              No data available
            </p>
          ) : (
            stats.topTours.map((tour, i) => (
              <div key={i} className='px-5 py-3 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <span
                    className='text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center'
                    style={{
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <p className='text-sm font-medium' style={{ color: 'var(--color-text-heading)' }}>
                    {tour.title}
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <span className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>
                    {tour.count} bookings
                  </span>
                  <span className='text-sm font-semibold' style={{ color: 'var(--color-success)' }}>
                    ${tour.revenue.toFixed(0)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
