'use client'

import { useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

/**
 * Shape mínimo que `SortableWaypointItem` necesita del waypoint. Tanto
 * la página de create como la de edit extienden este tipo con sus
 * propios campos (placeId, placeName). Usamos un generic `WP extends
 * WaypointShape` en el componente para preservar los campos extras en
 * los callbacks tipados (no hace falta aquí, pero lo dejamos abierto).
 */
export interface WaypointShape {
  id: string
  latitude: number
  longitude: number
  title: string
  description: string
  order: number
  placeId?: string
  placeName?: string
}

interface SortableWaypointItemProps {
  waypoint: WaypointShape
  index: number
  isEditing: boolean
  /**
   * Si `true`, el modo "display" renderiza con el fondo alterno que usa
   * la página de edit (más oscuro para contrastar con la lista). En
   * create siempre es `false` porque el fondo del padre ya contrasta.
   */
  useEditPageStyles?: boolean
  onEdit: () => void
  onSave: (title: string, description: string) => void
  onRemove: () => void
  onUnlinkPlace?: () => void
}

/**
 * Waypoint con drag-and-drop nativo de @dnd-kit/sortable. El drag se
 * inicia desde el handle (GripVertical) para no colisionar con el
 * `onClick` → edit del resto de la card. @dnd-kit se encarga de los
 * drop indicators y de la animación suave vía `transform`/`transition`.
 *
 * La coordinación entre items vive en el padre: `DndContext` +
 * `SortableContext` con `verticalListSortingStrategy`. Ver
 * `app/(guide)/tours/create/page.tsx` y `.../edit/page.tsx`.
 */
export function SortableWaypointItem({
  waypoint,
  index,
  isEditing,
  useEditPageStyles = false,
  onEdit,
  onSave,
  onRemove,
  onUnlinkPlace
}: SortableWaypointItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: waypoint.id })

  const [title, setTitle] = useState(waypoint.title)
  const [description, setDescription] = useState(waypoint.description)

  // Sync local state cuando el parent actualiza waypoint (ej. después
  // de un reorder). Sin esto, el item arrastrado conservaría valores
  // viejos al entrar a edit mode.
  useEffect(() => {
    setTitle(waypoint.title)
    setDescription(waypoint.description)
  }, [waypoint.title, waypoint.description])

  // Combinación de transform + transition que da la animación smooth al
  // mover/hacer swap. `isDragging` baja el z-index al item activo para
  // que se ponga arriba de sus vecinos durante el drag.
  const rootStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.15)' : undefined,
    opacity: isDragging ? 0.9 : 1
  }

  const dragHandle = (
    <button
      type='button'
      aria-label='Drag to reorder'
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}
      className='flex-shrink-0 p-1 -ml-1 cursor-grab active:cursor-grabbing hover:opacity-80 touch-none'
      style={{ color: 'var(--color-text-muted)' }}
    >
      <GripVertical className='w-4 h-4' />
    </button>
  )

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...rootStyle,
          borderColor: 'var(--color-card-border)',
          backgroundColor: useEditPageStyles
            ? 'var(--color-primary-light)'
            : 'var(--color-card-bg)'
        }}
        className='border rounded-lg p-4'
      >
        <div className='flex items-center gap-2 mb-3'>
          {dragHandle}
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
        {waypoint.placeName && (
          <div
            className='flex items-center justify-between text-xs px-3 py-2 mb-3 rounded'
            style={{
              backgroundColor: useEditPageStyles
                ? 'var(--color-card-bg)'
                : 'var(--color-primary-light)',
              color: 'var(--color-primary)'
            }}
          >
            <span>Linked to place: {waypoint.placeName}</span>
            {onUnlinkPlace && (
              <button
                type='button'
                onClick={onUnlinkPlace}
                className='underline hover:opacity-80'
              >
                Unlink
              </button>
            )}
          </div>
        )}
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
            style={{
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)'
            }}
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...rootStyle,
        borderColor: 'var(--color-card-border)',
        backgroundColor: useEditPageStyles
          ? 'var(--color-card-bg)'
          : undefined
      }}
      className='border rounded-lg p-4 hover:opacity-90 transition cursor-pointer'
      onClick={onEdit}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-start gap-3 flex-1 min-w-0'>
          {dragHandle}
          <span
            className='text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0'
            style={{ backgroundColor: 'var(--color-text-secondary)' }}
          >
            {index + 1}
          </span>
          <div className='flex-1 min-w-0'>
            <p
              className='font-medium'
              style={{ color: 'var(--color-text-heading)' }}
            >
              {waypoint.title}
            </p>
            {waypoint.placeName && (
              <span
                className='inline-block text-xs px-2 py-0.5 rounded-full mt-1'
                style={{
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)'
                }}
              >
                Linked: {waypoint.placeName}
              </span>
            )}
            {waypoint.description && (
              <p
                className='text-sm mt-1'
                style={{ color: 'var(--color-text-body)' }}
              >
                {waypoint.description}
              </p>
            )}
            <p
              className='text-xs mt-1'
              style={{ color: 'var(--color-text-muted)' }}
            >
              {waypoint.latitude.toFixed(6)},{' '}
              {waypoint.longitude.toFixed(6)}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className='hover:opacity-80 p-1'
          style={{ color: 'var(--color-text-muted)' }}
          aria-label='Remove stop'
        >
          &#10005;
        </button>
      </div>
    </div>
  )
}
