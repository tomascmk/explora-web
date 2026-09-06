'use client'

import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  GET_TOURS_BY_GUIDE,
  GET_TOUR_BY_ID,
  DELETE_TOUR,
  CREATE_TOUR,
  CREATE_TOUR_STEP,
  CREATE_TOUR_PRICING,
  CREATE_TOUR_SCHEDULE,
} from '@/graphql/tours'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterButton } from '@/components/ui/FilterButton'
import { getDisplayError } from '@/utils/errorMessages'
import { Plus, X, Calendar, Clock, MapPin, Copy } from 'lucide-react'
import { formatMoney } from '@/lib/formatMoney';

interface TourSchedule {
  id: string
  startTime: string
  endTime?: string
  isAvailable: boolean
  maxCapacity?: number
  specialInfo?: string
}

interface Tour {
  id: string
  title: string
  description: string
  status: string
  tourType: string
  isCustom?: boolean
  isFreeWalkingTour?: boolean
  createdAt: string
  media?: Array<{ url: string }>
  categories?: Array<{ name: string }>
  tourSteps?: Array<{ id: string }>
  tourPricings?: Array<{ price: number; currency: string; maxParticipants: number }>
  tourSchedules?: TourSchedule[]
}

interface GetToursByGuideData {
  toursByGuide: Tour[]
}

interface GetToursByGuideVars {
  guideId: string | undefined
}

export default function ToursPage() {
  const { user } = useAuth()
  const router = useRouter()
  const client = useApolloClient()
  const [filter, setFilter] = useState('all')

  const { data, loading } = useQuery<GetToursByGuideData, GetToursByGuideVars>(GET_TOURS_BY_GUIDE, {
    variables: { guideId: user?.id },
    skip: !user?.id,
  })

  const [deleteTour, { loading: deleting }] = useMutation(DELETE_TOUR, {
    update: (cache, _result, options) => {
      const id = options?.variables?.id
      if (!id) return
      const cacheId = cache.identify({ __typename: 'Tour', id })
      if (cacheId) {
        cache.evict({ id: cacheId })
        cache.gc()
      }
    },
    onCompleted: () => {
      toast.success('Tour deleted successfully')
    },
    onError: (error) => {
      toast.error(getDisplayError(error))
    }
  })

  const [createTourSchedule] = useMutation(CREATE_TOUR_SCHEDULE, {
    refetchQueries: [{ query: GET_TOURS_BY_GUIDE, variables: { guideId: user?.id } }],
    onCompleted: () => {
      toast.success('Session added successfully')
    },
    onError: (error) => {
      toast.error(getDisplayError(error))
    }
  })

  // Delete Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    tourId: string
    tourTitle: string
  }>({
    isOpen: false,
    tourId: '',
    tourTitle: ''
  })

  // Add Session Modal State
  const [sessionModal, setSessionModal] = useState<{
    isOpen: boolean
    tourId: string
    tourTitle: string
  }>({
    isOpen: false,
    tourId: '',
    tourTitle: ''
  })
  const [sessionForm, setSessionForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    meetingPoint: '',
    maxCapacity: '',
  })
  const [addingSession, setAddingSession] = useState(false)

  const handleDeleteClick = (id: string, title: string) => {
    setModalConfig({ isOpen: true, tourId: id, tourTitle: title })
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteTour({ variables: { id: modalConfig.tourId } })
    } finally {
      setModalConfig((prev) => ({ ...prev, isOpen: false }))
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/tours/${id}/edit`)
  }

  const [cloning, setCloning] = useState<string | null>(null)
  const [createTourMut] = useMutation(CREATE_TOUR)
  const [createStepMut] = useMutation(CREATE_TOUR_STEP)
  const [createPricingMut] = useMutation(CREATE_TOUR_PRICING)

  const handleClone = async (tourId: string) => {
    if (!user?.id || cloning) return
    setCloning(tourId)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tourData } = await client.query<{ tour: any }>({
        query: GET_TOUR_BY_ID,
        variables: { id: tourId },
        fetchPolicy: 'network-only',
      })
      const source = tourData?.tour
      if (!source) throw new Error('Tour not found')

      const { data: created } = await createTourMut({
        variables: {
          input: {
            title: `${source.title} (copy)`,
            description: source.description || '',
            guideId: user.id,
            status: 'DRAFT',
            tourType: source.tourType,
          },
        },
      })
      const newTourId = (created as { createTour?: { id: string } })?.createTour?.id
      if (!newTourId) throw new Error('Failed to create tour')

      // Copy steps
      const steps = [...(source.tourSteps || [])].sort(
        (a: { order: number }, b: { order: number }) => a.order - b.order,
      )
      for (const step of steps) {
        await createStepMut({
          variables: {
            input: {
              tourId: newTourId,
              title: step.title || '',
              description: step.description || '',
              latitude: step.latitude,
              longitude: step.longitude,
              order: step.order,
              ...(step.place?.id ? { placeId: step.place.id } : {}),
            },
          },
        })
      }

      // Copy pricing
      const pricings = source.tourPricings || []
      for (const p of pricings) {
        await createPricingMut({
          variables: {
            input: {
              tourId: newTourId,
              price: p.price,
              currency: p.currency,
              startDate: p.startDate,
              endDate: p.endDate || undefined,
              minParticipants: p.minParticipants || undefined,
              maxParticipants: p.maxParticipants || undefined,
            },
          },
        })
      }

      toast.success('Tour cloned as draft')
      router.push(`/tours/${newTourId}/edit`)
    } catch (err) {
      toast.error(getDisplayError(err))
    } finally {
      setCloning(null)
    }
  }

  const handleAddSession = (tourId: string, title: string) => {
    setSessionForm({ date: '', startTime: '', endTime: '', meetingPoint: '', maxCapacity: '' })
    setSessionModal({ isOpen: true, tourId, tourTitle: title })
  }

  const handleSubmitSession = async () => {
    if (!sessionForm.date || !sessionForm.startTime) {
      toast.error('Date and start time are required')
      return
    }

    const startDateTime = new Date(`${sessionForm.date}T${sessionForm.startTime}:00`)
    if (Number.isNaN(startDateTime.getTime())) {
      toast.error('Invalid start date or time')
      return
    }
    if (startDateTime.getTime() < Date.now()) {
      toast.error('Sessions cannot be scheduled in the past')
      return
    }

    let endDateTime: Date | undefined
    if (sessionForm.endTime) {
      endDateTime = new Date(`${sessionForm.date}T${sessionForm.endTime}:00`)
      if (Number.isNaN(endDateTime.getTime())) {
        toast.error('Invalid end time')
        return
      }
      if (endDateTime <= startDateTime) {
        toast.error('End time must be after start time')
        return
      }
    }

    setAddingSession(true)
    try {
      await createTourSchedule({
        variables: {
          input: {
            tourId: sessionModal.tourId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime?.toISOString(),
            isAvailable: true,
            maxCapacity: sessionForm.maxCapacity ? parseInt(sessionForm.maxCapacity) : undefined,
            specialInfo: sessionForm.meetingPoint || undefined,
          },
        },
      })
      setSessionModal((prev) => ({ ...prev, isOpen: false }))
    } finally {
      setAddingSession(false)
    }
  }

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  const tours = data?.toursByGuide || []

  // Filter tours
  const filteredTours = tours.filter((tour) => {
    if (filter === 'all') return true
    return tour.status === filter
  })

  const counts = {
    all: tours.length,
    active: tours.filter((t) => t.status === 'active').length,
    draft: tours.filter((t) => t.status === 'draft').length,
    archived: tours.filter((t) => t.status === 'archived').length
  }

  if (loading) {
    return (
      <div>
        <div className='flex justify-center items-center h-64'>
          <div
            className='animate-spin rounded-full h-12 w-12 border-b-2'
            style={{ borderColor: 'var(--color-primary)' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title='My Tours'
        actions={
          <Link
            href='/tours/create'
            className='flex items-center gap-2 text-white px-6 py-2 rounded-lg transition hover:opacity-90'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus className='w-5 h-5' />
            Create New Tour
          </Link>
        }
      />

      {/* Filters */}
      <div className='flex flex-wrap gap-3 mb-6'>
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All Tours ({counts.all})
        </FilterButton>
        <FilterButton active={filter === 'active'} onClick={() => setFilter('active')}>
          Active ({counts.active})
        </FilterButton>
        <FilterButton active={filter === 'draft'} onClick={() => setFilter('draft')}>
          Draft ({counts.draft})
        </FilterButton>
        <FilterButton active={filter === 'archived'} onClick={() => setFilter('archived')}>
          Archived ({counts.archived})
        </FilterButton>
      </div>

      {/* Tours Grid */}
      {filteredTours.length === 0 ? (
        <div className='text-center py-16'>
          <p className='text-lg mb-4' style={{ color: 'var(--color-text-muted)' }}>No tours yet</p>
          <Link
            href='/tours/create'
            className='inline-block text-white px-6 py-3 rounded-lg transition hover:opacity-90'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Create your first tour
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {filteredTours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onAddSession={handleAddSession}
              onClone={handleClone}
              deleting={deleting && modalConfig.tourId === tour.id}
              cloning={cloning === tour.id}
            />
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title='Delete Tour?'
        description={`Are you sure you want to delete "${modalConfig.tourTitle}"? This action cannot be undone.`}
        confirmText='Delete'
        cancelText='Cancel'
        variant='danger'
        loading={deleting}
      />

      {/* Add Session Modal */}
      {sessionModal.isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div
            className='rounded-xl max-w-md w-full shadow-xl'
            style={{ backgroundColor: 'var(--color-card-bg)' }}
          >
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2
                  className='text-xl font-bold'
                  style={{ color: 'var(--color-text-heading)' }}
                >
                  Add Session
                </h2>
                <button
                  onClick={() => setSessionModal((prev) => ({ ...prev, isOpen: false }))}
                  className='transition hover:text-[var(--color-text-body)]'
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
              <p className='text-sm mb-4' style={{ color: 'var(--color-text-secondary)' }}>
                Add a new session for <span className='font-medium'>{sessionModal.tourTitle}</span>
              </p>

              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      className='block text-sm font-medium mb-1'
                      style={{ color: 'var(--color-text-body)' }}
                    >
                      <Calendar className='w-4 h-4 inline mr-1' />
                      Date *
                    </label>
                    <input
                      type='date'
                      value={sessionForm.date}
                      min={todayStr}
                      onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                      className='w-full px-3 py-2 border rounded-lg outline-none transition'
                      style={{ borderColor: 'var(--color-card-border)' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-primary-light)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-card-border)'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>
                  <div>
                    <label
                      className='block text-sm font-medium mb-1'
                      style={{ color: 'var(--color-text-body)' }}
                    >
                      <MapPin className='w-4 h-4 inline mr-1' />
                      Meeting Point
                    </label>
                    <input
                      type='text'
                      value={sessionForm.meetingPoint}
                      onChange={(e) => setSessionForm({ ...sessionForm, meetingPoint: e.target.value })}
                      className='w-full px-3 py-2 border rounded-lg outline-none transition'
                      style={{ borderColor: 'var(--color-card-border)' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-primary-light)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-card-border)'; e.currentTarget.style.boxShadow = 'none' }}
                      placeholder='Main Plaza'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      className='block text-sm font-medium mb-1'
                      style={{ color: 'var(--color-text-body)' }}
                    >
                      <Clock className='w-4 h-4 inline mr-1' />
                      Start Time *
                    </label>
                    <input
                      type='time'
                      value={sessionForm.startTime}
                      onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                      className='w-full px-3 py-2 border rounded-lg outline-none transition'
                      style={{ borderColor: 'var(--color-card-border)' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-primary-light)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-card-border)'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>
                  <div>
                    <label
                      className='block text-sm font-medium mb-1'
                      style={{ color: 'var(--color-text-body)' }}
                    >
                      End Time
                    </label>
                    <input
                      type='time'
                      value={sessionForm.endTime}
                      onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                      className='w-full px-3 py-2 border rounded-lg outline-none transition'
                      style={{ borderColor: 'var(--color-card-border)' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-primary-light)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-card-border)'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className='block text-sm font-medium mb-1'
                    style={{ color: 'var(--color-text-body)' }}
                  >
                    Max Capacity
                  </label>
                  <input
                    type='number'
                    min='1'
                    value={sessionForm.maxCapacity}
                    onChange={(e) => setSessionForm({ ...sessionForm, maxCapacity: e.target.value })}
                    className='w-full px-3 py-2 border rounded-lg outline-none transition'
                    style={{ borderColor: 'var(--color-card-border)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-primary-light)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-card-border)'; e.currentTarget.style.boxShadow = 'none' }}
                    placeholder='Leave empty for unlimited'
                  />
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => setSessionModal((prev) => ({ ...prev, isOpen: false }))}
                  className='flex-1 px-4 py-2 border rounded-lg transition hover:bg-[var(--color-section-bg)]'
                  style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
                  disabled={addingSession}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitSession}
                  disabled={addingSession || !sessionForm.date || !sessionForm.startTime}
                  className='flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 enabled:hover:opacity-90'
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {addingSession ? 'Adding...' : 'Add Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TourCard({
  tour,
  onEdit,
  onDelete,
  onAddSession,
  onClone,
  deleting,
  cloning,
}: {
  tour: Tour
  onEdit: (id: string) => void
  onDelete: (id: string, title: string) => void
  onAddSession: (tourId: string, title: string) => void
  onClone: (tourId: string) => void
  deleting: boolean
  cloning: boolean
}) {
  const isGuided = tour.tourType === 'GUIDED'
  const isPrivate = tour.isCustom
  const isFreeWalking = tour.isFreeWalkingTour
  const pricing = tour.tourPricings?.[0]
  const scheduleCount = tour.tourSchedules?.length || 0
  const formattedDate = new Date(tour.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const now = Date.now()
  const upcomingSessions = (tour.tourSchedules || [])
    .filter((s) => new Date(s.startTime).getTime() > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  const nextSession = upcomingSessions[0]
  const upcomingCount = upcomingSessions.length
  const allCompleted = scheduleCount > 0 && upcomingCount === 0

  return (
    <div
      className='rounded-xl border overflow-hidden transition-shadow hover:shadow-lg'
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-card-border)',
      }}
    >
      {tour.media?.[0]?.url ? (
        <div
          className='h-48 bg-cover bg-center relative'
          style={{ backgroundImage: `url(${tour.media[0].url})` }}
        >
          <div className='absolute top-2 left-2 flex gap-1'>
            <span
              className='px-2 py-1 rounded text-xs font-semibold'
              style={
                isGuided
                  ? { backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }
                  : { backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }
              }
            >
              {isGuided ? 'Guided' : 'Self-Guided'}
            </span>
            {isPrivate && (
              <span
                className='px-2 py-1 rounded text-xs font-semibold'
                style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text-heading)' }}
              >
                Private
              </span>
            )}
            {isFreeWalking && (
              <span
                className='px-2 py-1 rounded text-xs font-semibold'
                style={{ backgroundColor: 'var(--color-success-light, #DCFCE7)', color: 'var(--color-success)' }}
              >
                Free walk
              </span>
            )}
          </div>
        </div>
      ) : (
        <div
          className='h-48 relative'
          style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-dark))' }}
        >
          <div className='absolute top-2 left-2 flex gap-1'>
            <span
              className='px-2 py-1 rounded text-xs font-semibold'
              style={
                isGuided
                  ? { backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }
                  : { backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }
              }
            >
              {isGuided ? 'Guided' : 'Self-Guided'}
            </span>
            {isPrivate && (
              <span
                className='px-2 py-1 rounded text-xs font-semibold'
                style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text-heading)' }}
              >
                Private
              </span>
            )}
            {isFreeWalking && (
              <span
                className='px-2 py-1 rounded text-xs font-semibold'
                style={{ backgroundColor: 'var(--color-success-light, #DCFCE7)', color: 'var(--color-success)' }}
              >
                Free walk
              </span>
            )}
          </div>
        </div>
      )}
      <div className='p-6'>
        <div className='flex justify-between items-start mb-2'>
          <h3
            className='text-lg font-semibold'
            style={{ color: 'var(--color-text-heading)' }}
          >
            {tour.title}
          </h3>
          {tour.categories && tour.categories.length > 0 && (
            <span
              className='px-2 py-1 rounded text-xs'
              style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}
            >
              {tour.categories[0].name}
            </span>
          )}
        </div>
        <p
          className='text-sm mb-4 line-clamp-2'
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {tour.description}
        </p>
        <div className='flex justify-between items-center text-sm mb-2'>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            <span className='font-semibold'>{tour.tourSteps?.length || 0}</span> stops
          </div>
          {pricing && (
            <div className='font-semibold' style={{ color: 'var(--color-primary)' }}>
              {formatMoney(pricing.price, pricing.currency)}
            </div>
          )}
          <div className='text-xs' style={{ color: 'var(--color-text-muted)' }}>{formattedDate}</div>
        </div>

        {/* Schedule info for guided tours */}
        {isGuided && nextSession && (
          <div className='text-xs mb-2' style={{ color: 'var(--color-info)' }}>
            Next: {format(new Date(nextSession.startTime), 'MMM d, HH:mm')}
            {upcomingCount > 1 ? ` · ${upcomingCount - 1} more` : ''}
          </div>
        )}
        {isGuided && allCompleted && (
          <div className='text-xs mb-2' style={{ color: 'var(--color-text-muted)' }}>
            All sessions completed
          </div>
        )}
        {isGuided && scheduleCount === 0 && (
          <div className='text-xs mb-2' style={{ color: 'var(--color-text-muted)' }}>
            No sessions scheduled yet
          </div>
        )}

        <div
          className='pt-4 border-t flex gap-2'
          style={{ borderColor: 'var(--color-card-border)' }}
        >
          <button
            onClick={() => onEdit(tour.id)}
            className='flex-1 px-4 py-2 rounded-lg transition text-sm font-medium hover:opacity-80'
            style={{ backgroundColor: 'var(--color-section-bg)', color: 'var(--color-text-body)' }}
          >
            Edit
          </button>
          <button
            onClick={() => onClone(tour.id)}
            disabled={cloning}
            className='flex-1 px-4 py-2 rounded-lg transition text-sm font-medium disabled:opacity-50 enabled:hover:opacity-80 flex items-center justify-center gap-1'
            style={{ backgroundColor: 'var(--color-section-bg)', color: 'var(--color-text-body)' }}
          >
            <Copy size={14} />
            {cloning ? 'Cloning...' : 'Clone'}
          </button>
          {isGuided && (
            <button
              onClick={() => onAddSession(tour.id, tour.title)}
              className='flex-1 px-4 py-2 rounded-lg transition text-sm font-medium hover:opacity-85'
              style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}
            >
              + Session
            </button>
          )}
          <button
            onClick={() => onDelete(tour.id, tour.title)}
            disabled={deleting}
            className='flex-1 px-4 py-2 rounded-lg transition text-sm font-medium disabled:opacity-50 enabled:hover:opacity-85'
            style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
