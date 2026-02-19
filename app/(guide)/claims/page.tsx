'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { CLAIMS_BY_GUIDE, RESOLVE_CLAIM, REJECT_CLAIM } from '@/graphql/claims'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
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
    <div className='p-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>Claims & Issues</h1>
        <div className='flex gap-2'>
          {inProgressClaims > 0 && (
            <span className='bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium text-sm'>
              {inProgressClaims} In Progress
            </span>
          )}
          {openClaims > 0 && (
            <span className='bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium text-sm'>
              {openClaims} Open
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-8'>
        <div className='bg-white rounded-lg shadow p-4'>
          <p className='text-sm text-gray-600'>Total</p>
          <p className='text-2xl font-bold'>{claims.length}</p>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <p className='text-sm text-gray-600'>Open</p>
          <p className='text-2xl font-bold text-red-600'>{openClaims}</p>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <p className='text-sm text-gray-600'>In Progress</p>
          <p className='text-2xl font-bold text-yellow-600'>{inProgressClaims}</p>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <p className='text-sm text-gray-600'>Resolved</p>
          <p className='text-2xl font-bold text-green-600'>
            {claims.filter((c) => c.status === 'RESOLVED').length}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <p className='text-sm text-gray-600'>Rejected</p>
          <p className='text-2xl font-bold text-gray-600'>
            {claims.filter((c) => c.status === 'REJECTED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-6'>
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
            <div key={i} className='h-40 bg-gray-200 rounded-lg animate-pulse'></div>
          ))}
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-12 text-center'>
          <p className='text-gray-500'>No claims found</p>
          {filter === 'OPEN' && (
            <p className='text-sm text-green-600 mt-2'>Great! No open issues.</p>
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
    <div className='bg-white rounded-lg shadow p-6'>
      <div className='flex justify-between items-start mb-4'>
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-2'>
            <h3 className='font-semibold text-lg'>Claim #{claim.id.slice(-6)}</h3>
            <StatusBadge status={claim.status} />
          </div>
          <div className='flex items-center gap-4 text-sm text-gray-500'>
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
              className='bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition'
            >
              Resolve
            </button>
            <button
              onClick={onReject}
              className='border border-red-300 text-red-600 px-4 py-2 rounded text-sm hover:bg-red-50 transition'
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Claimant & Tour Info */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        <div className='bg-gray-50 rounded p-3'>
          <p className='text-xs font-medium text-gray-500 uppercase mb-1'>Claimant</p>
          <p className='text-sm font-medium'>{claimantName}</p>
          <p className='text-xs text-gray-500'>{claim.claimant.email}</p>
        </div>
        <div className='bg-gray-50 rounded p-3'>
          <p className='text-xs font-medium text-gray-500 uppercase mb-1'>Tour</p>
          <p className='text-sm font-medium'>{claim.reservation.tour.title}</p>
          <p className='text-xs text-gray-500'>
            Reservation amount: ${claim.reservation.total_amount}
          </p>
        </div>
      </div>

      {/* Reason */}
      <div className='bg-gray-50 rounded p-4 mb-4'>
        <p className='text-sm font-medium text-gray-700 mb-1'>Reason:</p>
        <p className='text-sm text-gray-600'>{claim.reason}</p>
      </div>

      {/* Resolution */}
      {claim.resolution && (
        <div className='bg-green-50 rounded p-4 mb-4'>
          <p className='text-sm font-medium text-green-700 mb-1'>Resolution:</p>
          <p className='text-sm text-green-600'>{claim.resolution}</p>
        </div>
      )}

      {/* Refund Amount */}
      {claim.refundAmount != null && claim.refundAmount > 0 && (
        <div className='flex items-center gap-2 mt-2'>
          <span className='text-sm text-gray-600'>Refund issued:</span>
          <span className='text-sm font-bold text-green-700'>${claim.refundAmount.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-gray-100 text-gray-800'
  }

  const labels: Record<string, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    REJECTED: 'Rejected'
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  )
}

function FilterButton({
  children,
  active,
  onClick
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-medium text-sm transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50 border'
      }`}
    >
      {children}
    </button>
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
      <div className='bg-white rounded-lg p-8 max-w-lg w-full'>
        <h2 className='text-2xl font-bold mb-2'>Resolve Claim</h2>
        <p className='text-sm text-gray-500 mb-6'>
          Claim from {claim.claimant.fullName || claim.claimant.username} for &quot;{claim.reservation.tour.title}&quot;
        </p>

        <div className='bg-gray-50 rounded p-4 mb-6'>
          <p className='text-sm text-gray-600 mb-1 font-medium'>Claim Reason:</p>
          <p className='text-sm'>{claim.reason}</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Your Resolution *</label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className='w-full px-4 py-3 border rounded focus:ring-2 focus:ring-blue-500'
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
              <span className='text-sm font-medium'>Include refund</span>
            </label>
          </div>

          {includeRefund && (
            <div>
              <label className='block text-sm font-medium mb-2'>
                Refund Amount (max ${maxRefund})
              </label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>$</span>
                <input
                  type='number'
                  min='0'
                  max={maxRefund}
                  step='0.01'
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className='w-full pl-8 pr-4 py-2 border rounded focus:ring-2 focus:ring-blue-500'
                  placeholder='0.00'
                  required={includeRefund}
                />
              </div>
              <button
                type='button'
                onClick={() => setRefundAmount(maxRefund.toString())}
                className='text-xs text-blue-600 mt-1 hover:underline'
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
              className='flex-1 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2'
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
      <div className='bg-white rounded-lg p-8 max-w-lg w-full'>
        <h2 className='text-2xl font-bold mb-2'>Reject Claim</h2>
        <p className='text-sm text-gray-500 mb-6'>
          Claim from {claim.claimant.fullName || claim.claimant.username} for &quot;{claim.reservation.tour.title}&quot;
        </p>

        <div className='bg-gray-50 rounded p-4 mb-6'>
          <p className='text-sm text-gray-600 mb-1 font-medium'>Claim Reason:</p>
          <p className='text-sm'>{claim.reason}</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Rejection Reason *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='w-full px-4 py-3 border rounded focus:ring-2 focus:ring-red-500'
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
              className='flex-1 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2'
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
