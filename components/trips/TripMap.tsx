'use client'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap
} from 'react-leaflet'
import type { TripPostData } from '@/graphql/trips'

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

function createNumberedIcon(number: number): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="
        background-color: #14B8A6;
        width: 32px; height: 32px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: bold; font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${number}</div>
    `,
    className: 'trip-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}

function FitBounds({ positions }: { positions: L.LatLngExpression[] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }
  }, [positions, map])
  return null
}

interface TripMapProps {
  tripPosts: TripPostData[]
  style?: React.CSSProperties
}

export default function TripMap({ tripPosts, style }: TripMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const postsWithCoords = useMemo(
    () =>
      tripPosts
        .filter((tp) => tp.post.latitude != null && tp.post.longitude != null)
        .sort((a, b) => a.order - b.order),
    [tripPosts]
  )

  const positions: [number, number][] = useMemo(
    () =>
      postsWithCoords.map((tp) => [tp.post.latitude!, tp.post.longitude!]),
    [postsWithCoords]
  )

  if (!isMounted || postsWithCoords.length === 0) {
    return (
      <div
        className='flex items-center justify-center rounded-2xl'
        style={{
          ...style,
          backgroundColor: 'var(--color-section-bg)'
        }}
      >
        <p style={{ color: 'var(--color-text-muted)' }}>No map data available</p>
      </div>
    )
  }

  const center = positions[0]

  return (
    <div style={style} className='rounded-2xl overflow-hidden'>
      <MapContainer
        center={center}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <FitBounds positions={positions} />

        {/* Polyline connecting posts */}
        <Polyline
          positions={positions}
          pathOptions={{
            color: '#14B8A6',
            weight: 3,
            opacity: 0.7,
            dashArray: '8, 8'
          }}
        />

        {/* Numbered markers */}
        {postsWithCoords.map((tp, index) => (
          <Marker
            key={tp.id}
            position={[tp.post.latitude!, tp.post.longitude!]}
            icon={createNumberedIcon(index + 1)}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <p style={{ fontWeight: 600, margin: '0 0 4px 0', color: '#0F172A' }}>
                  {tp.post.author.fullName}
                </p>
                {tp.post.location && (
                  <p style={{ fontSize: 12, margin: '0 0 6px 0', color: '#64748B' }}>
                    {tp.post.location}
                  </p>
                )}
                <p style={{ fontSize: 13, margin: 0, color: '#334155', lineHeight: 1.4 }}>
                  {tp.post.content.length > 120
                    ? tp.post.content.slice(0, 120) + '...'
                    : tp.post.content}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
