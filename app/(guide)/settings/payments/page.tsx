'use client'

import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConnectMercadoPagoCard } from '@/components/ConnectMercadoPagoCard'

export default function PaymentSettingsPage() {
  const { user } = useAuth()

  return (
    <div>
      <PageHeader title='Payment Settings' />

      <div className='max-w-4xl space-y-6'>
        {/* PLAN-041: el cobro se hace por MercadoPago (escrow → release directo a
            la cuenta del guía). El viejo Stripe account ID + balance interno fueron
            retirados; la fuente de verdad es el marketplace. */}
        <ConnectMercadoPagoCard enabled={!!user} />

        <div
          className='rounded-xl border p-6'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <p className='text-sm' style={{ color: 'var(--color-text-body)' }}>
            Connect your MercadoPago account to receive payments. Your earnings
            are paid directly to this account when a tour or event is completed —
            see{' '}
            <a href='/balance' className='hover:underline' style={{ color: 'var(--color-primary)' }}>
              Balance &amp; Earnings
            </a>{' '}
            for the breakdown.
          </p>
        </div>
      </div>
    </div>
  )
}
