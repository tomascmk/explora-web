'use client'

import { useAuth } from '@/contexts/AuthContext'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/tours/ImageUpload'
import {
  CREATE_TOUR,
  CREATE_TOUR_STEP,
  CREATE_TOUR_PRICING,
  CREATE_TOUR_SCHEDULE,
  UPDATE_TOUR,
} from '@/graphql/tours'

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

export default function CreateTourPage() {
  const router = useRouter()
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

  // Guided tour schedule info
  const [scheduleInfo, setScheduleInfo] = useState({
    date: '',
    startTime: '',
    endTime: '',
    meetingPoint: '',
  })

  // Tour images
  const [images, setImages] = useState<string[]>([])

  // Tour waypoints
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [editingWaypoint, setEditingWaypoint] = useState<string | null>(null)

  // Apollo Mutations
  const [createTour] = useMutation<any>(CREATE_TOUR)
  const [createTourStep] = useMutation(CREATE_TOUR_STEP)
  const [createTourPricing] = useMutation(CREATE_TOUR_PRICING)
  const [createTourSchedule] = useMutation(CREATE_TOUR_SCHEDULE)
  const [updateTour] = useMutation(UPDATE_TOUR)

  const isGuided = tourInfo.tourType === 'GUIDED'

  const handleAddWaypoint = (lat: number, lng: number) => {
    const newWaypoint: Waypoint = {
      id: `waypoint-${Date.now()}`,
      latitude: lat,
      longitude: lng,
      title: `Stop ${waypoints.length + 1}`,
      description: '',
      order: waypoints.length + 1,
    }
    setWaypoints([...waypoints, newWaypoint])
    setEditingWaypoint(newWaypoint.id)
  }

  const handleRemoveWaypoint = (id: string) => {
    setWaypoints(waypoints.filter((wp) => wp.id !== id))
  }

  const handleUpdateWaypoint = (
    id: string,
    title: string,
    description: string
  ) => {
    setWaypoints(
      waypoints.map((wp) => (wp.id === id ? { ...wp, title, description } : wp))
    )
  }

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to create a tour')
      return
    }

    setSubmitting(true)

    try {
      // 1. Create the tour as DRAFT
      const { data: tourData } = await createTour({
        variables: {
          input: {
            title: tourInfo.title,
            description: tourInfo.description,
            guideId: user.id,
            status: 'DRAFT',
            tourType: tourInfo.tourType === 'GUIDED' ? 'guided' : 'self_guided',
          },
        },
      })

      const tourId = tourData?.createTour?.id
      if (!tourId) throw new Error('Failed to create tour')

      // 2. Create TourSteps in parallel
      const stepPromises = waypoints.map((waypoint, index) =>
        createTourStep({
          variables: {
            input: {
              tourId,
              title: waypoint.title,
              description: waypoint.description,
              latitude: waypoint.latitude,
              longitude: waypoint.longitude,
              order: index + 1,
            },
          },
        })
      )
      await Promise.all(stepPromises)

      // 3. Create TourPricing if price was specified
      if (tourInfo.price) {
        await createTourPricing({
          variables: {
            input: {
              tourId,
              price: parseFloat(tourInfo.price),
              currency: tourInfo.currency,
              startDate: new Date().toISOString(),
              minParticipants: 1,
              maxParticipants: tourInfo.maxParticipants
                ? parseInt(tourInfo.maxParticipants)
                : 10,
            },
          },
        })
      }

      // 4. Create TourSchedule if guided tour with schedule info
      if (isGuided && scheduleInfo.date && scheduleInfo.startTime) {
        const startDateTime = new Date(`${scheduleInfo.date}T${scheduleInfo.startTime}:00`)
        const endDateTime = scheduleInfo.endTime
          ? new Date(`${scheduleInfo.date}T${scheduleInfo.endTime}:00`)
          : undefined

        await createTourSchedule({
          variables: {
            input: {
              tourId,
              startTime: startDateTime.toISOString(),
              endTime: endDateTime?.toISOString(),
              isAvailable: true,
              maxCapacity: tourInfo.maxParticipants
                ? parseInt(tourInfo.maxParticipants)
                : undefined,
              specialInfo: scheduleInfo.meetingPoint || undefined,
            },
          },
        })
      }

      // 5. Activate the tour
      await updateTour({
        variables: {
          input: {
            id: tourId,
            status: 'ACTIVE',
          },
        },
      })

      toast.success('Tour created successfully')
      router.push('/tours')
    } catch (error: any) {
      console.error('Error creating tour:', error)
      toast.error(error.message || 'Failed to create tour')
    } finally {
      setSubmitting(false)
    }
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
        <h1 className='text-3xl font-bold'>Create New Tour</h1>
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

            {/* Price & Currency (always shown) + Max Participants (guided only) */}
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

            {/* Schedule Section — Guided tours only */}
            {isGuided && (
              <div className='border-t pt-4 mt-4'>
                <h3 className='text-lg font-medium mb-3'>First Session Schedule</h3>
                <p className='text-sm text-gray-500 mb-4'>
                  Set the date and time for your first session. You can add more sessions later.
                </p>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Date *</label>
                    <input
                      type='date'
                      value={scheduleInfo.date}
                      onChange={(e) =>
                        setScheduleInfo({ ...scheduleInfo, date: e.target.value })
                      }
                      className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Meeting Point</label>
                    <input
                      type='text'
                      value={scheduleInfo.meetingPoint}
                      onChange={(e) =>
                        setScheduleInfo({ ...scheduleInfo, meetingPoint: e.target.value })
                      }
                      className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                      placeholder='Main Plaza, by the fountain'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4 mt-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Start Time *</label>
                    <input
                      type='time'
                      value={scheduleInfo.startTime}
                      onChange={(e) =>
                        setScheduleInfo({ ...scheduleInfo, startTime: e.target.value })
                      }
                      className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>End Time</label>
                    <input
                      type='time'
                      value={scheduleInfo.endTime}
                      onChange={(e) =>
                        setScheduleInfo({ ...scheduleInfo, endTime: e.target.value })
                      }
                      className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Images */}
            <div>
              <label className='block text-sm font-medium mb-2'>
                Tour Images
              </label>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={10}
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={
                !tourInfo.title ||
                !tourInfo.description ||
                (isGuided && (!scheduleInfo.date || !scheduleInfo.startTime))
              }
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
            <h2 className='text-2xl font-semibold mb-4'>Plan Your Route</h2>
            <p className='text-gray-600 mb-6'>
              Click on the map to add stops to your tour. They will be connected
              automatically in order.
            </p>

            <TourCreationMap
              waypoints={waypoints}
              onWaypointAdd={handleAddWaypoint}
              onWaypointRemove={handleRemoveWaypoint}
            />
          </div>

          {/* Waypoints List */}
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
          <h2 className='text-2xl font-semibold mb-6'>Review & Publish</h2>

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

            {/* Schedule summary for guided tours */}
            {isGuided && scheduleInfo.date && (
              <div className='bg-blue-50 rounded-lg p-4'>
                <p className='text-sm font-medium text-blue-800 mb-2'>First Session</p>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div>
                    <span className='text-blue-600'>Date:</span>{' '}
                    {scheduleInfo.date}
                  </div>
                  <div>
                    <span className='text-blue-600'>Time:</span>{' '}
                    {scheduleInfo.startTime}
                    {scheduleInfo.endTime && ` - ${scheduleInfo.endTime}`}
                  </div>
                  {scheduleInfo.meetingPoint && (
                    <div className='col-span-2'>
                      <span className='text-blue-600'>Meeting Point:</span>{' '}
                      {scheduleInfo.meetingPoint}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Waypoints summary */}
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
              {submitting ? 'Creating Tour...' : 'Publish Tour'}
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

  if (isEditing) {
    return (
      <div className='border rounded-lg p-4'>
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
      className='border rounded-lg p-4 hover:border-blue-300 transition cursor-pointer'
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
