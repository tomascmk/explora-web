'use client'

import { useAuth } from '@/contexts/AuthContext'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { format } from 'date-fns'
import { toast } from 'sonner'
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
import { ImageUpload } from '@/components/tours/ImageUpload'
import {
  PlaceSearchAutocomplete,
  type PlaceSummary
} from '@/components/tours/PlaceSearchAutocomplete'
import { SortableWaypointItem } from '@/components/tours/SortableWaypointItem'
import { PLACES_IN_RADIUS_FOR_TOUR_BUILDER } from '@/graphql/places'
import {
  CREATE_TOUR,
  CREATE_TOUR_STEP,
  CREATE_TOUR_PRICING,
  CREATE_TOUR_SCHEDULE,
  UPDATE_TOUR,
  type CreateTourData,
} from '@/graphql/tours'
import { getDisplayError } from '@/utils/errorMessages'

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
   * Si el waypoint se agregó seleccionando un Place existente (por search o
   * por tap en el marker del mapa), este campo tiene el id del place. El
   * backend lo guarda en `tour_step.place_id` vía `CreateTourStepInput`.
   * Los waypoints free-form (click libre en el mapa) lo dejan `undefined`.
   */
  placeId?: string
  placeName?: string
}

/** Fallback si la geolocalización del navegador no está disponible. */
const FALLBACK_MAP_CENTER: [number, number] = [-34.6037, -58.3816]
const NEARBY_RADIUS_METERS = 5000

interface PlacesInRadiusResult {
  getPlacesInRadius: PlaceSummary[]
}

export default function CreateTourPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>(FALLBACK_MAP_CENTER)

  // Detect guide's location for map center (fallback to Buenos Aires)
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {}, // Silently fall back
      { timeout: 5000 },
    )
  }, [])

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

  // Today's date in YYYY-MM-DD — used as `min` on the date input so the
  // native picker blocks past dates, and to validate on submit.
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  // Apollo Mutations
  const [createTour] = useMutation<CreateTourData>(CREATE_TOUR)
  const [createTourStep] = useMutation(CREATE_TOUR_STEP)
  const [createTourPricing] = useMutation(CREATE_TOUR_PRICING)
  const [createTourSchedule] = useMutation(CREATE_TOUR_SCHEDULE)
  const [updateTour] = useMutation(UPDATE_TOUR)

  const isGuided = tourInfo.tourType === 'GUIDED'

  // Places cercanos al centro del mapa — se muestran como markers teal
  // clickables y se excluyen los que ya están en la ruta.
  const { data: nearbyData } = useQuery<PlacesInRadiusResult>(
    PLACES_IN_RADIUS_FOR_TOUR_BUILDER,
    {
      variables: {
        input: {
          latitude: mapCenter[0],
          longitude: mapCenter[1],
          radius: NEARBY_RADIUS_METERS
        }
      },
      fetchPolicy: 'cache-first'
    }
  )
  const nearbyPlaces = nearbyData?.getPlacesInRadius ?? []

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

  /**
   * Agrega un stop linkeado a un Place existente. Se usa tanto desde el
   * autocomplete como desde el tap en un marker del mapa. No pone el
   * waypoint en modo edición porque el title ya viene útil — el guía
   * puede abrirlo si quiere customizar descripción.
   */
  const handleAddPlaceWaypoint = (place: PlaceSummary) => {
    if (!place.address) return
    if (waypoints.some((wp) => wp.placeId === place.id)) {
      toast.info('This place is already in your tour')
      return
    }
    const newWaypoint: Waypoint = {
      id: `waypoint-${Date.now()}`,
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

  /**
   * Desvincular el place de un waypoint — el stop sigue existiendo con
   * sus coords + título pero `placeId` se limpia. Útil cuando el guía
   * empezó desde un place y luego prefiere customizar el step sin linkeo.
   */
  const handleUnlinkPlace = (id: string) => {
    setWaypoints(
      waypoints.map((wp) =>
        wp.id === id ? { ...wp, placeId: undefined, placeName: undefined } : wp
      )
    )
  }

  // Sensores de @dnd-kit. PointerSensor con `distance: 5` evita que un
  // simple click arranque un drag (si el user clickea para editar el
  // stop no queremos consumir el evento como drag). KeyboardSensor con
  // las coordinates sortables da accesibilidad completa.
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  /**
   * Handler del drag-end de @dnd-kit. `active.id` es el id del waypoint
   * que se arrastró; `over.id` el del item sobre el que se soltó.
   * `arrayMove` computa el nuevo orden y luego reescribimos `order`
   * 1..N para mantener el contrato con el backend. OSRM re-rutea
   * automáticamente vía el useEffect de TourCreationMap.
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
    if (!user?.id) {
      toast.error('You must be logged in to create a tour')
      return
    }

    // Guided-only: validate the first session's date/time before hitting
    // the API. Mirrors the validations in the Add Session modal at
    // app/(guide)/tours/page.tsx (PLAN-017 fix #3).
    if (isGuided && scheduleInfo.date && scheduleInfo.startTime) {
      const startDateTime = new Date(
        `${scheduleInfo.date}T${scheduleInfo.startTime}:00`
      )
      if (Number.isNaN(startDateTime.getTime())) {
        toast.error('Invalid session date or start time')
        return
      }
      if (startDateTime.getTime() < Date.now()) {
        toast.error('Sessions cannot be scheduled in the past')
        return
      }
      if (scheduleInfo.endTime) {
        const endDateTime = new Date(
          `${scheduleInfo.date}T${scheduleInfo.endTime}:00`
        )
        if (Number.isNaN(endDateTime.getTime()) || endDateTime <= startDateTime) {
          toast.error('End time must be after start time')
          return
        }
      }
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
            tourType: tourInfo.tourType,
          },
        },
      })

      const tourId = tourData?.createTour?.id
      if (!tourId) throw new Error('Failed to create tour')

      // 2. Create TourSteps in parallel. `placeId` se envía sólo cuando el
      // step fue agregado desde un Place existente — el backend deja el
      // campo null en steps free-form.
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
              ...(waypoint.placeId ? { placeId: waypoint.placeId } : {}),
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
    } catch (error) {
      console.error('Error creating tour:', error)
      toast.error(getDisplayError(error))
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
                      min={todayStr}
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
            <p className='mb-4' style={{ color: 'var(--color-text-body)' }}>
              Add stops by searching for a known place, clicking a teal dot on
              the map, or clicking anywhere on the map for a custom stop.
            </p>

            {/* Search existing places */}
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
              center={mapCenter}
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

