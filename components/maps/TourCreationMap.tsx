'use client'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents
} from 'react-leaflet'
import { getWalkingRoute } from '@/lib/osrmRoute'
import type { PlaceSummary } from '@/components/tours/PlaceSearchAutocomplete'

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

interface Waypoint {
  id: string
  latitude: number
  longitude: number
  title: string
  description: string
  order: number
  placeId?: string
  placeName?: string
}

interface TourCreationMapProps {
  waypoints: Waypoint[]
  onWaypointAdd: (lat: number, lng: number) => void
  onWaypointRemove: (id: string) => void
  /**
   * Places cercanos para mostrar como markers secundarios. Cuando el guía
   * tapea uno se agrega un waypoint linkeado con `placeId` + nombre.
   */
  nearbyPlaces?: PlaceSummary[]
  onPlaceClick?: (place: PlaceSummary) => void
  center?: [number, number]
}

export function TourCreationMap({
  waypoints,
  onWaypointAdd,
  onWaypointRemove,
  nearbyPlaces = [],
  onPlaceClick,
  center = [-34.6037, -58.3816] // Buenos Aires default
}: TourCreationMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [routePath, setRoutePath] = useState<[number, number][]>([])
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch OSRM walking route when waypoints change (debounced)
  const fetchRoute = useCallback(async (wps: Waypoint[]) => {
    if (wps.length < 2) {
      setRoutePath([])
      return
    }

    setIsLoadingRoute(true)
    try {
      const sorted = [...wps].sort((a, b) => a.order - b.order)
      const route = await getWalkingRoute(
        sorted.map((wp) => ({ latitude: wp.latitude, longitude: wp.longitude }))
      )
      setRoutePath(route)
    } catch (error) {
      console.error('Failed to fetch OSRM route:', error)
      // Fallback to straight lines
      const sorted = [...wps].sort((a, b) => a.order - b.order)
      setRoutePath(sorted.map((wp) => [wp.latitude, wp.longitude] as [number, number]))
    } finally {
      setIsLoadingRoute(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchRoute(waypoints)
    }, 500) // Debounce 500ms to avoid spamming OSRM during rapid edits
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [waypoints, fetchRoute])

  /**
   * Filtrar places ya agregados al tour para no duplicar markers.
   * `waypoint.placeId` es el único tie-break fiable — latitud/longitud
   * puede coincidir por azar en lugares grandes.
   */
  const usedPlaceIds = useMemo(
    () => new Set(waypoints.map((w) => w.placeId).filter(Boolean) as string[]),
    [waypoints]
  )

  const visiblePlaces = useMemo(
    () =>
      nearbyPlaces.filter(
        (p) => !!p.address && !usedPlaceIds.has(p.id)
      ),
    [nearbyPlaces, usedPlaceIds]
  )

  if (!isMounted) {
    return (
      <div className='w-full h-[600px] rounded-lg flex items-center justify-center' style={{ backgroundColor: 'var(--color-section-bg)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading map...</p>
      </div>
    )
  }

  // Fallback straight-line path (used while OSRM loads)
  const straightPath: [number, number][] = waypoints
    .sort((a, b) => a.order - b.order)
    .map((wp) => [wp.latitude, wp.longitude])

  const displayPath = routePath.length > 0 ? routePath : straightPath

  return (
    <div className='relative'>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '600px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        <MapClickHandler onMapClick={onWaypointAdd} />

        {/*
          Places cercanos. Se pintan como círculos teal, más chicos que los
          markers de waypoint, para no competir visualmente con la ruta ya
          construida. Click agrega el place como step.
        */}
        {visiblePlaces.map((place) => (
          <CircleMarker
            key={place.id}
            center={[place.address!.latitude, place.address!.longitude]}
            radius={8}
            pathOptions={{
              color: '#0D9488',
              fillColor: '#14B8A6',
              fillOpacity: 0.8,
              weight: 2
            }}
            eventHandlers={{
              click: () => {
                if (onPlaceClick) onPlaceClick(place)
              }
            }}
          >
            <Popup>
              <div className='p-2 min-w-[180px]'>
                <p className='font-semibold text-sm mb-1'>{place.name}</p>
                {place.address?.city && (
                  <p className='text-xs text-gray-600 mb-2'>
                    {place.address.city}
                    {place.address.country ? `, ${place.address.country}` : ''}
                  </p>
                )}
                {onPlaceClick && (
                  <button
                    onClick={() => onPlaceClick(place)}
                    className='w-full text-xs text-white py-1.5 rounded hover:opacity-90'
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Add as stop
                  </button>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Draw waypoints (stops already added to the tour) */}
        {waypoints.map((waypoint, index) => (
          <Marker
            key={waypoint.id}
            position={[waypoint.latitude, waypoint.longitude]}
          >
            <Popup>
              <div className='p-2'>
                <div className='flex justify-between items-start mb-2'>
                  <span className='font-semibold text-sm'>
                    Step {index + 1}
                  </span>
                  <button
                    onClick={() => onWaypointRemove(waypoint.id)}
                    className='text-xs'
                    style={{ color: 'var(--color-danger)' }}
                  >
                    Remove
                  </button>
                </div>
                <p className='font-medium text-sm'>{waypoint.title}</p>
                {waypoint.placeName && (
                  <p className='text-xs mt-0.5' style={{ color: 'var(--color-primary)' }}>
                    Linked: {waypoint.placeName}
                  </p>
                )}
                {waypoint.description && (
                  <p className='text-xs mt-1' style={{ color: 'var(--color-text-body)' }}>{waypoint.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Draw walking route between waypoints (OSRM) */}
        {displayPath.length > 1 && (
          <Polyline
            positions={displayPath}
            color='#0066CC'
            weight={4}
            opacity={0.8}
            dashArray={isLoadingRoute ? '10, 10' : undefined}
          />
        )}
      </MapContainer>

      {/* Instructions */}
      <div className='absolute top-4 right-4 p-4 rounded-lg shadow-lg max-w-xs z-[1000]' style={{ backgroundColor: 'var(--color-card-bg)' }}>
        <h3 className='font-semibold text-sm mb-2'>How to add stops:</h3>
        <ul className='text-xs space-y-1' style={{ color: 'var(--color-text-body)' }}>
          <li>
            <span
              className='inline-block w-2.5 h-2.5 rounded-full mr-1.5'
              style={{ backgroundColor: '#14B8A6' }}
            />
            Teal dots are known places. Click to add as a stop.
          </li>
          <li>• Or click anywhere on the map to add a custom stop.</li>
          <li>• Use the search box above to find places by name.</li>
        </ul>
      </div>
    </div>
  )
}

// Component to handle map clicks
function MapClickHandler({
  onMapClick
}: {
  onMapClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}
