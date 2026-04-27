'use client'

import { useQuery } from '@apollo/client/react'
import { GET_GUIDE_ANALYTICS } from '@/graphql/analytics'
import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { BookingsChart } from '@/components/dashboard/BookingsChart'
import { TopToursTable } from '@/components/dashboard/TopToursTable'
import { DashboardTour } from '@/components/tutorial/DashboardTour'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAuth } from '@/contexts/AuthContext'
import { useMemo, useState } from 'react'
import { subMonths } from 'date-fns'

interface PeriodData {
  period: string
  count: number
  revenue: number
}

interface RevenuePeriod {
  period: string
  amount: number
}

interface TopTour {
  tourId: string
  tourTitle: string
  bookings: number
  revenue: number
}

interface Trends {
  bookingGrowth: number
  revenueGrowth: number
  ratingTrend: number
}

interface GuideAnalytics {
  totalBookings: number
  totalRevenue: number
  averageRating: number
  conversionRate: number
  bookingsByPeriod: PeriodData[]
  revenueByPeriod: RevenuePeriod[]
  topTours: TopTour[]
  trends: Trends
}

interface AnalyticsQueryResult {
  myGuideAnalytics: GuideAnalytics
}

type PeriodOption = '1' | '3' | '6' | '12'

export default function GuideDashboardPage() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('6')

  // Derive the date range from the selected period on every render so the ISO
  // strings we pass to Apollo are stable per period selection and don't drift
  // with every component re-render (avoids spurious refetches).
  const dateRange = useMemo(() => {
    const months = parseInt(selectedPeriod, 10)
    const endDate = new Date()
    return {
      startDate: subMonths(endDate, months),
      endDate,
    }
  }, [selectedPeriod])

  const { data, loading, error, refetch } = useQuery<AnalyticsQueryResult>(GET_GUIDE_ANALYTICS, {
    skip: !user,
    variables: {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    },
  })

  const periodSelect = (
    <select
      className='px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2'
      style={{
        border: '1px solid var(--color-card-border)',
        backgroundColor: 'var(--color-card-bg)',
        color: 'var(--color-text-body)',
      }}
      value={selectedPeriod}
      onChange={(e) => setSelectedPeriod(e.target.value as PeriodOption)}
    >
      <option value='1'>Last Month</option>
      <option value='3'>Last 3 Months</option>
      <option value='6'>Last 6 Months</option>
      <option value='12'>Last Year</option>
    </select>
  )

  // Session expired → dedicated screen, no header (user must re-auth)
  if (error && (error.message.includes('Unauthorized') || error.message.includes('UNAUTHENTICATED'))) {
    return (
      <div
        className='border px-4 py-3 rounded'
        style={{
          backgroundColor: 'var(--color-warning-light)',
          borderColor: 'var(--color-warning)',
          color: 'var(--color-text-body)',
        }}
      >
        <p className='font-medium'>Session expired</p>
        <p className='text-sm'>Please log in again to view your analytics</p>
        <button
          onClick={() => (window.location.href = '/login')}
          className='mt-2 px-4 py-2 text-white rounded transition-colors'
          style={{ backgroundColor: 'var(--color-warning)' }}
        >
          Go to Login
        </button>
      </div>
    )
  }

  const analytics = data?.myGuideAnalytics
  // Show loading only on the initial fetch (no data yet). Subsequent refetches
  // (e.g. when changing the period filter) keep the previous data visible so
  // the header + select stay mounted and don't "reset" visually.
  const isInitialLoading = loading && !analytics

  return (
    <>
      <DashboardTour />

      <PageHeader title='Dashboard' actions={periodSelect} />

      {isInitialLoading ? (
        <div className='flex items-center justify-center h-64'>
          <div
            className='animate-spin rounded-full h-12 w-12 border-b-2'
            style={{ borderColor: 'var(--color-primary)' }}
          ></div>
        </div>
      ) : error && !analytics ? (
        <div
          className='border px-4 py-3 rounded'
          style={{
            backgroundColor: 'var(--color-section-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <p className='font-medium' style={{ color: 'var(--color-text-body)' }}>No data available</p>
          <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>{error.message}</p>
          <button
            onClick={() => refetch()}
            className='mt-2 px-4 py-2 text-white rounded transition hover:opacity-90'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Try again
          </button>
        </div>
      ) : !analytics ? (
        <div className='text-center py-12'>
          <p className='text-lg mb-2' style={{ color: 'var(--color-text-muted)' }}>No analytics available yet</p>
          <p className='text-sm' style={{ color: 'var(--color-text-muted)' }}>
            Complete some tours to see your statistics here
          </p>
        </div>
      ) : (
        <div
          className={`transition-opacity ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}
          aria-busy={loading}
        >
          {/* Metrics Cards */}
          <div className='mb-8' data-tour='metrics'>
            <MetricsCards
              totalBookings={analytics.totalBookings}
              totalRevenue={analytics.totalRevenue}
              averageRating={analytics.averageRating}
              conversionRate={analytics.conversionRate}
              bookingGrowth={analytics.trends.bookingGrowth}
              revenueGrowth={analytics.trends.revenueGrowth}
            />
          </div>

          {/* Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
            <div data-tour='revenue-chart'>
              <RevenueChart data={analytics.revenueByPeriod} />
            </div>
            <div data-tour='bookings-chart'>
              <BookingsChart data={analytics.bookingsByPeriod} />
            </div>
          </div>

          {/* Top Tours */}
          <div data-tour='top-tours'>
            <TopToursTable tours={analytics.topTours} />
          </div>
        </div>
      )}
    </>
  )
}
