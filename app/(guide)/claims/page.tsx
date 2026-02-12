'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { CLAIMS_BY_GUIDE, RESOLVE_CLAIM } from '@/graphql/claims'

interface Claim {
  id: string
  type: string
  description: string
  status: string
  resolution?: string
  createdAt: string
  updatedAt: string
}

export default function ClaimsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<
    'all' | 'OPEN' | 'RESOLVED' | 'REJECTED'
  >('all')
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)

  const { data, loading, refetch } = useQuery<{ claimsByGuide: Claim[] }>(CLAIMS_BY_GUIDE, {
    skip: !user
  })

  const [resolveClaimMutation] = useMutation(RESOLVE_CLAIM, {
    onCompleted: () => {
      refetch()
      setSelectedClaim(null)
    }
  })

  const claims = data?.claimsByGuide || []

  const handleResolve = async (
    claimId: string,
    resolution: string
  ) => {
    try {
      await resolveClaimMutation({
        variables: {
          id: claimId,
          resolution
        }
      })
      alert('Claim resolved successfully')
    } catch (error) {
      console.error('Error resolving claim:', error)
      alert('Failed to resolve claim')
    }
  }

  const filteredClaims =
    filter === 'all' ? claims : claims.filter((c) => c.status === filter)

  const openClaims = claims.filter((c) => c.status === 'OPEN').length

  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>Claims & Issues</h1>
        {openClaims > 0 && (
          <span className='bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium'>
            {openClaims} Open Claim{openClaims !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-6'>
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All Claims
        </FilterButton>
        <FilterButton
          active={filter === 'OPEN'}
          onClick={() => setFilter('OPEN')}
        >
          Open
        </FilterButton>
        <FilterButton
          active={filter === 'RESOLVED'}
          onClick={() => setFilter('RESOLVED')}
        >
          Resolved
        </FilterButton>
        <FilterButton
          active={filter === 'REJECTED'}
          onClick={() => setFilter('REJECTED')}
        >
          Rejected
        </FilterButton>
      </div>

      {/* Claims List */}
      {loading ? (
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='h-32 bg-gray-200 rounded-lg animate-pulse'
            ></div>
          ))}
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-12 text-center'>
          <p className='text-gray-500'>No claims found</p>
          {filter === 'OPEN' && (
            <p className='text-sm text-green-600 mt-2'>
              Great! No open issues.
            </p>
          )}
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredClaims.map((claim) => (
            <div key={claim.id} className='bg-white rounded-lg shadow p-6'>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='font-semibold'>
                      {claim.type}
                    </h3>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className='text-xs text-gray-400'>
                    Filed: {format(new Date(claim.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                {claim.status === 'OPEN' && (
                  <button
                    onClick={() => setSelectedClaim(claim)}
                    className='bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700'
                  >
                    Resolve
                  </button>
                )}
              </div>

              <div className='bg-gray-50 rounded p-4 mb-4'>
                <p className='text-sm font-medium text-gray-700 mb-1'>
                  Description:
                </p>
                <p className='text-sm text-gray-600'>{claim.description}</p>
              </div>

              {claim.resolution && (
                <div className='bg-green-50 rounded p-4'>
                  <p className='text-sm font-medium text-green-700 mb-1'>
                    Resolution:
                  </p>
                  <p className='text-sm text-green-600'>{claim.resolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedClaim && (
        <ResolutionModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onResolve={handleResolve}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    OPEN: 'bg-red-100 text-red-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-gray-100 text-gray-800'
  }

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[status as keyof typeof colors]
      }`}
    >
      {status}
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
  onResolve
}: {
  claim: Claim
  onClose: () => void
  onResolve: (id: string, resolution: string) => void
}) {
  const [resolution, setResolution] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onResolve(claim.id, resolution)
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-8 max-w-lg w-full'>
        <h2 className='text-2xl font-bold mb-6'>Resolve Claim</h2>

        <div className='bg-gray-50 rounded p-4 mb-6'>
          <p className='text-sm text-gray-600 mb-2'>Claim Description:</p>
          <p className='text-sm'>{claim.description}</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>
              Your Resolution *
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className='w-full px-4 py-3 border rounded focus:ring-2 focus:ring-blue-500'
              rows={4}
              placeholder='Explain how you resolved this issue...'
              required
            />
          </div>

          <div className='flex gap-2 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 border rounded hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
            >
              Resolve Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
