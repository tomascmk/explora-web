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
import { PLACES_IN_RADIUS_FOR_TOUR_BUILDER } from '@/graphql/places'
import {
  PlaceSearchAutocomplete,
  type PlaceSummary
} from '@/components/tours/PlaceSearchAutocomplete'
import { SortableWaypointItem } from '@/components/tours/SortableWaypointItem'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { PageHeader } from '@/components/ui/PageHeader'

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
  /**
   * Link opcional a un `Place` existente. Para steps que ya existían en
   * DB lo seteamos desde `tour.tourSteps[].place?.id` en el bootstrap
   * del form; para steps nuevos se llena al seleccionar un place vía
   * search o al tapear un marker en el mapa.
   */
  placeId?: string
  placeName?: string
}

const DEFAULT_MAP_CENTER: [number, number] = [-34.6037, -58.3816]
const NEARBY_RADIUS_METERS = 5000

interface PlacesInRadiusResult {
  getPlacesInRadius: PlaceSummary[]
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
      const tourTypeValue = tour.tourType === 'GUIDED' ? 'GUIDED' : 'SELF_GUIDED'

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
          placeId: s.place?.id ?? undefined,
          placeName: s.place?.name ?? undefined,
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

  // Places cercanos al centro del mapa — markers teal clickables.
  const { data: nearbyData } = useQuery<PlacesInRadiusResult>(
    PLACES_IN_RADIUS_FOR_TOUR_BUILDER,
    {
      variables: {
        input: {
          latitude: DEFAULT_MAP_CENTER[0],
          longitude: DEFAULT_MAP_CENTER[1],
          radius: NEARBY_RADIUS_METERS
        }
      },
      fetchPolicy: 'cache-first'
    }
  )
  const nearbyPlaces = nearbyData?.getPlacesInRadius ?? []

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

  /**
   * Agrega un stop desde un Place existente. `id` del waypoint empieza
   * con `new-` para que `handleSubmit` lo envíe como `createTourStep`.
   */
  const handleAddPlaceWaypoint = (place: PlaceSummary) => {
    if (!place.address) return
    if (waypoints.some((wp) => wp.placeId === place.id)) {
      toast.info('This place is already in your tour')
      return
    }
    const newWaypoint: Waypoint = {
      id: `new-${Date.now()}`,
      latitude: place.address.latitude,
      longitude: place.address.longitude,
      title: place.name,
      description: place.description ?? '',
      order: waypoints.length + 1,
      placeId: place.id,
      placeName: place.name
    }
    setWaypoints([...waypoints, newWaypoint])
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

  /**
   * Desvincular place de un waypoint. Para steps nuevos simplemente saca
   * el placeId antes de mandar al backend. Para steps existentes el
   * patch va vía `updateTourStep` — hoy no se manda placeId en el update
   * (UpdateTourStepInput es PartialType) así que el backend conservará
   * el viejo vínculo. TODO PLAN-021: permitir unlink explícito pasando
   * `placeId: null` o agregando `removePlaceFromStep` mutation.
   */
  const handleUnlinkPlace = (wpId: string) => {
    setWaypoints(
      waypoints.map((wp) =>
        wp.id === wpId ? { ...wp, placeId: undefined, placeName: undefined } : wp
      )
    )
  }

  // Sensores de @dnd-kit. PointerSensor con distance>0 evita hijackear
  // clicks → edit. KeyboardSensor da accesibilidad (Space para grab,
  // flechas para mover, Space para soltar).
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  /**
   * Drag-end de @dnd-kit: `arrayMove` calcula la lista nueva y
   * reescribimos `order` 1..N. El submit luego sincroniza con el
   * backend vía updateTourStep (para existentes) o createTourStep
   * (para nuevos que aún tienen `id` con prefijo `new-`).
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = waypoints.findIndex((wp) => wp.id === active.id)
    const newIndex = waypoints.findIndex((wp) => wp.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(waypoints, oldIndex, newIndex)
    setWaypoints(reordered.map((wp, i) => ({ ...wp, order: i + 1 })))
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
            tourType: tourInfo.tourType,
          },
        },
      })

      // 2. Delete removed steps
      for (const stepId of deletedStepIds) {
        await deleteTourStep({ variables: { id: stepId } })
      }

      // 3. Create/Update steps. `placeId` se envía sólo para creates —
      // el update no lo toca para no pisar el link existente en DB
      // (ver handleUnlinkPlace).
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
            variables: {
              input: {
                ...stepInput,
                tourId: id,
                ...(waypoint.placeId ? { placeId: waypoint.placeId } : {}),
              },
            },
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
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2' style={{ borderColor: 'var(--color-primary)' }} />
      </div>
    )
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
        <h1 className='text-3xl font-bold' style={{ color: 'var(--color-text-heading)' }}>Edit Tour</h1>
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

            {/* Price & Currency + Max Participants (guided only) */}
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

            {/* Existing Schedules (guided only) */}
            {isGuided && existingSchedules.length > 0 && (
              <div className='border-t pt-4 mt-4' style={{ borderColor: 'var(--color-card-border)' }}>
                <h3 className='text-lg font-medium mb-3' style={{ color: 'var(--color-text-heading)' }}>Scheduled Sessions</h3>
                <div className='space-y-2'>
                  {existingSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className='flex items-center justify-between rounded-lg p-3 text-sm'
                      style={{ backgroundColor: 'var(--color-primary-light)' }}
                    >
                      <div>
                        <span className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
                          {format(new Date(schedule.startTime), 'MMM dd, yyyy HH:mm')}
                        </span>
                        {schedule.endTime && (
                          <span style={{ color: 'var(--color-text-body)' }}>
                            {' '}- {format(new Date(schedule.endTime), 'HH:mm')}
                          </span>
                        )}
                        {schedule.specialInfo && (
                          <span className='ml-2' style={{ color: 'var(--color-text-muted)' }}>
                            ({schedule.specialInfo})
                          </span>
                        )}
                      </div>
                      <span
                        className='text-xs px-2 py-1 rounded-full'
                        style={
                          schedule.isAvailable
                            ? { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }
                            : { backgroundColor: 'var(--color-section-bg)', color: 'var(--color-text-secondary)' }
                        }
                      >
                        {schedule.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
                <p className='text-xs mt-2' style={{ color: 'var(--color-text-muted)' }}>
                  You can add more sessions from the Tours list page.
                </p>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!tourInfo.title || !tourInfo.description}
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
            <h2 className='text-2xl font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>Edit Route</h2>
            <p className='mb-4' style={{ color: 'var(--color-text-body)' }}>
              Add stops by searching for a known place, clicking a teal dot on
              the map, or clicking anywhere on the map for a custom stop.
            </p>

            <div className='mb-4'>
              <label
                className='block text-sm font-medium mb-2'
                style={{ color: 'var(--color-text-body)' }}
              >
                Search for a place
              </label>
              <PlaceSearchAutocomplete
                onSelect={handleAddPlaceWaypoint}
                excludedIds={waypoints
                  .map((w) => w.placeId)
                  .filter(Boolean) as string[]}
              />
            </div>

            <TourCreationMap
              waypoints={waypoints}
              onWaypointAdd={handleAddWaypoint}
              onWaypointRemove={handleRemoveWaypoint}
              nearbyPlaces={nearbyPlaces}
              onPlaceClick={handleAddPlaceWaypoint}
              center={DEFAULT_MAP_CENTER}
            />
          </div>

          {waypoints.length > 0 && (
            <div
              className='rounded-xl border p-6'
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
            >
              <h3 className='text-xl font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>
                Tour Stops ({waypoints.length})
              </h3>
              <p
                className='text-xs mb-3'
                style={{ color: 'var(--color-text-muted)' }}
              >
                Drag the handle on the left to reorder stops.
              </p>
              <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={waypoints.map((wp) => wp.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className='space-y-4'>
                    {waypoints.map((waypoint, index) => (
                      <SortableWaypointItem
                        key={waypoint.id}
                        waypoint={waypoint}
                        index={index}
                        isEditing={editingWaypoint === waypoint.id}
                        useEditPageStyles
                        onEdit={() => setEditingWaypoint(waypoint.id)}
                        onSave={(title, description) => {
                          handleUpdateWaypoint(waypoint.id, title, description)
                          setEditingWaypoint(null)
                        }}
                        onRemove={() => handleRemoveWaypoint(waypoint.id)}
                        onUnlinkPlace={() => handleUnlinkPlace(waypoint.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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
          <h2 className='text-2xl font-semibold mb-6' style={{ color: 'var(--color-text-heading)' }}>Review & Save</h2>

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

            {/* Existing schedules summary */}
            {isGuided && existingSchedules.length > 0 && (
              <div className='rounded-lg p-4' style={{ backgroundColor: 'var(--color-primary-light)' }}>
                <p className='text-sm font-medium mb-1' style={{ color: 'var(--color-primary)' }}>
                  {existingSchedules.length} scheduled session{existingSchedules.length > 1 ? 's' : ''}
                </p>
                <p className='text-xs' style={{ color: 'var(--color-primary)' }}>
                  Manage sessions from the Tours list page.
                </p>
              </div>
            )}

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

            {deletedStepIds.length > 0 && (
              <div
                className='border rounded-lg p-3'
                style={{ backgroundColor: 'var(--color-warning-light)', borderColor: 'var(--color-warning)' }}
              >
                <p className='text-sm' style={{ color: 'var(--color-warning)' }}>
                  {deletedStepIds.length} stop(s) will be removed when you save.
                </p>
              </div>
            )}
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

