'use client'

import { useQuery } from '@apollo/client/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ADMIN_GET_ALL_USERS, AdminUsersData } from '@/graphql/admin/users'
import { ADMIN_GET_ALL_RESERVATIONS, AdminReservationsData } from '@/graphql/admin/reservations'
import { ADMIN_GET_ALL_TOURS, AdminToursData } from '@/graphql/admin/tours'
import { ADMIN_GET_ALL_CLAIMS, AdminClaimsData } from '@/graphql/admin/moderation'
import { ADMIN_GET_AUDIT_LOG, AuditLogData } from '@/graphql/admin/audit-log'
import {
  Users,
  ClipboardList,
  Compass,
  DollarSign,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

export default function AdminDashboardPage() {
  const { data: usersData, loading: usersLoading } = useQuery<AdminUsersData>(ADMIN_GET_ALL_USERS)
  const { data: reservationsData, loading: reservationsLoading } = useQuery<AdminReservationsData>(ADMIN_GET_ALL_RESERVATIONS)
  const { data: toursData, loading: toursLoading } = useQuery<AdminToursData>(ADMIN_GET_ALL_TOURS)
  const { data: claimsData, loading: claimsLoading } = useQuery<AdminClaimsData>(ADMIN_GET_ALL_CLAIMS)
  const { data: auditData, loading: auditLoading } = useQuery<AuditLogData>(ADMIN_GET_AUDIT_LOG, {
    variables: { limit: 10, offset: 0 },
  })

  const loading = usersLoading || reservationsLoading || toursLoading || claimsLoading

  const stats = useMemo(() => {
    const users = usersData?.users || []
    const reservations = reservationsData?.tourReservations || []
    const tours = toursData?.tours || []
    const claims = claimsData?.claims || []

    const activeReservations = reservations.filter(
      (r) => r.reservation_status === 'CONFIRMED' || r.reservation_status === 'PENDING'
    )
    const totalRevenue = reservations
      .filter((r) => r.payment_status === 'PAID')
      .reduce((sum, r) => sum + (parseFloat(String(r.total_amount)) || 0), 0)
    const pendingClaims = claims.filter((c) => c.status === 'PENDING' || c.status === 'OPEN')

    return {
      totalUsers: users.length,
      activeReservations: activeReservations.length,
      totalRevenue,
      activeTours: tours.filter((t) => t.status === 'PUBLISHED' || t.status === 'ACTIVE').length,
      pendingClaims: pendingClaims.length,
      totalTours: tours.length,
    }
  }, [usersData, reservationsData, toursData, claimsData])

  // PLAN-100: antes leía `myAuditLog` — las acciones del propio admin. En un
  // panel de administración "actividad reciente" tiene que ser la de todos, o
  // no informa nada sobre lo que está pasando en el sistema.
  const recentActivity = useMemo(() => {
    return (auditData?.adminAuditLog || []).slice(0, 8)
  }, [auditData])

  const recentReservations = useMemo(() => {
    const reservations = reservationsData?.tourReservations || []
    return [...reservations]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [reservationsData])

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 size={32} className='animate-spin' style={{ color: 'var(--color-primary)' }} />
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title='Admin Dashboard'
        subtitle='Overview of your platform'
      />

      {/* Stats Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <StatsCard
          label='Total Users'
          value={stats.totalUsers}
          icon={<Users size={20} />}
          variant='primary'
        />
        <StatsCard
          label='Active Reservations'
          value={stats.activeReservations}
          icon={<ClipboardList size={20} />}
          variant='success'
        />
        <StatsCard
          label='Total Revenue'
          value={stats.totalRevenue.toFixed(0)}
          prefix='$'
          icon={<DollarSign size={20} />}
          variant='warning'
        />
        <StatsCard
          label='Active Tours'
          value={stats.activeTours}
          icon={<Compass size={20} />}
          variant='default'
        />
      </div>

      {/* Alerts */}
      {stats.pendingClaims > 0 && (
        <div
          className='rounded-xl border p-4 mb-6 flex items-center gap-3'
          style={{
            backgroundColor: 'var(--color-warning-light)',
            borderColor: 'var(--color-warning)',
          }}
        >
          <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
          <div>
            <p className='text-sm font-semibold' style={{ color: 'var(--color-text-heading)' }}>
              {stats.pendingClaims} pending claim{stats.pendingClaims > 1 ? 's' : ''} require attention
            </p>
            <Link
              href='/admin/moderation'
              className='text-xs font-medium underline'
              style={{ color: 'var(--color-primary)' }}
            >
              Go to Moderation
            </Link>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recent Reservations */}
        <div
          className='rounded-xl border overflow-hidden'
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <div className='flex items-center justify-between px-5 py-4 border-b' style={{ borderColor: 'var(--color-card-border)' }}>
            <h2 className='text-base font-semibold' style={{ color: 'var(--color-text-heading)' }}>
              Recent Reservations
            </h2>
            <Link
              href='/admin/reservations'
              className='text-xs font-medium'
              style={{ color: 'var(--color-primary)' }}
            >
              View all
            </Link>
          </div>
          <div className='divide-y' style={{ borderColor: 'var(--color-card-border)' }}>
            {recentReservations.length === 0 ? (
              <p className='p-5 text-sm text-center' style={{ color: 'var(--color-text-muted)' }}>
                No reservations yet
              </p>
            ) : (
              recentReservations.map((r) => (
                <div key={r.id} className='px-5 py-3 flex items-center justify-between'>
                  <div className='min-w-0'>
                    <p className='text-sm font-medium truncate' style={{ color: 'var(--color-text-body)' }}>
                      {r.user?.fullName || r.user?.username || 'Unknown'}
                    </p>
                    <p className='text-xs truncate' style={{ color: 'var(--color-text-muted)' }}>
                      {r.tour?.title || 'Unknown tour'}
                    </p>
                  </div>
                  <div className='flex items-center gap-3 flex-shrink-0'>
                    <span className='text-sm font-semibold' style={{ color: 'var(--color-text-heading)' }}>
                      ${parseFloat(String(r.total_amount ?? 0)).toFixed(2)}
                    </span>
                    <StatusBadge status={r.reservation_status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className='rounded-xl border overflow-hidden'
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <div className='flex items-center justify-between px-5 py-4 border-b' style={{ borderColor: 'var(--color-card-border)' }}>
            <h2 className='text-base font-semibold' style={{ color: 'var(--color-text-heading)' }}>
              Recent Activity
            </h2>
            <Link
              href='/admin/audit-log'
              className='text-xs font-medium'
              style={{ color: 'var(--color-primary)' }}
            >
              View all
            </Link>
          </div>
          <div className='divide-y' style={{ borderColor: 'var(--color-card-border)' }}>
            {auditLoading ? (
              <div className='p-5 text-center'>
                <Loader2 size={20} className='animate-spin mx-auto' style={{ color: 'var(--color-primary)' }} />
              </div>
            ) : recentActivity.length === 0 ? (
              <p className='p-5 text-sm text-center' style={{ color: 'var(--color-text-muted)' }}>
                No recent activity
              </p>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className='px-5 py-3'>
                  <div className='flex items-center gap-2 mb-0.5'>
                    <span
                      className='text-xs font-semibold px-1.5 py-0.5 rounded'
                      style={{
                        backgroundColor: 'var(--color-section-bg)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {log.action}
                    </span>
                    <span className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
                      {log.entity}
                    </span>
                  </div>
                  <p className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
                    {log.user?.fullName || 'Unknown'} ·{' '}
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
