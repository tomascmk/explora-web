'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useQuery, useMutation } from '@apollo/client/react'
import { MY_BALANCE, REQUEST_PAYOUT, MY_PAYOUT_REQUESTS } from '@/graphql/balance'
import { useState } from 'react'

interface Balance {
  id: string
  availableBalance: number
  pendingBalance: number
  totalEarnings: number
  totalPayouts: number
  lastPayoutDate?: string
  stripeAccountId?: string
  stripeAccountStatus?: string
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

  const { data, loading, refetch } = useQuery<{ myBalance: Balance }>(MY_BALANCE, {
    skip: !user
  })

  const { data: payoutRequestsData, loading: loadingPayouts } = useQuery<{ myPayoutRequests: PayoutRequest[] }>(
    MY_PAYOUT_REQUESTS,
    { skip: !user }
  )

  const [requestPayoutMutation, { loading: requestingPayout }] = useMutation(REQUEST_PAYOUT, {
    onCompleted: () => {
      alert('Payout request submitted successfully!')
      refetch()
      setPayoutAmount(0)
    },
    onError: (error) => {
      alert(`Error: ${error.message}`)
    }
  })

  const balance = data?.myBalance
  const payoutRequests = payoutRequestsData?.myPayoutRequests || []

  const requestPayout = async () => {
    if (!balance || balance.availableBalance <= 0) {
      alert('No available balance to withdraw')
      return
    }

    const amount = payoutAmount || balance.availableBalance

    if (amount > balance.availableBalance) {
      alert('Amount exceeds available balance')
      return
    }

    if (confirm(`Request payout of $${amount.toFixed(2)}?`)) {
      await requestPayoutMutation({ variables: { amount } })
    }
  }

  if (loading) {
    return (
      <div className='p-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-8'></div>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='h-32 bg-gray-200 rounded-lg'></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

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
            className='border border-gray-300 rounded-lg px-4 py-2 w-64'
            min='0'
            max={balance?.availableBalance || 0}
          />
          <button
            onClick={requestPayout}
            className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed'
            disabled={!balance || balance.availableBalance <= 0 || requestingPayout}
          >
            {requestingPayout ? 'Processing...' : 'Request Payout'}
          </button>
        </div>
      </div>

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
          <div className='text-center py-8 text-gray-500'>No payout requests yet</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>
                    Date
                  </th>
                  <th className='text-right py-3 px-4 text-sm font-medium text-gray-600'>
                    Amount
                  </th>
                  <th className='text-center py-3 px-4 text-sm font-medium text-gray-600'>
                    Status
                  </th>
                  <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {payoutRequests.map((request) => (
                  <tr key={request.id} className='border-b'>
                    <td className='py-3 px-4 text-sm'>
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </td>
                    <td className='py-3 px-4 text-sm text-right font-medium'>
                      ${request.amount.toFixed(2)}
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'paid' ? 'bg-green-100 text-green-800' :
                        request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
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
