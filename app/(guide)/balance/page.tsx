'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@apollo/client/react'
import { MY_EARNINGS } from '@/graphql/balance'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import { ConnectMercadoPagoCard } from '@/components/ConnectMercadoPagoCard'

interface Earnings {
  inEscrow: number
  released: number
  total: number
  count: number
}

export default function BalancePage() {
  const { user } = useAuth()

  const { data, loading } = useQuery<{ myEarnings: Earnings }>(MY_EARNINGS, {
    skip: !user,
  })

  const earnings = data?.myEarnings

  if (loading) {
    return (
      <div>
        <div className='animate-pulse'>
          <div
            className='h-8 rounded w-1/4 mb-8'
            style={{ backgroundColor: 'var(--color-section-bg)' }}
          />
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='h-32 rounded-xl'
                style={{ backgroundColor: 'var(--color-section-bg)' }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title='Balance & Earnings' />

      {/* PLAN-036/041: conexión de la cuenta de cobro (MercadoPago).
          Los cobros van directo a esta cuenta — no hay wallet interna. */}
      <ConnectMercadoPagoCard enabled={!!user} />

      {/* PLAN-041: ganancias derivadas de las reservas marketplace. */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8'>
        <StatsCard
          label='In Escrow'
          value={earnings?.inEscrow?.toFixed(2) || '0.00'}
          prefix='$'
          icon={<Clock size={20} />}
          variant='warning'
        />
        <StatsCard
          label='Released'
          value={earnings?.released?.toFixed(2) || '0.00'}
          prefix='$'
          icon={<CheckCircle2 size={20} />}
          variant='success'
        />
        <StatsCard
          label='Total Earnings'
          value={earnings?.total?.toFixed(2) || '0.00'}
          prefix='$'
          icon={<TrendingUp size={20} />}
          variant='primary'
        />
      </div>

      <div
        className='rounded-xl border p-6'
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
        }}
      >
        <p className='text-sm' style={{ color: 'var(--color-text-body)' }}>
          Your earnings come from {earnings?.count || 0} marketplace reservation
          {earnings?.count === 1 ? '' : 's'}. Funds held{' '}
          <span className='font-medium'>in escrow</span> are released to your
          MercadoPago account once each tour or event is completed — there is no
          manual payout to request.
        </p>
      </div>
    </div>
  )
}
