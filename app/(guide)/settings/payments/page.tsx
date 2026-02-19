'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery, useMutation } from '@apollo/client/react'
import { MY_BALANCE } from '@/graphql/balance'
import { UPDATE_STRIPE_ACCOUNT } from '@/graphql/settings'
import { CreditCard, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface Balance {
  id: string
  availableBalance: number
  pendingBalance: number
  totalEarnings: number
  totalPayouts: number
  stripeAccountId?: string
}

export default function PaymentSettingsPage() {
  const { user } = useAuth()
  const [newStripeId, setNewStripeId] = useState('')
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)

  const { data, loading, refetch } = useQuery<{ myBalance: Balance }>(MY_BALANCE, {
    skip: !user
  })

  const [updateStripe, { loading: updatingStripe }] = useMutation(UPDATE_STRIPE_ACCOUNT, {
    onCompleted: () => {
      toast.success('Stripe account updated successfully')
      setNewStripeId('')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update Stripe account')
    }
  })

  const balance = data?.myBalance
  const stripeConnected = !!balance?.stripeAccountId

  const handleConnectStripe = async () => {
    if (!user || !newStripeId.trim()) {
      toast.error('Please enter a Stripe Account ID')
      return
    }

    try {
      await updateStripe({
        variables: {
          guideId: user.id,
          stripeAccountId: newStripeId.trim()
        }
      })
    } catch {
      // Handled by onError
    }
  }

  const handleDisconnectStripe = async () => {
    if (!user) return

    try {
      await updateStripe({
        variables: {
          guideId: user.id,
          stripeAccountId: ''
        }
      })
      setShowDisconnectModal(false)
    } catch {
      // Handled by onError
    }
  }

  if (loading) {
    return (
      <div className='p-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
          <div className='space-y-6'>
            <div className='h-48 bg-gray-200 rounded-lg'></div>
            <div className='h-48 bg-gray-200 rounded-lg'></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold mb-6'>Payment Settings</h1>

      <div className='max-w-4xl space-y-6'>
        {/* Stripe Connect */}
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-4'>
              <div className='p-3 bg-purple-50 rounded-lg'>
                <CreditCard className='w-8 h-8 text-purple-600' />
              </div>
              <div>
                <h2 className='text-xl font-semibold mb-2'>Stripe Connect</h2>
                <p className='text-gray-600 mb-4'>
                  Connect your Stripe account to receive payments from customers worldwide.
                </p>
                {stripeConnected ? (
                  <div className='flex items-center gap-2 text-green-600'>
                    <div className='w-2 h-2 bg-green-600 rounded-full'></div>
                    <span className='font-medium'>Connected</span>
                    <span className='text-sm text-gray-500 ml-2'>
                      ({balance?.stripeAccountId?.slice(0, 16)}...)
                    </span>
                  </div>
                ) : (
                  <div className='flex items-center gap-2 text-gray-500'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full'></div>
                    <span>Not connected</span>
                  </div>
                )}
              </div>
            </div>

            {stripeConnected && (
              <button
                onClick={() => setShowDisconnectModal(true)}
                className='px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm'
              >
                Disconnect
              </button>
            )}
          </div>

          {!stripeConnected && (
            <div className='mt-6 pt-4 border-t'>
              <label className='block text-sm font-medium mb-2'>Stripe Account ID</label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={newStripeId}
                  onChange={(e) => setNewStripeId(e.target.value)}
                  placeholder='acct_...'
                  className='flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none'
                />
                <button
                  onClick={handleConnectStripe}
                  disabled={updatingStripe || !newStripeId.trim()}
                  className='px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2'
                >
                  {updatingStripe && (
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  )}
                  Connect
                </button>
              </div>
            </div>
          )}

          {stripeConnected && balance && (
            <div className='mt-6 pt-6 border-t'>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Available Balance</p>
                  <p className='text-2xl font-bold text-green-600'>
                    ${balance.availableBalance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Pending</p>
                  <p className='text-2xl font-bold text-yellow-600'>
                    ${balance.pendingBalance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Total Earned</p>
                  <p className='text-2xl font-bold text-blue-600'>
                    ${balance.totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MercadoPago */}
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-start gap-4'>
            <div className='p-3 bg-blue-50 rounded-lg'>
              <DollarSign className='w-8 h-8 text-blue-600' />
            </div>
            <div>
              <h2 className='text-xl font-semibold mb-2'>MercadoPago</h2>
              <p className='text-gray-600 mb-4'>
                Accept payments from customers in Latin America through MercadoPago.
              </p>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <p className='text-sm text-blue-800'>
                  MercadoPago is configured at the platform level. Contact the admin team to
                  set up or modify your MercadoPago integration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Summary */}
        {balance && (
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold mb-4'>Balance Summary</h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='p-4 bg-green-50 rounded-lg'>
                <p className='text-xs text-green-600 font-medium'>Available</p>
                <p className='text-xl font-bold text-green-700'>
                  ${balance.availableBalance.toFixed(2)}
                </p>
              </div>
              <div className='p-4 bg-yellow-50 rounded-lg'>
                <p className='text-xs text-yellow-600 font-medium'>Pending</p>
                <p className='text-xl font-bold text-yellow-700'>
                  ${balance.pendingBalance.toFixed(2)}
                </p>
              </div>
              <div className='p-4 bg-blue-50 rounded-lg'>
                <p className='text-xs text-blue-600 font-medium'>Total Earned</p>
                <p className='text-xl font-bold text-blue-700'>
                  ${balance.totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className='p-4 bg-gray-50 rounded-lg'>
                <p className='text-xs text-gray-600 font-medium'>Total Payouts</p>
                <p className='text-xl font-bold text-gray-700'>
                  ${balance.totalPayouts.toFixed(2)}
                </p>
              </div>
            </div>
            <p className='text-xs text-gray-400 mt-3'>
              For payout requests, go to{' '}
              <a href='/balance' className='text-blue-600 hover:underline'>
                Balance & Earnings
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Disconnect Stripe Modal */}
      <ConfirmModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={handleDisconnectStripe}
        title='Disconnect Stripe Account'
        description='Are you sure you want to disconnect your Stripe account? You will not be able to receive payouts until you reconnect.'
        confirmText='Disconnect'
        variant='danger'
        loading={updatingStripe}
      />
    </div>
  )
}
