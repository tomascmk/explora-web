'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery, useMutation } from '@apollo/client/react'
import { MY_BALANCE } from '@/graphql/balance'
import { UPDATE_STRIPE_ACCOUNT } from '@/graphql/settings'
import { CreditCard, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { PageHeader } from '@/components/ui/PageHeader'

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
      <div className='animate-pulse'>
        <div className='h-8 rounded w-1/4 mb-6' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
        <div className='space-y-6'>
          <div className='h-48 rounded-lg' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
          <div className='h-48 rounded-lg' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title='Payment Settings' />

      <div className='max-w-4xl space-y-6'>
        {/* Stripe Connect */}
        <div
          className='rounded-xl border p-6'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-4'>
              <div className='p-3 rounded-lg' style={{ backgroundColor: 'var(--color-info-light)' }}>
                <CreditCard className='w-8 h-8' style={{ color: 'var(--color-info)' }} />
              </div>
              <div>
                <h2 className='text-xl font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>Stripe Connect</h2>
                <p className='mb-4' style={{ color: 'var(--color-text-body)' }}>
                  Connect your Stripe account to receive payments from customers worldwide.
                </p>
                {stripeConnected ? (
                  <div className='flex items-center gap-2' style={{ color: 'var(--color-success)' }}>
                    <div className='w-2 h-2 rounded-full' style={{ backgroundColor: 'var(--color-success)' }}></div>
                    <span className='font-medium'>Connected</span>
                    <span className='text-sm ml-2' style={{ color: 'var(--color-text-muted)' }}>
                      ({balance?.stripeAccountId?.slice(0, 16)}...)
                    </span>
                  </div>
                ) : (
                  <div className='flex items-center gap-2' style={{ color: 'var(--color-text-muted)' }}>
                    <div className='w-2 h-2 rounded-full' style={{ backgroundColor: 'var(--color-text-muted)' }}></div>
                    <span>Not connected</span>
                  </div>
                )}
              </div>
            </div>

            {stripeConnected && (
              <button
                onClick={() => setShowDisconnectModal(true)}
                className='px-4 py-2 border rounded-lg hover:opacity-80 text-sm'
                style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
              >
                Disconnect
              </button>
            )}
          </div>

          {!stripeConnected && (
            <div className='mt-6 pt-4 border-t' style={{ borderColor: 'var(--color-card-border)' }}>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Stripe Account ID</label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={newStripeId}
                  onChange={(e) => setNewStripeId(e.target.value)}
                  placeholder='acct_...'
                  className='flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                  style={{ borderColor: 'var(--color-card-border)' }}
                />
                <button
                  onClick={handleConnectStripe}
                  disabled={updatingStripe || !newStripeId.trim()}
                  className='px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2'
                  style={{ backgroundColor: 'var(--color-primary)' }}
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
            <div className='mt-6 pt-6 border-t' style={{ borderColor: 'var(--color-card-border)' }}>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div>
                  <p className='text-sm' style={{ color: 'var(--color-text-body)' }}>Available Balance</p>
                  <p className='text-2xl font-bold' style={{ color: 'var(--color-success)' }}>
                    ${balance.availableBalance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className='text-sm' style={{ color: 'var(--color-text-body)' }}>Pending</p>
                  <p className='text-2xl font-bold' style={{ color: 'var(--color-warning)' }}>
                    ${balance.pendingBalance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className='text-sm' style={{ color: 'var(--color-text-body)' }}>Total Earned</p>
                  <p className='text-2xl font-bold' style={{ color: 'var(--color-primary)' }}>
                    ${balance.totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MercadoPago */}
        <div
          className='rounded-xl border p-6'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <div className='flex items-start gap-4'>
            <div className='p-3 rounded-lg' style={{ backgroundColor: 'var(--color-primary-light)' }}>
              <DollarSign className='w-8 h-8' style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h2 className='text-xl font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>MercadoPago</h2>
              <p className='mb-4' style={{ color: 'var(--color-text-body)' }}>
                Accept payments from customers in Latin America through MercadoPago.
              </p>
              <div
                className='rounded-lg border p-4'
                style={{ backgroundColor: 'var(--color-info-light)', borderColor: 'var(--color-info)' }}
              >
                <p className='text-sm' style={{ color: 'var(--color-info)' }}>
                  MercadoPago is configured at the platform level. Contact the admin team to
                  set up or modify your MercadoPago integration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Summary */}
        {balance && (
          <div
            className='rounded-xl border p-6'
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <h2 className='text-xl font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>Balance Summary</h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='p-4 rounded-lg' style={{ backgroundColor: 'var(--color-success-light)' }}>
                <p className='text-xs font-medium' style={{ color: 'var(--color-success)' }}>Available</p>
                <p className='text-xl font-bold' style={{ color: 'var(--color-success)' }}>
                  ${balance.availableBalance.toFixed(2)}
                </p>
              </div>
              <div className='p-4 rounded-lg' style={{ backgroundColor: 'var(--color-warning-light)' }}>
                <p className='text-xs font-medium' style={{ color: 'var(--color-warning)' }}>Pending</p>
                <p className='text-xl font-bold' style={{ color: 'var(--color-warning)' }}>
                  ${balance.pendingBalance.toFixed(2)}
                </p>
              </div>
              <div className='p-4 rounded-lg' style={{ backgroundColor: 'var(--color-primary-light)' }}>
                <p className='text-xs font-medium' style={{ color: 'var(--color-primary)' }}>Total Earned</p>
                <p className='text-xl font-bold' style={{ color: 'var(--color-primary)' }}>
                  ${balance.totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className='p-4 rounded-lg' style={{ backgroundColor: 'var(--color-section-bg)' }}>
                <p className='text-xs font-medium' style={{ color: 'var(--color-text-secondary)' }}>Total Payouts</p>
                <p className='text-xl font-bold' style={{ color: 'var(--color-text-heading)' }}>
                  ${balance.totalPayouts.toFixed(2)}
                </p>
              </div>
            </div>
            <p className='text-xs mt-3' style={{ color: 'var(--color-text-muted)' }}>
              For payout requests, go to{' '}
              <a href='/balance' className='hover:underline' style={{ color: 'var(--color-primary)' }}>
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
