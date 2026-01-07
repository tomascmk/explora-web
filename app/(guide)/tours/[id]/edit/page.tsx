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
  DELETE_TOUR_STEP 
} from '@/graphql/tours'
import { toast } from 'sonner'

// Import map component dynamically to avoid SSR issues with Leaflet
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

interface Tour {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  tourSteps: Waypoint[]
}

interface GetTourData {
  tour: Tour
}

interface GetTourVars {
  id: string
}

interface UpdateTourData {
  updateTour: {
    id: string
    title: string
    description: string
  }
}

interface UpdateTourVars {
  input: {
    id: string
    title: string
    description: string
    guideId: string | undefined
  }
}

interface CreateStepData {
  createTourStep: { id: string }
}

interface CreateStepVars {
  input: {
    tourId: string
    title: string
    description: string
    latitude: number
    longitude: number
    order: number
  }
}

interface UpdateStepData {
  updateTourStep: { id: string }
}

interface UpdateStepVars {
  input: {
    id: string
    title: string
    description: string
    latitude: number
    longitude: number
    order: number
  }
}

interface DeleteStepData {
  removeTourStep: { success: boolean; message: string }
}

interface DeleteStepVars {
  id: string
}

export default function EditTourPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Tour basic info
  const [tourInfo, setTourInfo] = useState({
    title: '',
    description: '',
    price: '', // Note: Backend doesn't support price yet, keeping for UI consistency
    duration: '',
    maxParticipants: ''
  })

  // Tour waypoints
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [editingWaypoint, setEditingWaypoint] = useState<string | null>(null)
  
  // Track deleted steps
  const [deletedStepIds, setDeletedStepIds] = useState<string[]>([])

  // Fetch tour data
  const { data: fetchData, loading: fetchLoading } = useQuery<GetTourData, GetTourVars>(GET_TOUR_BY_ID, {
    variables: { id },
    skip: !id
  })

  useEffect(() => {
    if (fetchData?.tour) {
      const tour = fetchData.tour
      setTourInfo({
        title: tour.title || '',
        description: tour.description || '',
        price: '', 
        duration: '',
        maxParticipants: ''
      })
      
      const tourSteps = (tour.tourSteps || []).map((s: any) => ({
        id: s.id,
        latitude: s.latitude,
        longitude: s.longitude,
        title: s.title || '',
        description: s.description || '',
        order: s.order
      })).sort((a: Waypoint, b: Waypoint) => a.order - b.order)
      
      setWaypoints(tourSteps)
    }
  }, [fetchData])

  // Mutations
  const [updateTour] = useMutation<UpdateTourData, UpdateTourVars>(UPDATE_TOUR)
  const [createTourStep] = useMutation<CreateStepData, CreateStepVars>(CREATE_TOUR_STEP)
  const [updateTourStep] = useMutation<UpdateStepData, UpdateStepVars>(UPDATE_TOUR_STEP)
  const [deleteTourStep] = useMutation<DeleteStepData, DeleteStepVars>(DELETE_TOUR_STEP)

  const handleAddWaypoint = (lat: number, lng: number) => {
    const newWaypoint: Waypoint = {
      id: `new-${Date.now()}`, // Temporary prefix for new steps
      latitude: lat,
      longitude: lng,
      title: `Stop ${waypoints.length + 1}`,
      description: '',
      order: waypoints.length + 1
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
    id: string,
    title: string,
    description: string
  ) => {
    setWaypoints(
      waypoints.map((wp) => (wp.id === id ? { ...wp, title, description } : wp))
    )
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // 1. Update basic tour info
      await updateTour({
        variables: {
          input: {
            id,
            title: tourInfo.title,
            description: tourInfo.description,
            guideId: user?.id
          }
        }
      })

      // 2. Handle tour steps
      // Delete removed steps
      for (const stepId of deletedStepIds) {
        await deleteTourStep({ variables: { id: stepId } })
      }

      // Update existing or create new steps
      const stepPromises = waypoints.map((waypoint, index) => {
        const stepInput = {
          title: waypoint.title,
          description: waypoint.description,
          latitude: waypoint.latitude,
          longitude: waypoint.longitude,
          order: index + 1 // Recalculate order based on current list
        }

        if (waypoint.id.startsWith('new-')) {
          return createTourStep({
            variables: {
              input: {
                ...stepInput,
                tourId: id
              }
            }
          })
        } else {
          return updateTourStep({
            variables: {
              input: {
                ...stepInput,
                id: waypoint.id
              }
            }
          })
        }
      })

      await Promise.all(stepPromises)

      toast.success('Tour updated successfully!')
      router.push('/tours')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tour')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className='p-8 flex justify-center items-center h-64'>
        <div className='text-gray-600'>Loading tour data...</div>
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
        <StepIndicator number={1} label='Basic Info' active={step === 1} />
        <div className='w-20 h-0.5 bg-gray-300 mx-2'></div>
        <StepIndicator number={2} label='Route & Stops' active={step === 2} />
        <div className='w-20 h-0.5 bg-gray-300 mx-2'></div>
        <StepIndicator number={3} label='Review' active={step === 3} />
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className='max-w-2xl mx-auto bg-white rounded-lg shadow p-8'>
          <h2 className='text-2xl font-semibold mb-6'>Tour Information</h2>
          <div className='space-y-4'>
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
                placeholder='Historic City Walking Tour'
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
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Price per Person (Coming soon)
                </label>
                <input
                  type='number'
                  value={tourInfo.price}
                  disabled
                  className='w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-400'
                  placeholder='75'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Duration (hours)
                </label>
                <input
                  type='number'
                  value={tourInfo.duration}
                  onChange={(e) =>
                    setTourInfo({ ...tourInfo, duration: e.target.value })
                  }
                  className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder='3'
                />
              </div>
            </div>
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
            <h2 className='text-2xl font-semibold mb-4'>Update Your Route</h2>
            <p className='text-gray-600 mb-6'>
              Modify your tour route. Click on the map to add new stops.
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
          <h2 className='text-2xl font-semibold mb-6'>Review & Save Changes</h2>

          <div className='space-y-4 mb-8'>
            <div>
              <p className='text-sm text-gray-600'>Title</p>
              <p className='font-medium'>{tourInfo.title}</p>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Description</p>
              <p className='text-sm'>{tourInfo.description}</p>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-600'>Price</p>
                <p className='font-medium'>{tourInfo.price ? `$${tourInfo.price}` : 'Not set'}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Stops</p>
                <p className='font-medium'>{waypoints.length} locations</p>
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
              disabled={loading}
              className='flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50'
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
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
  active
}: {
  number: number
  label: string
  active: boolean
}) {
  return (
    <div className='flex flex-col items-center'>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
          active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}
      >
        {number}
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
  onRemove
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
            placeholder='Stop title'
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
