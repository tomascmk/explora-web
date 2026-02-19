'use client'

import { useQuery, useMutation } from '@apollo/client/react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { GET_TOURS_BY_GUIDE, DELETE_TOUR, CREATE_TOUR_SCHEDULE } from '@/graphql/tours'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Plus, X, Calendar, Clock, MapPin } from 'lucide-react'

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
  const [filter, setFilter] = useState('all')

  const { data, loading, refetch } = useQuery<GetToursByGuideData, GetToursByGuideVars>(GET_TOURS_BY_GUIDE, {
    variables: { guideId: user?.id },
    skip: !user?.id,
  })

  const [deleteTour, { loading: deleting }] = useMutation(DELETE_TOUR, {
    onCompleted: () => {
      toast.success('Tour deleted successfully')
      refetch()
    },
    onError: (error) => {
      toast.error('Failed to delete tour: ' + error.message)
    }
  })

  const [createTourSchedule] = useMutation(CREATE_TOUR_SCHEDULE, {
    onCompleted: () => {
      toast.success('Session added successfully')
      refetch()
    },
    onError: (error) => {
      toast.error('Failed to add session: ' + error.message)
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

  const handleAddSession = (tourId: string, title: string) => {
    setSessionForm({ date: '', startTime: '', endTime: '', meetingPoint: '', maxCapacity: '' })
    setSessionModal({ isOpen: true, tourId, tourTitle: title })
  }

  const handleSubmitSession = async () => {
    if (!sessionForm.date || !sessionForm.startTime) {
      toast.error('Date and start time are required')
      return
    }

    setAddingSession(true)
    try {
      const startDateTime = new Date(`${sessionForm.date}T${sessionForm.startTime}:00`)
      const endDateTime = sessionForm.endTime
        ? new Date(`${sessionForm.date}T${sessionForm.endTime}:00`)
        : undefined

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
      <div className='p-8'>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' />
        </div>
      </div>
    )
  }

  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>My Tours</h1>
        <Link
          href='/tours/create'
          className='flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition'
        >
          <Plus className='w-5 h-5' />
          Create New Tour
        </Link>
      </div>

      {/* Filters */}
      <div className='flex gap-4 mb-6'>
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
          <p className='text-gray-500 text-lg mb-4'>No tours yet</p>
          <Link
            href='/tours/create'
            className='inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition'
          >
            Create your first tour
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredTours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onAddSession={handleAddSession}
              deleting={deleting && modalConfig.tourId === tour.id}
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
          <div className='bg-white rounded-lg max-w-md w-full'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold'>Add Session</h2>
                <button
                  onClick={() => setSessionModal((prev) => ({ ...prev, isOpen: false }))}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
              <p className='text-sm text-gray-600 mb-4'>
                Add a new session for <span className='font-medium'>{sessionModal.tourTitle}</span>
              </p>

              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      <Calendar className='w-4 h-4 inline mr-1' />
                      Date *
                    </label>
                    <input
                      type='date'
                      value={sessionForm.date}
                      onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                      className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      <MapPin className='w-4 h-4 inline mr-1' />
                      Meeting Point
                    </label>
                    <input
                      type='text'
                      value={sessionForm.meetingPoint}
                      onChange={(e) => setSessionForm({ ...sessionForm, meetingPoint: e.target.value })}
                      className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                      placeholder='Main Plaza'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      <Clock className='w-4 h-4 inline mr-1' />
                      Start Time *
                    </label>
                    <input
                      type='time'
                      value={sessionForm.startTime}
                      onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                      className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>End Time</label>
                    <input
                      type='time'
                      value={sessionForm.endTime}
                      onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                      className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>Max Capacity</label>
                  <input
                    type='number'
                    min='1'
                    value={sessionForm.maxCapacity}
                    onChange={(e) => setSessionForm({ ...sessionForm, maxCapacity: e.target.value })}
                    className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                    placeholder='Leave empty for unlimited'
                  />
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => setSessionModal((prev) => ({ ...prev, isOpen: false }))}
                  className='flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
                  disabled={addingSession}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitSession}
                  disabled={addingSession || !sessionForm.date || !sessionForm.startTime}
                  className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
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
      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

function TourCard({
  tour,
  onEdit,
  onDelete,
  onAddSession,
  deleting
}: {
  tour: Tour
  onEdit: (id: string) => void
  onDelete: (id: string, title: string) => void
  onAddSession: (tourId: string, title: string) => void
  deleting: boolean
}) {
  const isGuided = tour.tourType === 'guided'
  const pricing = tour.tourPricings?.[0]
  const scheduleCount = tour.tourSchedules?.length || 0
  const formattedDate = new Date(tour.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition'>
      {tour.media?.[0]?.url ? (
        <div
          className='h-48 bg-cover bg-center relative'
          style={{ backgroundImage: `url(${tour.media[0].url})` }}
        >
          <div className='absolute top-2 left-2'>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              isGuided
                ? 'bg-purple-100 text-purple-800'
                : 'bg-teal-100 text-teal-800'
            }`}>
              {isGuided ? 'Guided' : 'Self-Guided'}
            </span>
          </div>
        </div>
      ) : (
        <div className='h-48 bg-gradient-to-r from-blue-400 to-indigo-500 relative'>
          <div className='absolute top-2 left-2'>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              isGuided
                ? 'bg-purple-100 text-purple-800'
                : 'bg-teal-100 text-teal-800'
            }`}>
              {isGuided ? 'Guided' : 'Self-Guided'}
            </span>
          </div>
        </div>
      )}
      <div className='p-6'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='text-lg font-semibold'>{tour.title}</h3>
          {tour.categories && tour.categories.length > 0 && (
            <span className='px-2 py-1 rounded text-xs bg-blue-100 text-blue-800'>
              {tour.categories[0].name}
            </span>
          )}
        </div>
        <p className='text-sm text-gray-600 mb-4 line-clamp-2'>{tour.description}</p>
        <div className='flex justify-between items-center text-sm mb-2'>
          <div className='text-gray-600'>
            <span className='font-semibold'>{tour.tourSteps?.length || 0}</span> stops
          </div>
          {pricing && (
            <div className='text-blue-600 font-semibold'>
              {pricing.currency} ${pricing.price}
            </div>
          )}
          <div className='text-gray-500 text-xs'>{formattedDate}</div>
        </div>

        {/* Schedule info for guided tours */}
        {isGuided && scheduleCount > 0 && (
          <div className='text-xs text-purple-600 mb-2'>
            {scheduleCount} session{scheduleCount > 1 ? 's' : ''} scheduled
          </div>
        )}

        <div className='pt-4 border-t flex gap-2'>
          <button
            onClick={() => onEdit(tour.id)}
            className='flex-1 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition text-sm font-medium'
          >
            Edit
          </button>
          {isGuided && (
            <button
              onClick={() => onAddSession(tour.id, tour.title)}
              className='flex-1 px-4 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition text-sm font-medium'
            >
              + Session
            </button>
          )}
          <button
            onClick={() => onDelete(tour.id, tour.title)}
            disabled={deleting}
            className='flex-1 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium disabled:opacity-50'
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
