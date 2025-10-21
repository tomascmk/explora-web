'use client'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents
} from 'react-leaflet'

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
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
}

interface TourCreationMapProps {
  waypoints: Waypoint[]
  onWaypointAdd: (lat: number, lng: number) => void
  onWaypointRemove: (id: string) => void
  center?: [number, number]
}

export function TourCreationMap({
  waypoints,
  onWaypointAdd,
  onWaypointRemove,
  center = [-34.6037, -58.3816] // Buenos Aires default
}: TourCreationMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className='w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center'>
        <p className='text-gray-500'>Loading map...</p>
      </div>
    )
  }

  // Convert waypoints to path for polyline
  const path: [number, number][] = waypoints
    .sort((a, b) => a.order - b.order)
    .map((wp) => [wp.latitude, wp.longitude])

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

        {/* Draw waypoints */}
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
                    className='text-red-600 hover:text-red-800 text-xs'
                  >
                    Remove
                  </button>
                </div>
                <p className='font-medium text-sm'>{waypoint.title}</p>
                <p className='text-xs text-gray-600'>{waypoint.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Draw path between waypoints */}
        {path.length > 1 && (
          <Polyline positions={path} color='#0066CC' weight={3} opacity={0.7} />
        )}
      </MapContainer>

      {/* Instructions */}
      <div className='absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs z-[1000]'>
        <h3 className='font-semibold text-sm mb-2'>How to add waypoints:</h3>
        <ul className='text-xs text-gray-600 space-y-1'>
          <li>• Click on map to add a new waypoint</li>
          <li>• Click marker to see details or remove</li>
          <li>• Waypoints connect in order automatically</li>
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
