'use client'

import { useAuth } from '@/contexts/AuthContext'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/tours/ImageUpload'
import { PageHeader } from '@/components/ui/PageHeader'
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
    <div>
      <div className='flex items-center gap-4 mb-8'>
        <button
          onClick={() => router.back()}
          className='hover:opacity-80'
          style={{ color: 'var(--color-text-muted)' }}
        >
          &larr; Back
        </button>
        <h1 className='text-3xl font-bold' style={{ color: 'var(--color-text-heading)' }}>Create New Tour</h1>
      </div>

      {/* Progress Steps */}
      <div className='flex items-center justify-center mb-8'>
        <StepIndicator number={1} label='Information' active={step >= 1} completed={step > 1} />
        <div className='w-20 h-0.5 mx-2' style={{ backgroundColor: step > 1 ? 'var(--color-primary)' : 'var(--color-card-border)' }}></div>
        <StepIndicator number={2} label='Route & Stops' active={step >= 2} completed={step > 2} />
        <div className='w-20 h-0.5 mx-2' style={{ backgroundColor: step > 2 ? 'var(--color-primary)' : 'var(--color-card-border)' }}></div>
        <StepIndicator number={3} label='Review' active={step >= 3} completed={false} />
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div
          className='max-w-2xl mx-auto rounded-xl border p-8'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <h2 className='text-2xl font-semibold mb-6' style={{ color: 'var(--color-text-heading)' }}>Tour Information</h2>
          <div className='space-y-4'>
            {/* Tour Type Selector */}
            <div>
              <label className='block text-sm font-medium mb-3' style={{ color: 'var(--color-text-body)' }}>Tour Type *</label>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  type='button'
                  onClick={() => setTourInfo({ ...tourInfo, tourType: 'SELF_GUIDED' })}
                  className='p-4 rounded-lg border-2 text-left transition'
                  style={
                    !isGuided
                      ? { borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)' }
                      : { borderColor: 'var(--color-card-border)' }
                  }
                >
                  <p className='font-semibold' style={{ color: 'var(--color-text-heading)' }}>Self-Guided</p>
                  <p className='text-sm mt-1' style={{ color: 'var(--color-text-body)' }}>
                    Tourists follow the route independently
                  </p>
                </button>
                <button
                  type='button'
                  onClick={() => setTourInfo({ ...tourInfo, tourType: 'GUIDED' })}
                  className='p-4 rounded-lg border-2 text-left transition'
                  style={
                    isGuided
                      ? { borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)' }
                      : { borderColor: 'var(--color-card-border)' }
                  }
                >
                  <p className='font-semibold' style={{ color: 'var(--color-text-heading)' }}>Guided</p>
                  <p className='text-sm mt-1' style={{ color: 'var(--color-text-body)' }}>
                    You lead the group in person
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
                Tour Title *
              </label>
              <input
                type='text'
                value={tourInfo.title}
                onChange={(e) =>
                  setTourInfo({ ...tourInfo, title: e.target.value })
                }
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                style={{ borderColor: 'var(--color-card-border)' }}
                placeholder='Historic Downtown Walking Tour'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
                Description *
              </label>
              <textarea
                value={tourInfo.description}
                onChange={(e) =>
                  setTourInfo({ ...tourInfo, description: e.target.value })
                }
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                style={{ borderColor: 'var(--color-card-border)' }}
                rows={4}
                placeholder='Describe your tour...'
                required
              />
            </div>

            {/* Price & Currency (always shown) + Max Participants (guided only) */}
            <div className={`grid ${isGuided ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
              <div>
                <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
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
                  className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                  style={{ borderColor: 'var(--color-card-border)' }}
                  placeholder='75'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
                  Currency
                </label>
                <select
                  value={tourInfo.currency}
                  onChange={(e) =>
                    setTourInfo({ ...tourInfo, currency: e.target.value })
                  }
                  className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                  style={{ borderColor: 'var(--color-card-border)' }}
                >
                  <option value='USD'>USD</option>
                  <option value='ARS'>ARS</option>
                  <option value='EUR'>EUR</option>
                  <option value='BRL'>BRL</option>
                </select>
              </div>
              {isGuided && (
                <div>
                  <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
                    Max Participants
                  </label>
                  <input
                    type='number'
                    min='1'
                    value={tourInfo.maxParticipants}
                    onChange={(e) =>
                      setTourInfo({ ...tourInfo, maxParticipants: e.target.value })
                    }
                    className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                    style={{ borderColor: 'var(--color-card-border)' }}
                    placeholder='10'
                  />
                </div>
              )}
            </div>

            {/* Schedule Section -- Guided tours only */}
            {isGuided && (
              <div className='border-t pt-4 mt-4' style={{ borderColor: 'var(--color-card-border)' }}>
                <h3 className='text-lg font-medium mb-3' style={{ color: 'var(--color-text-heading)' }}>First Session Schedule</h3>
                <p className='text-sm mb-4' style={{ color: 'var(--color-text-muted)' }}>
                  Set the date and time for your first session. You can add more sessions later.
                </p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Date *</label>
                    <input
                      type='date'
                      value={scheduleInfo.date}
                      onChange={(e) =>
                        setScheduleInfo({ ...scheduleInfo, date: e.target.value })
                      }
                      className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                      style={{ borderColor: 'var(--color-card-border)' }}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Meeting Point</label>
                    <input
                      type='text'
                      value={scheduleInfo.meetingPoint}
                      onChange={(e) =>
                        setScheduleInfo({ ...scheduleInfo, meetingPoint: e.target.value })
                      }
                      className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                      style={{ borderColor: 'var(--color-card-border)' }}
                      placeholder='Main Plaza, by the fountain'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Start Time *</label>
                    <input
                      type='time'
                      value={scheduleInfo.startTime}
                      onChange={(e) =>
                        setScheduleInfo({ ...scheduleInfo, startTime: e.target.value })
                      }
                      className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                      style={{ borderColor: 'var(--color-card-border)' }}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>End Time</label>
                    <input
                      type='time'
                      value={scheduleInfo.endTime}
                      onChange={(e) =>
                        setScheduleInfo({ ...scheduleInfo, endTime: e.target.value })
                      }
                      className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                      style={{ borderColor: 'var(--color-card-border)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Images */}
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
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
              className='w-full text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Continue to Route Planning
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Route & Stops */}
      {step === 2 && (
        <div className='space-y-6'>
          <div
            className='rounded-xl border p-6'
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <h2 className='text-2xl font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>Plan Your Route</h2>
            <p className='mb-6' style={{ color: 'var(--color-text-body)' }}>
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
            <div
              className='rounded-xl border p-6'
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
            >
              <h3 className='text-xl font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>
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
              className='flex-1 py-3 rounded-lg font-semibold hover:opacity-80 border'
              style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={waypoints.length < 2}
              className='flex-1 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50'
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div
          className='max-w-2xl mx-auto rounded-xl border p-8'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <h2 className='text-2xl font-semibold mb-6' style={{ color: 'var(--color-text-heading)' }}>Review & Publish</h2>

          <div className='space-y-4 mb-8'>
            <div>
              <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Tour Type</p>
              <p className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
                {isGuided ? 'Guided \u2014 You lead the group' : 'Self-Guided \u2014 Independent exploration'}
              </p>
            </div>
            <div>
              <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Title</p>
              <p className='font-medium' style={{ color: 'var(--color-text-heading)' }}>{tourInfo.title}</p>
            </div>
            <div>
              <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Description</p>
              <p className='text-sm' style={{ color: 'var(--color-text-body)' }}>{tourInfo.description}</p>
            </div>
            <div className={`grid ${isGuided ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
              <div>
                <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Price</p>
                <p className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
                  {tourInfo.price
                    ? `${tourInfo.currency} $${tourInfo.price} per person`
                    : 'Free'}
                </p>
              </div>
              {isGuided && (
                <div>
                  <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Max Participants</p>
                  <p className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
                    {tourInfo.maxParticipants || 'No limit'}
                  </p>
                </div>
              )}
              <div>
                <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>Stops</p>
                <p className='font-medium' style={{ color: 'var(--color-text-heading)' }}>{waypoints.length} locations</p>
              </div>
            </div>

            {/* Schedule summary for guided tours */}
            {isGuided && scheduleInfo.date && (
              <div className='rounded-lg p-4' style={{ backgroundColor: 'var(--color-primary-light)' }}>
                <p className='text-sm font-medium mb-2' style={{ color: 'var(--color-primary)' }}>First Session</p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
                  <div>
                    <span style={{ color: 'var(--color-primary)' }}>Date:</span>{' '}
                    <span style={{ color: 'var(--color-text-heading)' }}>{scheduleInfo.date}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-primary)' }}>Time:</span>{' '}
                    <span style={{ color: 'var(--color-text-heading)' }}>
                      {scheduleInfo.startTime}
                      {scheduleInfo.endTime && ` - ${scheduleInfo.endTime}`}
                    </span>
                  </div>
                  {scheduleInfo.meetingPoint && (
                    <div className='col-span-2'>
                      <span style={{ color: 'var(--color-primary)' }}>Meeting Point:</span>{' '}
                      <span style={{ color: 'var(--color-text-heading)' }}>{scheduleInfo.meetingPoint}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Waypoints summary */}
            <div>
              <p className='text-sm mb-2' style={{ color: 'var(--color-text-secondary)' }}>Route</p>
              <div className='space-y-2'>
                {waypoints.map((wp, i) => (
                  <div key={wp.id} className='flex items-center gap-2 text-sm'>
                    <span
                      className='text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0'
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {i + 1}
                    </span>
                    <span className='font-medium' style={{ color: 'var(--color-text-heading)' }}>{wp.title}</span>
                    {wp.description && (
                      <span style={{ color: 'var(--color-text-muted)' }}>&mdash; {wp.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='flex gap-4'>
            <button
              onClick={() => setStep(2)}
              className='flex-1 py-3 rounded-lg font-semibold hover:opacity-80 border'
              style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className='flex-1 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50'
              style={{ backgroundColor: 'var(--color-primary)' }}
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
        className='w-10 h-10 rounded-full flex items-center justify-center font-semibold'
        style={
          completed
            ? { backgroundColor: 'var(--color-success)', color: '#FFFFFF' }
            : active
            ? { backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }
            : { backgroundColor: 'var(--color-section-bg)', color: 'var(--color-text-secondary)' }
        }
      >
        {completed ? '\u2713' : number}
      </div>
      <p
        className='text-xs mt-2'
        style={{
          color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
          fontWeight: active ? 500 : 400,
        }}
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
      <div className='border rounded-lg p-4' style={{ borderColor: 'var(--color-card-border)' }}>
        <div className='flex items-center gap-2 mb-3'>
          <span
            className='text-white w-6 h-6 rounded-full flex items-center justify-center text-sm'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {index + 1}
          </span>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none'
            style={{ borderColor: 'var(--color-card-border)' }}
            placeholder='Stop name'
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className='w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none mb-3'
          style={{ borderColor: 'var(--color-card-border)' }}
          rows={2}
          placeholder='Description of this stop...'
        />
        <div className='flex gap-2'>
          <button
            onClick={() => onSave(title, description)}
            className='flex-1 text-white py-2 rounded text-sm hover:opacity-90'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Save
          </button>
          <button
            onClick={onRemove}
            className='px-4 py-2 rounded text-sm hover:opacity-80'
            style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className='border rounded-lg p-4 hover:opacity-90 transition cursor-pointer'
      style={{ borderColor: 'var(--color-card-border)' }}
      onClick={onEdit}
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-3'>
          <span
            className='text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0'
            style={{ backgroundColor: 'var(--color-text-secondary)' }}
          >
            {index + 1}
          </span>
          <div>
            <p className='font-medium' style={{ color: 'var(--color-text-heading)' }}>{waypoint.title}</p>
            {waypoint.description && (
              <p className='text-sm mt-1' style={{ color: 'var(--color-text-body)' }}>
                {waypoint.description}
              </p>
            )}
            <p className='text-xs mt-1' style={{ color: 'var(--color-text-muted)' }}>
              {waypoint.latitude.toFixed(6)}, {waypoint.longitude.toFixed(6)}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className='hover:opacity-80'
          style={{ color: 'var(--color-text-muted)' }}
        >
          &#10005;
        </button>
      </div>
    </div>
  )
}
