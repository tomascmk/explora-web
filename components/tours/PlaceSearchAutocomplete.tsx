'use client'

import { useEffect, useRef, useState } from 'react'
import { useLazyQuery } from '@apollo/client/react'
import { Search, MapPin, Star } from 'lucide-react'
import { SEARCH_PLACES } from '@/graphql/places'

export interface PlaceSummary {
  id: string
  name: string
  description?: string | null
  rate?: number | null
  address?: {
    id: string
    city?: string | null
    country?: string | null
    latitude: number
    longitude: number
  } | null
  categories?: { id: string; nameEn: string; nameEs?: string | null }[] | null
}

interface SearchPlacesResult {
  searchPlaces: PlaceSummary[]
}

interface PlaceSearchAutocompleteProps {
  onSelect: (place: PlaceSummary) => void
  placeholder?: string
  /**
   * Cuando true, el input se limpia después de seleccionar un resultado.
   * Útil para el panel "Add stop" donde el guía puede agregar varios
   * seguidos sin borrar a mano.
   */
  clearOnSelect?: boolean
  /**
   * Ocultar resultados cuyo id esté en esta lista. Se usa para filtrar
   * places ya agregados al tour.
   */
  excludedIds?: string[]
}

const DEBOUNCE_MS = 300
const MIN_CHARS = 2
const MAX_RESULTS = 10

export function PlaceSearchAutocomplete({
  onSelect,
  placeholder = 'Search for a place (e.g. Cabildo, Teatro Colón)',
  clearOnSelect = true,
  excludedIds = []
}: PlaceSearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [runSearch, { data, loading }] =
    useLazyQuery<SearchPlacesResult>(SEARCH_PLACES)

  // Debounce + min-char guard. Cuando el query queda corto cerramos el
  // dropdown para evitar mostrar el último resultado desactualizado.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < MIN_CHARS) {
      setIsOpen(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      runSearch({ variables: { query: query.trim(), limit: MAX_RESULTS } })
      setIsOpen(true)
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, runSearch])

  // Cerrar al clickear fuera.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (place: PlaceSummary) => {
    onSelect(place)
    setIsOpen(false)
    if (clearOnSelect) setQuery('')
  }

  const results = (data?.searchPlaces ?? []).filter(
    (p) => !excludedIds.includes(p.id) && !!p.address
  )

  return (
    <div ref={containerRef} className='relative'>
      <div className='relative'>
        <Search
          className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4'
          style={{ color: 'var(--color-text-muted)' }}
        />
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= MIN_CHARS) setIsOpen(true)
          }}
          placeholder={placeholder}
          className='w-full pl-9 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
          style={{
            borderColor: 'var(--color-card-border)',
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text-heading)'
          }}
        />
      </div>

      {isOpen && (
        <div
          className='absolute mt-1 w-full rounded-lg border shadow-lg max-h-80 overflow-y-auto'
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
            // Leaflet tile/pane z-index llega a ~600; el instructions card
            // del mapa usa 1000. 1100 asegura que el dropdown flote arriba
            // de todo sin tapar modales de la app (z >= 9000).
            zIndex: 1100
          }}
        >
          {loading && (
            <div
              className='px-4 py-3 text-sm'
              style={{ color: 'var(--color-text-muted)' }}
            >
              Searching...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div
              className='px-4 py-3 text-sm'
              style={{ color: 'var(--color-text-muted)' }}
            >
              No places found. Try a different search or pick on the map.
            </div>
          )}

          {!loading &&
            results.map((place) => (
              <button
                key={place.id}
                type='button'
                onClick={() => handleSelect(place)}
                className='w-full text-left px-4 py-3 hover:opacity-80 transition flex items-start gap-3 border-b last:border-b-0'
                style={{ borderColor: 'var(--color-card-border)' }}
              >
                <MapPin
                  className='w-4 h-4 mt-1 flex-shrink-0'
                  style={{ color: 'var(--color-primary)' }}
                />
                <div className='flex-1 min-w-0'>
                  <p
                    className='font-medium truncate'
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    {place.name}
                  </p>
                  <div
                    className='text-xs mt-0.5 flex items-center gap-2'
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {place.address?.city && (
                      <span className='truncate'>
                        {place.address.city}
                        {place.address.country
                          ? `, ${place.address.country}`
                          : ''}
                      </span>
                    )}
                    {typeof place.rate === 'number' && place.rate > 0 && (
                      <span className='inline-flex items-center gap-0.5'>
                        <Star className='w-3 h-3' />
                        {place.rate.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {place.categories && place.categories.length > 0 && (
                    <p
                      className='text-xs mt-0.5 truncate'
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {place.categories
                        .map((c) => c.nameEn)
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
