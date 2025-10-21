'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

interface Balance {
  availableBalance: number
  pendingBalance: number
  totalEarnings: number
  totalPayouts: number
}

export default function BalancePage() {
  const { user } = useAuth()
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBalance()
    }
  }, [user])

  const fetchBalance = async () => {
    try {
      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            query GetBalance($guideId: String!) {
              myBalance(guideId: $guideId) {
                availableBalance
                pendingBalance
                totalEarnings
                totalPayouts
              }
            }
          `,
          variables: { guideId: user?.id }
        })
      })

      const { data } = await response.json()
      if (data?.myBalance) {
        setBalance(data.myBalance)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestPayout = async () => {
    // TODO: Implement payout request
    alert('Payout request functionality coming soon')
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
        <button
          onClick={requestPayout}
          className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition'
          disabled={!balance || balance.availableBalance <= 0}
        >
          Request Payout
        </button>
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

      {/* Earnings History */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold mb-4'>Earnings History</h2>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>
                  Date
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>
                  Tour
                </th>
                <th className='text-left py-3 px-4 text-sm font-medium text-gray-600'>
                  Type
                </th>
                <th className='text-right py-3 px-4 text-sm font-medium text-gray-600'>
                  Amount
                </th>
                <th className='text-center py-3 px-4 text-sm font-medium text-gray-600'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'>
                <td className='py-3 px-4 text-sm'>Oct 20, 2025</td>
                <td className='py-3 px-4 text-sm'>Historic City Tour</td>
                <td className='py-3 px-4 text-sm'>In-Person</td>
                <td className='py-3 px-4 text-sm text-right font-medium'>
                  $125.00
                </td>
                <td className='py-3 px-4 text-center'>
                  <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                    Cleared
                  </span>
                </td>
              </tr>
              <tr className='border-b'>
                <td className='py-3 px-4 text-sm'>Oct 19, 2025</td>
                <td className='py-3 px-4 text-sm'>Food Tour</td>
                <td className='py-3 px-4 text-sm'>In-Person</td>
                <td className='py-3 px-4 text-sm text-right font-medium'>
                  $95.00
                </td>
                <td className='py-3 px-4 text-center'>
                  <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs'>
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
