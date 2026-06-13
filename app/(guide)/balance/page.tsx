'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useQuery, useMutation } from '@apollo/client/react'
import { MY_BALANCE, REQUEST_PAYOUT, MY_PAYOUT_REQUESTS } from '@/graphql/balance'
import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getDisplayError } from '@/utils/errorMessages'
import { Wallet, Clock, TrendingUp, ArrowDownToLine } from 'lucide-react'

interface Balance {
  id: string
  availableBalance: number
  pendingBalance: number
  totalEarnings: number
  totalPayouts: number
  stripeAccountId?: string
  createdAt: string
  updatedAt: string
}

interface PayoutRequest {
  id: string
  amount: number
  status: string
  requestedAt: string
  processedAt?: string
  notes?: string
}

export default function BalancePage() {
  const { user } = useAuth()
  const [payoutAmount, setPayoutAmount] = useState<number>(0)
  const [showPayoutConfirm, setShowPayoutConfirm] = useState(false)

  const { data, loading, refetch } = useQuery<{ myBalance: Balance }>(MY_BALANCE, {
    skip: !user
  })

  const { data: payoutRequestsData, loading: loadingPayouts, refetch: refetchPayouts } = useQuery<{
    myPayoutRequests: PayoutRequest[]
  }>(MY_PAYOUT_REQUESTS, { skip: !user })

  const [requestPayoutMutation, { loading: requestingPayout }] = useMutation(REQUEST_PAYOUT, {
    onCompleted: () => {
      toast.success('Payout request submitted successfully!')
      refetch()
      refetchPayouts()
      setPayoutAmount(0)
      setShowPayoutConfirm(false)
    },
    onError: (error) => {
      toast.error(getDisplayError(error))
      setShowPayoutConfirm(false)
    }
  })

  const balance = data?.myBalance
  const payoutRequests = payoutRequestsData?.myPayoutRequests || []

  const handleRequestPayout = () => {
    if (!balance || balance.availableBalance <= 0) {
      toast.error('No available balance to withdraw')
      return
    }

    const amount = payoutAmount || balance.availableBalance

    if (amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amount > balance.availableBalance) {
      toast.error('Amount exceeds available balance')
      return
    }

    setShowPayoutConfirm(true)
  }

  const confirmPayout = async () => {
    const amount = payoutAmount || balance?.availableBalance || 0
    try {
      await requestPayoutMutation({ variables: { amount } })
    } catch {
      // Handled by onError
    }
  }

  if (loading) {
    return (
      <div>
        <div className='animate-pulse'>
          <div
            className='h-8 rounded w-1/4 mb-8'
            style={{ backgroundColor: 'var(--color-section-bg)' }}
          />
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className='h-32 rounded-xl'
                style={{ backgroundColor: 'var(--color-section-bg)' }}
              />
            ))}
          </div>
          <div
            className='h-64 rounded-xl'
            style={{ backgroundColor: 'var(--color-section-bg)' }}
          />
        </div>
      </div>
    )
  }

  const payoutConfirmAmount = payoutAmount || balance?.availableBalance || 0

  return (
    <div>
      <PageHeader
        title='Balance & Earnings'
        actions={
          <div className='flex gap-3 items-center'>
            <input
              type='number'
              value={payoutAmount || ''}
              onChange={(e) => setPayoutAmount(Number(e.target.value))}
              placeholder='Amount (leave empty for full balance)'
              className='border rounded-lg px-4 py-2 w-64 outline-none transition'
              style={{ borderColor: 'var(--color-card-border)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-primary-light)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-card-border)'; e.currentTarget.style.boxShadow = 'none' }}
              min='0'
              max={balance?.availableBalance || 0}
              step='0.01'
            />
            <button
              onClick={handleRequestPayout}
              className='text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:opacity-90 flex items-center gap-2'
              style={{ backgroundColor: 'var(--color-primary)' }}
              disabled={!balance || balance.availableBalance <= 0 || requestingPayout}
            >
              {requestingPayout && (
                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              )}
              {requestingPayout ? 'Processing...' : 'Request Payout'}
            </button>
          </div>
        }
      />

      {/* Stripe Connection Warning */}
      {balance && !balance.stripeAccountId && (
        <div
          className='border rounded-xl p-4 mb-6'
          style={{
            backgroundColor: 'var(--color-warning-light)',
            borderColor: 'var(--color-warning)',
          }}
        >
          <p className='text-sm' style={{ color: 'var(--color-text-body)' }}>
            <span className='font-semibold'>Stripe not connected.</span> You need to connect your Stripe
            account in{' '}
            <a
              href='/settings/payments'
              className='underline transition hover:opacity-80'
              style={{ color: 'var(--color-primary-dark)' }}
            >
              Settings &gt; Payments
            </a>{' '}
            to receive payouts.
          </p>
        </div>
      )}

      {/* Balance Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatsCard
          label='Available Balance'
          value={balance?.availableBalance?.toFixed(2) || '0.00'}
          prefix='$'
          icon={<Wallet size={20} />}
          variant='success'
        />
        <StatsCard
          label='Pending Balance'
          value={balance?.pendingBalance?.toFixed(2) || '0.00'}
          prefix='$'
          icon={<Clock size={20} />}
          variant='warning'
        />
        <StatsCard
          label='Total Earnings'
          value={balance?.totalEarnings?.toFixed(2) || '0.00'}
          prefix='$'
          icon={<TrendingUp size={20} />}
          variant='primary'
        />
        <StatsCard
          label='Total Payouts'
          value={balance?.totalPayouts?.toFixed(2) || '0.00'}
          prefix='$'
          icon={<ArrowDownToLine size={20} />}
          variant='default'
        />
      </div>

      {/* Payout Requests History */}
      <div
        className='rounded-xl border p-6'
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
        }}
      >
        <h2
          className='text-xl font-semibold mb-4'
          style={{ color: 'var(--color-text-heading)' }}
        >
          Payout Requests
        </h2>
        {loadingPayouts ? (
          <div
            className='text-center py-8'
            style={{ color: 'var(--color-text-muted)' }}
          >
            Loading...
          </div>
        ) : payoutRequests.length === 0 ? (
          <div className='text-center py-12'>
            <p
              className='text-lg mb-1'
              style={{ color: 'var(--color-text-muted)' }}
            >
              No payout requests yet
            </p>
            <p
              className='text-sm'
              style={{ color: 'var(--color-text-muted)' }}
            >
              Request a payout when you have available balance
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr style={{ borderBottomWidth: '1px', borderColor: 'var(--color-card-border)' }}>
                  <th
                    className='text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Requested
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
                    Status
                  </th>
                  <th
                    className='text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Processed
                  </th>
                  <th
                    className='text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {payoutRequests.map((request) => (
                  <tr
                    key={request.id}
                    className='border-t transition-colors hover:bg-[var(--color-section-bg)]'
                    style={{ borderColor: 'var(--color-card-border)' }}
                  >
                    <td
                      className='py-3 px-4 text-sm'
                      style={{ color: 'var(--color-text-body)' }}
                    >
                      {format(new Date(request.requestedAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td
                      className='py-3 px-4 text-sm text-right font-medium'
                      style={{ color: 'var(--color-text-heading)' }}
                    >
                      ${request.amount.toFixed(2)}
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <StatusBadge status={request.status} />
                    </td>
                    <td
                      className='py-3 px-4 text-sm'
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {request.processedAt
                        ? format(new Date(request.processedAt), 'MMM d, yyyy HH:mm')
                        : '-'}
                    </td>
                    <td
                      className='py-3 px-4 text-sm'
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {request.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Confirmation Modal */}
      <ConfirmModal
        isOpen={showPayoutConfirm}
        onClose={() => setShowPayoutConfirm(false)}
        onConfirm={confirmPayout}
        title='Confirm Payout Request'
        description={`Request a payout of $${payoutConfirmAmount.toFixed(2)} from your available balance?`}
        confirmText='Request Payout'
        variant='primary'
        loading={requestingPayout}
      />
    </div>
  )
}
