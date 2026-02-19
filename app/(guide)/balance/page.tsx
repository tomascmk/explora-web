'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useQuery, useMutation } from '@apollo/client/react'
import { MY_BALANCE, REQUEST_PAYOUT, MY_PAYOUT_REQUESTS } from '@/graphql/balance'
import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

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
      toast.error(error.message || 'Failed to request payout')
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
      <div className='p-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-8'></div>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='h-32 bg-gray-200 rounded-lg'></div>
            ))}
          </div>
          <div className='h-64 bg-gray-200 rounded-lg'></div>
        </div>
      </div>
    )
  }

  const payoutConfirmAmount = payoutAmount || balance?.availableBalance || 0

  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>Balance & Earnings</h1>
        <div className='flex gap-3 items-center'>
          <input
            type='number'
            value={payoutAmount || ''}
            onChange={(e) => setPayoutAmount(Number(e.target.value))}
            placeholder='Amount (leave empty for full balance)'
            className='border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
            min='0'
            max={balance?.availableBalance || 0}
            step='0.01'
          />
          <button
            onClick={handleRequestPayout}
            className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2'
            disabled={!balance || balance.availableBalance <= 0 || requestingPayout}
          >
            {requestingPayout && (
              <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
            )}
            {requestingPayout ? 'Processing...' : 'Request Payout'}
          </button>
        </div>
      </div>

      {/* Stripe Connection Warning */}
      {balance && !balance.stripeAccountId && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
          <p className='text-yellow-800 text-sm'>
            <span className='font-semibold'>Stripe not connected.</span> You need to connect your Stripe
            account in{' '}
            <a href='/settings/payments' className='underline hover:text-yellow-900'>
              Settings &gt; Payments
            </a>{' '}
            to receive payouts.
          </p>
        </div>
      )}

      {/* Balance Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <BalanceCard
          title='Available Balance'
          amount={balance?.availableBalance || 0}
          color='green'
          description='Ready to withdraw'
        />
        <BalanceCard
          title='Pending Balance'
          amount={balance?.pendingBalance || 0}
          color='yellow'
          description='Being processed'
        />
        <BalanceCard
          title='Total Earnings'
          amount={balance?.totalEarnings || 0}
          color='blue'
          description='All time'
        />
        <BalanceCard
          title='Total Payouts'
          amount={balance?.totalPayouts || 0}
          color='gray'
          description='Withdrawn'
        />
      </div>

      {/* Payout Requests History */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold mb-4'>Payout Requests</h2>
        {loadingPayouts ? (
          <div className='text-center py-8 text-gray-500'>Loading...</div>
        ) : payoutRequests.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>
            <p className='text-lg mb-1'>No payout requests yet</p>
            <p className='text-sm text-gray-400'>
              Request a payout when you have available balance
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>
                    Requested
                  </th>
                  <th className='text-right py-3 px-4 text-sm font-medium text-gray-600'>
                    Amount
                  </th>
                  <th className='text-center py-3 px-4 text-sm font-medium text-gray-600'>
                    Status
                  </th>
                  <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>
                    Processed
                  </th>
                  <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {payoutRequests.map((request) => (
                  <tr key={request.id} className='border-b hover:bg-gray-50'>
                    <td className='py-3 px-4 text-sm'>
                      {format(new Date(request.requestedAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className='py-3 px-4 text-sm text-right font-medium'>
                      ${request.amount.toFixed(2)}
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <PayoutStatusBadge status={request.status} />
                    </td>
                    <td className='py-3 px-4 text-sm text-gray-600'>
                      {request.processedAt
                        ? format(new Date(request.processedAt), 'MMM d, yyyy HH:mm')
                        : '-'}
                    </td>
                    <td className='py-3 px-4 text-sm text-gray-600'>
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

function BalanceCard({
  title,
  amount,
  color,
  description
}: {
  title: string
  amount: number
  color: 'green' | 'yellow' | 'blue' | 'gray'
  description: string
}) {
  const colorClasses = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600'
  }

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <p className='text-sm text-gray-600 mb-1'>{title}</p>
      <p className={`text-3xl font-bold mb-1 ${colorClasses[color]}`}>
        ${amount.toFixed(2)}
      </p>
      <p className='text-xs text-gray-500'>{description}</p>
    </div>
  )
}

function PayoutStatusBadge({ status }: { status: string }) {
  const upperStatus = status.toUpperCase()

  const styles: Record<string, string> = {
    PAID: 'bg-green-100 text-green-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    REJECTED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-purple-100 text-purple-800'
  }

  const labels: Record<string, string> = {
    PAID: 'Paid',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    PENDING: 'Pending',
    PROCESSING: 'Processing'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[upperStatus] || 'bg-gray-100 text-gray-800'}`}>
      {labels[upperStatus] || status}
    </span>
  )
}
