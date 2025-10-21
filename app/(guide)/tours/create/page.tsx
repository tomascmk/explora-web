'use client'

import { useAuth } from '@/contexts/AuthContext'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

export default function CreateTourPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Tour basic info
  const [tourInfo, setTourInfo] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    maxParticipants: ''
  })

  // Tour waypoints
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [editingWaypoint, setEditingWaypoint] = useState<string | null>(null)

  const handleAddWaypoint = (lat: number, lng: number) => {
    const newWaypoint: Waypoint = {
      id: `waypoint-${Date.now()}`,
      latitude: lat,
      longitude: lng,
      title: `Stop ${waypoints.length + 1}`,
      description: '',
      order: waypoints.length + 1
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
    setLoading(true)

    try {
      // Create tour mutation
      const tourResponse = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            mutation CreateTour($input: CreateTourInput!) {
              createTour(createTourInput: $input) {
                id
                title
                description
              }
            }
          `,
          variables: {
            input: {
              title: tourInfo.title,
              description: tourInfo.description,
              guideId: user?.id
            }
          }
        })
      })

      const { data, errors } = await tourResponse.json()

      if (errors) {
        throw new Error(errors[0].message)
      }

      if (data?.createTour) {
        const tourId = data.createTour.id

        // Create tour steps
        for (const waypoint of waypoints) {
          await fetch('http://localhost:3001/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              query: `
                mutation CreateTourStep($input: CreateTourStepInput!) {
                  createTourStep(input: $input) {
                    id
                  }
                }
              `,
              variables: {
                input: {
                  tourId,
                  placeId: tourId, // TODO: Link to actual place
                  title: waypoint.title,
                  description: waypoint.description,
                  latitude: waypoint.latitude,
                  longitude: waypoint.longitude,
                  order: waypoint.order
                }
              }
            })
          })
        }

        // Success!
        alert('Tour created successfully!')
        router.push('/tours')
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create tour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold mb-8'>Create New Tour</h1>

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
                  Price per Person *
                </label>
                <input
                  type='number'
                  value={tourInfo.price}
                  onChange={(e) =>
                    setTourInfo({ ...tourInfo, price: e.target.value })
                  }
                  className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder='75'
                  required
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
            <h2 className='text-2xl font-semibold mb-4'>Plan Your Route</h2>
            <p className='text-gray-600 mb-6'>
              Click on the map to add stops to your tour. They will connect
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
                <p className='font-medium'>${tourInfo.price} per person</p>
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
              {loading ? 'Creating Tour...' : 'Publish Tour'}
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
