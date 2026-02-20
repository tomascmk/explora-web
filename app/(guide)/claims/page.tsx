'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { CLAIMS_BY_GUIDE, RESOLVE_CLAIM, REJECT_CLAIM } from '@/graphql/claims'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterButton } from '@/components/ui/FilterButton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { toast } from 'sonner'

interface Claim {
  id: string
  reason: string
  status: string
  resolution?: string
  refundAmount?: number
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  claimant: {
    id: string
    username: string
    fullName?: string
    email: string
  }
  reservation: {
    id: string
    total_amount: number
    tour: {
      id: string
      title: string
    }
  }
}

export default function ClaimsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'>('all')
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [rejectingClaim, setRejectingClaim] = useState<Claim | null>(null)

  const { data, loading, refetch } = useQuery<{ claimsByGuide: Claim[] }>(CLAIMS_BY_GUIDE, {
    variables: { guideId: user?.id },
    skip: !user
  })

  const [resolveClaimMutation, { loading: resolving }] = useMutation(RESOLVE_CLAIM, {
    onCompleted: () => {
      refetch()
      setSelectedClaim(null)
      toast.success('Claim resolved successfully')
    },
    onError: (error) => {
      console.error('Error resolving claim:', error)
      toast.error('Failed to resolve claim')
    }
  })

  const [rejectClaimMutation, { loading: rejecting }] = useMutation(REJECT_CLAIM, {
    onCompleted: () => {
      refetch()
      setRejectingClaim(null)
      toast.success('Claim rejected')
    },
    onError: (error) => {
      console.error('Error rejecting claim:', error)
      toast.error('Failed to reject claim')
    }
  })

  const claims = data?.claimsByGuide || []

  const handleResolve = async (claimId: string, resolution: string, refundAmount?: number) => {
    try {
      await resolveClaimMutation({
        variables: {
          id: claimId,
          resolution,
          resolvedById: user?.id,
          refundAmount: refundAmount || undefined
        }
      })
    } catch (error) {
      // Handled by onError
    }
  }

  const handleReject = async (claimId: string, reason: string) => {
    try {
      await rejectClaimMutation({
        variables: {
          id: claimId,
          reason,
          rejectedById: user?.id
        }
      })
    } catch (error) {
      // Handled by onError
    }
  }

  const filteredClaims =
    filter === 'all' ? claims : claims.filter((c) => c.status === filter)

  const openClaims = claims.filter((c) => c.status === 'OPEN').length
  const inProgressClaims = claims.filter((c) => c.status === 'IN_PROGRESS').length

  return (
    <div>
      <PageHeader
        title='Claims & Issues'
        actions={
          <div className='flex gap-2'>
            {inProgressClaims > 0 && (
              <StatusBadge status='IN_PROGRESS' className='px-4 py-2 text-sm' />
            )}
            {openClaims > 0 && (
              <StatusBadge status='OPEN' className='px-4 py-2 text-sm' />
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6'>
        <div
          className='rounded-xl border p-4'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Total</p>
          <p className='text-2xl font-bold' style={{ color: 'var(--color-text-heading)' }}>{claims.length}</p>
        </div>
        <div
          className='rounded-xl border p-4'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Open</p>
          <p className='text-2xl font-bold' style={{ color: 'var(--color-danger)' }}>{openClaims}</p>
        </div>
        <div
          className='rounded-xl border p-4'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>In Progress</p>
          <p className='text-2xl font-bold' style={{ color: 'var(--color-warning)' }}>{inProgressClaims}</p>
        </div>
        <div
          className='rounded-xl border p-4'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Resolved</p>
          <p className='text-2xl font-bold' style={{ color: 'var(--color-success)' }}>
            {claims.filter((c) => c.status === 'RESOLVED').length}
          </p>
        </div>
        <div
          className='rounded-xl border p-4'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Rejected</p>
          <p className='text-2xl font-bold' style={{ color: 'var(--color-text-secondary)' }}>
            {claims.filter((c) => c.status === 'REJECTED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-6 flex-wrap'>
        {(['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'] as const).map((f) => (
          <FilterButton key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Claims' : f === 'IN_PROGRESS' ? 'In Progress' : f.charAt(0) + f.slice(1).toLowerCase()}
          </FilterButton>
        ))}
      </div>

      {/* Claims List */}
      {loading ? (
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-40 rounded-xl animate-pulse' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
          ))}
        </div>
      ) : filteredClaims.length === 0 ? (
        <div
          className='rounded-xl border p-12 text-center'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <p style={{ color: 'var(--color-text-muted)' }}>No claims found</p>
          {filter === 'OPEN' && (
            <p className='text-sm mt-2' style={{ color: 'var(--color-success)' }}>Great! No open issues.</p>
          )}
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredClaims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onResolve={() => setSelectedClaim(claim)}
              onReject={() => setRejectingClaim(claim)}
            />
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedClaim && (
        <ResolutionModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onResolve={handleResolve}
          loading={resolving}
        />
      )}

      {/* Rejection Modal */}
      {rejectingClaim && (
        <RejectionModal
          claim={rejectingClaim}
          onClose={() => setRejectingClaim(null)}
          onReject={handleReject}
          loading={rejecting}
        />
      )}
    </div>
  )
}

function ClaimCard({
  claim,
  onResolve,
  onReject
}: {
  claim: Claim
  onResolve: () => void
  onReject: () => void
}) {
  const claimantName = claim.claimant.fullName || claim.claimant.username

  return (
    <div
      className='rounded-xl border p-6'
      style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
    >
      <div className='flex justify-between items-start mb-4'>
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-2'>
            <h3 className='font-semibold text-lg' style={{ color: 'var(--color-text-heading)' }}>Claim #{claim.id.slice(-6)}</h3>
            <StatusBadge status={claim.status} />
          </div>
          <div className='flex items-center gap-4 text-sm' style={{ color: 'var(--color-text-muted)' }}>
            <span>Filed: {format(new Date(claim.createdAt), 'MMM d, yyyy')}</span>
            {claim.resolvedAt && (
              <span>Resolved: {format(new Date(claim.resolvedAt), 'MMM d, yyyy')}</span>
            )}
          </div>
        </div>
        {(claim.status === 'OPEN' || claim.status === 'IN_PROGRESS') && (
          <div className='flex gap-2'>
            <button
              onClick={onResolve}
              className='text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition'
              style={{ backgroundColor: 'var(--color-success)' }}
            >
              Resolve
            </button>
            <button
              onClick={onReject}
              className='border px-4 py-2 rounded-lg text-sm hover:opacity-80 transition'
              style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Claimant & Tour Info */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        <div className='rounded-lg p-3' style={{ backgroundColor: 'var(--color-section-bg)' }}>
          <p className='text-xs font-medium uppercase mb-1' style={{ color: 'var(--color-text-muted)' }}>Claimant</p>
          <p className='text-sm font-medium' style={{ color: 'var(--color-text-heading)' }}>{claimantName}</p>
          <p className='text-xs' style={{ color: 'var(--color-text-muted)' }}>{claim.claimant.email}</p>
        </div>
        <div className='rounded-lg p-3' style={{ backgroundColor: 'var(--color-section-bg)' }}>
          <p className='text-xs font-medium uppercase mb-1' style={{ color: 'var(--color-text-muted)' }}>Tour</p>
          <p className='text-sm font-medium' style={{ color: 'var(--color-text-heading)' }}>{claim.reservation.tour.title}</p>
          <p className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
            Reservation amount: ${claim.reservation.total_amount}
          </p>
        </div>
      </div>

      {/* Reason */}
      <div className='rounded-lg p-4 mb-4' style={{ backgroundColor: 'var(--color-section-bg)' }}>
        <p className='text-sm font-medium mb-1' style={{ color: 'var(--color-text-body)' }}>Reason:</p>
        <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>{claim.reason}</p>
      </div>

      {/* Resolution */}
      {claim.resolution && (
        <div className='rounded-lg p-4 mb-4' style={{ backgroundColor: 'var(--color-success-light)' }}>
          <p className='text-sm font-medium mb-1' style={{ color: 'var(--color-success)' }}>Resolution:</p>
          <p className='text-sm' style={{ color: 'var(--color-success)' }}>{claim.resolution}</p>
        </div>
      )}

      {/* Refund Amount */}
      {claim.refundAmount != null && claim.refundAmount > 0 && (
        <div className='flex items-center gap-2 mt-2'>
          <span className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Refund issued:</span>
          <span className='text-sm font-bold' style={{ color: 'var(--color-success)' }}>${claim.refundAmount.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}

function ResolutionModal({
  claim,
  onClose,
  onResolve,
  loading
}: {
  claim: Claim
  onClose: () => void
  onResolve: (id: string, resolution: string, refundAmount?: number) => void
  loading: boolean
}) {
  const [resolution, setResolution] = useState('')
  const [includeRefund, setIncludeRefund] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')

  const maxRefund = claim.reservation.total_amount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (includeRefund && refundAmount) {
      const amount = parseFloat(refundAmount)
      if (amount > maxRefund) {
        toast.error(`Refund cannot exceed reservation amount ($${maxRefund})`)
        return
      }
      onResolve(claim.id, resolution, amount)
    } else {
      onResolve(claim.id, resolution)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div
        className='rounded-xl p-8 max-w-lg w-full'
        style={{ backgroundColor: 'var(--color-card-bg)' }}
      >
        <h2 className='text-2xl font-bold mb-2' style={{ color: 'var(--color-text-heading)' }}>Resolve Claim</h2>
        <p className='text-sm mb-6' style={{ color: 'var(--color-text-muted)' }}>
          Claim from {claim.claimant.fullName || claim.claimant.username} for &quot;{claim.reservation.tour.title}&quot;
        </p>

        <div className='rounded-lg p-4 mb-6' style={{ backgroundColor: 'var(--color-section-bg)' }}>
          <p className='text-sm font-medium mb-1' style={{ color: 'var(--color-text-secondary)' }}>Claim Reason:</p>
          <p className='text-sm' style={{ color: 'var(--color-text-body)' }}>{claim.reason}</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Your Resolution *</label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
              style={{ borderColor: 'var(--color-card-border)' }}
              rows={4}
              placeholder='Explain how you resolved this issue...'
              required
            />
          </div>

          <div>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={includeRefund}
                onChange={(e) => setIncludeRefund(e.target.checked)}
                className='rounded'
              />
              <span className='text-sm font-medium' style={{ color: 'var(--color-text-body)' }}>Include refund</span>
            </label>
          </div>

          {includeRefund && (
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
                Refund Amount (max ${maxRefund})
              </label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: 'var(--color-text-muted)' }}>$</span>
                <input
                  type='number'
                  min='0'
                  max={maxRefund}
                  step='0.01'
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className='w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                  style={{ borderColor: 'var(--color-card-border)' }}
                  placeholder='0.00'
                  required={includeRefund}
                />
              </div>
              <button
                type='button'
                onClick={() => setRefundAmount(maxRefund.toString())}
                className='text-xs mt-1 hover:underline'
                style={{ color: 'var(--color-primary)' }}
              >
                Full refund (${maxRefund})
              </button>
            </div>
          )}

          <div className='flex gap-2 pt-4'>
            <button
              type='button'
              onClick={onClose}
              disabled={loading}
              className='flex-1 px-4 py-2 border rounded-lg hover:opacity-80 disabled:opacity-50 transition'
              style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition'
              style={{ backgroundColor: 'var(--color-success)' }}
            >
              {loading && (
                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              )}
              Resolve Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RejectionModal({
  claim,
  onClose,
  onReject,
  loading
}: {
  claim: Claim
  onClose: () => void
  onReject: (id: string, reason: string) => void
  loading: boolean
}) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onReject(claim.id, reason)
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div
        className='rounded-xl p-8 max-w-lg w-full'
        style={{ backgroundColor: 'var(--color-card-bg)' }}
      >
        <h2 className='text-2xl font-bold mb-2' style={{ color: 'var(--color-text-heading)' }}>Reject Claim</h2>
        <p className='text-sm mb-6' style={{ color: 'var(--color-text-muted)' }}>
          Claim from {claim.claimant.fullName || claim.claimant.username} for &quot;{claim.reservation.tour.title}&quot;
        </p>

        <div className='rounded-lg p-4 mb-6' style={{ backgroundColor: 'var(--color-section-bg)' }}>
          <p className='text-sm font-medium mb-1' style={{ color: 'var(--color-text-secondary)' }}>Claim Reason:</p>
          <p className='text-sm' style={{ color: 'var(--color-text-body)' }}>{claim.reason}</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Rejection Reason *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none'
              style={{ borderColor: 'var(--color-card-border)' }}
              rows={4}
              placeholder='Explain why this claim is being rejected...'
              required
            />
          </div>

          <div className='flex gap-2 pt-4'>
            <button
              type='button'
              onClick={onClose}
              disabled={loading}
              className='flex-1 px-4 py-2 border rounded-lg hover:opacity-80 disabled:opacity-50 transition'
              style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition'
              style={{ backgroundColor: 'var(--color-danger)' }}
            >
              {loading && (
                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              )}
              Reject Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
