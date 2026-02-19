'use client'

import { useAuth } from '@/contexts/AuthContext'
import dynamic from 'next/dynamic'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import {
  GET_TOUR_BY_ID,
  UPDATE_TOUR,
  CREATE_TOUR_STEP,
  UPDATE_TOUR_STEP,
  DELETE_TOUR_STEP,
  CREATE_TOUR_PRICING,
  UPDATE_TOUR_PRICING,
  CREATE_TOUR_SCHEDULE,
} from '@/graphql/tours'
import { toast } from 'sonner'
import { format } from 'date-fns'

const TourCreationMap = dynamic(
  () =>
    import('@/components/maps/TourCreationMap').then(
      (mod) => mod.TourCreationMap
    ),
  { ssr: false }
)

interface Waypoint {
  id: string
  latitude: number
  longitude: number
  title: string
  description: string
  order: number
}

interface TourPricing {
  id: string
  price: number
  currency: string
  minParticipants: number
  maxParticipants: number
}

interface TourScheduleItem {
  id: string
  startTime: string
  endTime?: string
  isAvailable: boolean
  maxCapacity?: number
  specialInfo?: string
}

export default function EditTourPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Tour basic info
  const [tourInfo, setTourInfo] = useState({
    title: '',
    description: '',
    tourType: 'SELF_GUIDED' as 'GUIDED' | 'SELF_GUIDED',
    price: '',
    currency: 'USD',
    maxParticipants: '',
  })

  // Tour waypoints
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [editingWaypoint, setEditingWaypoint] = useState<string | null>(null)

  // Track deleted steps and existing pricing
  const [deletedStepIds, setDeletedStepIds] = useState<string[]>([])
  const [existingPricing, setExistingPricing] = useState<TourPricing | null>(null)

  // Existing schedules (for display)
  const [existingSchedules, setExistingSchedules] = useState<TourScheduleItem[]>([])

  const isGuided = tourInfo.tourType === 'GUIDED'

  // Fetch tour data
  const { data: fetchData, loading: fetchLoading } = useQuery<any>(GET_TOUR_BY_ID, {
    variables: { id },
    skip: !id,
  })

  useEffect(() => {
    if (fetchData?.tour) {
      const tour = fetchData.tour
      const pricing = tour.tourPricings?.[0]
      const tourTypeValue = tour.tourType === 'guided' ? 'GUIDED' : 'SELF_GUIDED'

      setTourInfo({
        title: tour.title || '',
        description: tour.description || '',
        tourType: tourTypeValue,
        price: pricing?.price?.toString() || '',
        currency: pricing?.currency || 'USD',
        maxParticipants: pricing?.maxParticipants?.toString() || '',
      })

      if (pricing) {
        setExistingPricing(pricing)
      }

      if (tour.tourSchedules) {
        setExistingSchedules(tour.tourSchedules)
      }

      const tourSteps = (tour.tourSteps || [])
        .map((s: any) => ({
          id: s.id,
          latitude: s.latitude,
          longitude: s.longitude,
          title: s.title || '',
          description: s.description || '',
          order: s.order,
        }))
        .sort((a: Waypoint, b: Waypoint) => a.order - b.order)

      setWaypoints(tourSteps)
    }
  }, [fetchData])

  // Mutations
  const [updateTour] = useMutation(UPDATE_TOUR)
  const [createTourStep] = useMutation(CREATE_TOUR_STEP)
  const [updateTourStep] = useMutation(UPDATE_TOUR_STEP)
  const [deleteTourStep] = useMutation(DELETE_TOUR_STEP)
  const [createTourPricing] = useMutation(CREATE_TOUR_PRICING)
  const [updateTourPricing] = useMutation(UPDATE_TOUR_PRICING)

  const handleAddWaypoint = (lat: number, lng: number) => {
    const newWaypoint: Waypoint = {
      id: `new-${Date.now()}`,
      latitude: lat,
      longitude: lng,
      title: `Stop ${waypoints.length + 1}`,
      description: '',
      order: waypoints.length + 1,
    }
    setWaypoints([...waypoints, newWaypoint])
    setEditingWaypoint(newWaypoint.id)
  }

  const handleRemoveWaypoint = (waypointId: string) => {
    if (!waypointId.startsWith('new-')) {
      setDeletedStepIds([...deletedStepIds, waypointId])
    }
    setWaypoints(waypoints.filter((wp) => wp.id !== waypointId))
  }

  const handleUpdateWaypoint = (
    wpId: string,
    title: string,
    description: string
  ) => {
    setWaypoints(
      waypoints.map((wp) =>
        wp.id === wpId ? { ...wp, title, description } : wp
      )
    )
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      // 1. Update basic tour info + tourType
      await updateTour({
        variables: {
          input: {
            id,
            title: tourInfo.title,
            description: tourInfo.description,
            tourType: tourInfo.tourType === 'GUIDED' ? 'guided' : 'self_guided',
          },
        },
      })

      // 2. Delete removed steps
      for (const stepId of deletedStepIds) {
        await deleteTourStep({ variables: { id: stepId } })
      }

      // 3. Create/Update steps
      const stepPromises = waypoints.map((waypoint, index) => {
        const stepInput = {
          title: waypoint.title,
          description: waypoint.description,
          latitude: waypoint.latitude,
          longitude: waypoint.longitude,
          order: index + 1,
        }

        if (waypoint.id.startsWith('new-')) {
          return createTourStep({
            variables: { input: { ...stepInput, tourId: id } },
          })
        } else {
          return updateTourStep({
            variables: { input: { ...stepInput, id: waypoint.id } },
          })
        }
      })
      await Promise.all(stepPromises)

      // 4. Manage pricing
      const hasPrice = tourInfo.price && parseFloat(tourInfo.price) > 0
      if (hasPrice) {
        const pricingInput = {
          price: parseFloat(tourInfo.price),
          currency: tourInfo.currency,
          minParticipants: 1,
          maxParticipants: tourInfo.maxParticipants
            ? parseInt(tourInfo.maxParticipants)
            : 10,
        }

        if (existingPricing) {
          await updateTourPricing({
            variables: {
              input: { id: existingPricing.id, ...pricingInput },
            },
          })
        } else {
          await createTourPricing({
            variables: {
              input: {
                tourId: id,
                startDate: new Date().toISOString(),
                ...pricingInput,
              },
            },
          })
        }
      }

      toast.success('Tour updated successfully')
      router.push('/tours')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating tour:', error)
      toast.error(error.message || 'Failed to update tour')
    } finally {
      setSubmitting(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className='p-8 flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' />
      </div>
    )
  }

  return (
    <div className='p-8'>
      <div className='flex items-center gap-4 mb-8'>
        <button
          onClick={() => router.back()}
          className='text-gray-500 hover:text-gray-700'
        >
          ← Back
        </button>
        <h1 className='text-3xl font-bold'>Edit Tour</h1>
      </div>

      {/* Progress Steps */}
      <div className='flex items-center justify-center mb-8'>
        <StepIndicator number={1} label='Information' active={step >= 1} completed={step > 1} />
        <div className={`w-20 h-0.5 mx-2 ${step > 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        <StepIndicator number={2} label='Route & Stops' active={step >= 2} completed={step > 2} />
        <div className={`w-20 h-0.5 mx-2 ${step > 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        <StepIndicator number={3} label='Review' active={step >= 3} completed={false} />
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className='max-w-2xl mx-auto bg-white rounded-lg shadow p-8'>
          <h2 className='text-2xl font-semibold mb-6'>Tour Information</h2>
          <div className='space-y-4'>
            {/* Tour Type Selector */}
            <div>
              <label className='block text-sm font-medium mb-3'>Tour Type *</label>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  type='button'
                  onClick={() => setTourInfo({ ...tourInfo, tourType: 'SELF_GUIDED' })}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    !isGuided
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className='font-semibold'>Self-Guided</p>
                  <p className='text-sm text-gray-600 mt-1'>
                    Tourists follow the route independently
                  </p>
                </button>
                <button
                  type='button'
                  onClick={() => setTourInfo({ ...tourInfo, tourType: 'GUIDED' })}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    isGuided
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className='font-semibold'>Guided</p>
                  <p className='text-sm text-gray-600 mt-1'>
                    You lead the group in person
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Tour Title *
              </label>
              <input
                type='text'
                value={tourInfo.title}
                onChange={(e) =>
                  setTourInfo({ ...tourInfo, title: e.target.value })
                }
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                placeholder='Historic Downtown Walking Tour'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Description *
              </label>
              <textarea
                value={tourInfo.description}
                onChange={(e) =>
                  setTourInfo({ ...tourInfo, description: e.target.value })
                }
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                rows={4}
                placeholder='Describe your tour...'
                required
              />
            </div>

            {/* Price & Currency + Max Participants (guided only) */}
            <div className={`grid ${isGuided ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Price per Person
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={tourInfo.price}
                  onChange={(e) =>
                    setTourInfo({ ...tourInfo, price: e.target.value })
                  }
                  className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder='75'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Currency
                </label>
                <select
                  value={tourInfo.currency}
                  onChange={(e) =>
                    setTourInfo({ ...tourInfo, currency: e.target.value })
                  }
                  className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                >
                  <option value='USD'>USD</option>
                  <option value='ARS'>ARS</option>
                  <option value='EUR'>EUR</option>
                  <option value='BRL'>BRL</option>
                </select>
              </div>
              {isGuided && (
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Max Participants
                  </label>
                  <input
                    type='number'
                    min='1'
                    value={tourInfo.maxParticipants}
                    onChange={(e) =>
                      setTourInfo({ ...tourInfo, maxParticipants: e.target.value })
                    }
                    className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                    placeholder='10'
                  />
                </div>
              )}
            </div>

            {/* Existing Schedules (guided only) */}
            {isGuided && existingSchedules.length > 0 && (
              <div className='border-t pt-4 mt-4'>
                <h3 className='text-lg font-medium mb-3'>Scheduled Sessions</h3>
                <div className='space-y-2'>
                  {existingSchedules.map((schedule) => (
                    <div key={schedule.id} className='flex items-center justify-between bg-blue-50 rounded-lg p-3 text-sm'>
                      <div>
                        <span className='font-medium'>
                          {format(new Date(schedule.startTime), 'MMM dd, yyyy HH:mm')}
                        </span>
                        {schedule.endTime && (
                          <span className='text-gray-600'>
                            {' '}- {format(new Date(schedule.endTime), 'HH:mm')}
                          </span>
                        )}
                        {schedule.specialInfo && (
                          <span className='text-gray-500 ml-2'>
                            ({schedule.specialInfo})
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        schedule.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {schedule.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  You can add more sessions from the Tours list page.
                </p>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!tourInfo.title || !tourInfo.description}
              className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Continue to Route Planning
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Route & Stops */}
      {step === 2 && (
        <div className='space-y-6'>
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-2xl font-semibold mb-4'>Edit Route</h2>
            <p className='text-gray-600 mb-6'>
              Modify your route. Click on the map to add new stops.
            </p>

            <TourCreationMap
              waypoints={waypoints}
              onWaypointAdd={handleAddWaypoint}
              onWaypointRemove={handleRemoveWaypoint}
            />
          </div>

          {waypoints.length > 0 && (
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-xl font-semibold mb-4'>
                Tour Stops ({waypoints.length})
              </h3>
              <div className='space-y-4'>
                {waypoints.map((waypoint, index) => (
                  <WaypointItem
                    key={waypoint.id}
                    waypoint={waypoint}
                    index={index}
                    isEditing={editingWaypoint === waypoint.id}
                    onEdit={() => setEditingWaypoint(waypoint.id)}
                    onSave={(title, description) => {
                      handleUpdateWaypoint(waypoint.id, title, description)
                      setEditingWaypoint(null)
                    }}
                    onRemove={() => handleRemoveWaypoint(waypoint.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className='flex gap-4'>
            <button
              onClick={() => setStep(1)}
              className='flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300'
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={waypoints.length < 2}
              className='flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50'
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className='max-w-2xl mx-auto bg-white rounded-lg shadow p-8'>
          <h2 className='text-2xl font-semibold mb-6'>Review & Save</h2>

          <div className='space-y-4 mb-8'>
            <div>
              <p className='text-sm text-gray-600'>Tour Type</p>
              <p className='font-medium'>
                {isGuided ? 'Guided — You lead the group' : 'Self-Guided — Independent exploration'}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Title</p>
              <p className='font-medium'>{tourInfo.title}</p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Description</p>
              <p className='text-sm'>{tourInfo.description}</p>
            </div>
            <div className={`grid ${isGuided ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
              <div>
                <p className='text-sm text-gray-600'>Price</p>
                <p className='font-medium'>
                  {tourInfo.price
                    ? `${tourInfo.currency} $${tourInfo.price} per person`
                    : 'Free'}
                </p>
              </div>
              {isGuided && (
                <div>
                  <p className='text-sm text-gray-600'>Max Participants</p>
                  <p className='font-medium'>
                    {tourInfo.maxParticipants || 'No limit'}
                  </p>
                </div>
              )}
              <div>
                <p className='text-sm text-gray-600'>Stops</p>
                <p className='font-medium'>{waypoints.length} locations</p>
              </div>
            </div>

            {/* Existing schedules summary */}
            {isGuided && existingSchedules.length > 0 && (
              <div className='bg-blue-50 rounded-lg p-4'>
                <p className='text-sm font-medium text-blue-800 mb-1'>
                  {existingSchedules.length} scheduled session{existingSchedules.length > 1 ? 's' : ''}
                </p>
                <p className='text-xs text-blue-600'>
                  Manage sessions from the Tours list page.
                </p>
              </div>
            )}

            <div>
              <p className='text-sm text-gray-600 mb-2'>Route</p>
              <div className='space-y-2'>
                {waypoints.map((wp, i) => (
                  <div key={wp.id} className='flex items-center gap-2 text-sm'>
                    <span className='bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0'>
                      {i + 1}
                    </span>
                    <span className='font-medium'>{wp.title}</span>
                    {wp.description && (
                      <span className='text-gray-500'>— {wp.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {deletedStepIds.length > 0 && (
              <div className='bg-yellow-50 border border-yellow-200 rounded p-3'>
                <p className='text-sm text-yellow-800'>
                  {deletedStepIds.length} stop(s) will be removed when you save.
                </p>
              </div>
            )}
          </div>

          <div className='flex gap-4'>
            <button
              onClick={() => setStep(2)}
              className='flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300'
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className='flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50'
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className='flex flex-col items-center'>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
          completed
            ? 'bg-green-600 text-white'
            : active
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <p
        className={`text-xs mt-2 ${
          active ? 'text-blue-600 font-medium' : 'text-gray-500'
        }`}
      >
        {label}
      </p>
    </div>
  )
}

function WaypointItem({
  waypoint,
  index,
  isEditing,
  onEdit,
  onSave,
  onRemove,
}: {
  waypoint: Waypoint
  index: number
  isEditing: boolean
  onEdit: () => void
  onSave: (title: string, description: string) => void
  onRemove: () => void
}) {
  const [title, setTitle] = useState(waypoint.title)
  const [description, setDescription] = useState(waypoint.description)

  useEffect(() => {
    setTitle(waypoint.title)
    setDescription(waypoint.description)
  }, [waypoint])

  if (isEditing) {
    return (
      <div className='border rounded-lg p-4 bg-blue-50/30'>
        <div className='flex items-center gap-2 mb-3'>
          <span className='bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm'>
            {index + 1}
          </span>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500'
            placeholder='Stop name'
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className='w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 mb-3'
          rows={2}
          placeholder='Description of this stop...'
        />
        <div className='flex gap-2'>
          <button
            onClick={() => onSave(title, description)}
            className='flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700'
          >
            Save
          </button>
          <button
            onClick={onRemove}
            className='px-4 bg-red-100 text-red-600 py-2 rounded text-sm hover:bg-red-200'
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className='border rounded-lg p-4 hover:border-blue-300 transition cursor-pointer bg-white'
      onClick={onEdit}
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-3'>
          <span className='bg-gray-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0'>
            {index + 1}
          </span>
          <div>
            <p className='font-medium'>{waypoint.title}</p>
            {waypoint.description && (
              <p className='text-sm text-gray-600 mt-1'>
                {waypoint.description}
              </p>
            )}
            <p className='text-xs text-gray-400 mt-1'>
              {waypoint.latitude.toFixed(6)}, {waypoint.longitude.toFixed(6)}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className='text-gray-400 hover:text-red-600'
        >
          ✕
        </button>
      </div>
    </div>
  )
}
