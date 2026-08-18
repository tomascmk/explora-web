'use client'

import { useMutation } from '@apollo/client/react'
import { format } from 'date-fns'
import { useState } from 'react'
import {
  CREATE_TOUR_SCHEDULE,
  REMOVE_TOUR_SCHEDULE,
  UPDATE_TOUR_SCHEDULE,
} from '@/graphql/tours'

export interface TourScheduleRow {
  id: string
  startTime: string
  endTime?: string | null
  isAvailable: boolean
  maxCapacity?: number | null
  specialInfo?: string | null
  reservations?: { id: string }[] | null
}

interface Props {
  tourId: string
  schedules: TourScheduleRow[]
  onChanged: () => void
}

interface DraftState {
  date: string
  startTime: string
  endTime: string
  maxCapacity: string
  specialInfo: string
  isAvailable: boolean
}

const emptyDraft: DraftState = {
  date: '',
  startTime: '',
  endTime: '',
  maxCapacity: '',
  specialInfo: '',
  isAvailable: true,
}

const toIso = (date: string, time: string) =>
  new Date(`${date}T${time}:00`).toISOString()

const draftFromRow = (row: TourScheduleRow): DraftState => {
  const start = new Date(row.startTime)
  return {
    date: format(start, 'yyyy-MM-dd'),
    startTime: format(start, 'HH:mm'),
    endTime: row.endTime ? format(new Date(row.endTime), 'HH:mm') : '',
    maxCapacity: row.maxCapacity != null ? String(row.maxCapacity) : '',
    specialInfo: row.specialInfo ?? '',
    isAvailable: row.isAvailable,
  }
}

/**
 * PLAN-071 §3b — Gestion de disponibilidad de un tour guiado.
 *
 * Antes, `tours/create` creaba UN horario inicial y `tours/[id]/edit` solo los
 * listaba en modo lectura: un guia no podia corregir una fecha mal cargada,
 * agregar mas, cambiar el cupo ni dar de baja una sesion.
 *
 * Las reglas de negocio (ownership del tour, no borrar con reservas activas,
 * no bajar el cupo por debajo de lo reservado, no mover el horario a otro
 * tour) viven en el servidor — PLAN-071 §0b. Lo de aca es UX: evitar el viaje
 * de ida y vuelta cuando ya sabemos que va a fallar.
 */
export function TourScheduleManager({ tourId, schedules, onChanged }: Props) {
  const [draft, setDraft] = useState<DraftState>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const [createSchedule] = useMutation(CREATE_TOUR_SCHEDULE)
  const [updateSchedule] = useMutation(UPDATE_TOUR_SCHEDULE)
  const [removeSchedule] = useMutation(REMOVE_TOUR_SCHEDULE)

  const reset = () => {
    setDraft(emptyDraft)
    setEditingId(null)
    setError('')
  }

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setError('')
    try {
      await fn()
      onChanged()
      reset()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const handleSubmit = async () => {
    if (!draft.date || !draft.startTime) {
      setError('Date and start time are required')
      return
    }
    const capacity =
      draft.maxCapacity.trim() === '' ? undefined : Number(draft.maxCapacity)
    if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 1)) {
      setError('Capacity must be a whole number of 1 or more')
      return
    }

    const base = {
      startTime: toIso(draft.date, draft.startTime),
      endTime: draft.endTime ? toIso(draft.date, draft.endTime) : undefined,
      maxCapacity: capacity,
      specialInfo: draft.specialInfo.trim() || undefined,
      isAvailable: draft.isAvailable,
    }

    if (base.endTime && base.endTime <= base.startTime) {
      setError('End time must be after the start time')
      return
    }

    await run(() =>
      editingId
        ? updateSchedule({ variables: { input: { id: editingId, ...base } } })
        : // `tourId` solo se manda al crear: mover un horario existente a otro
          // tour se lleva sus reservas y el servidor lo rechaza.
          createSchedule({ variables: { input: { tourId, ...base } } }),
    )
  }

  const handleDelete = async (row: TourScheduleRow) => {
    const booked = row.reservations?.length ?? 0
    if (booked > 0) {
      setError(
        `This session has ${booked} reservation(s) and cannot be deleted. Mark it as unavailable instead.`,
      )
      return
    }
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    await run(() => removeSchedule({ variables: { id: row.id } }))
  }

  return (
    <div
      className='border-t pt-4 mt-4'
      style={{ borderColor: 'var(--color-card-border)' }}
      data-testid='schedule-manager'
    >
      <h3
        className='text-lg font-medium mb-3'
        style={{ color: 'var(--color-text-heading)' }}
      >
        Scheduled Sessions
      </h3>

      {error && (
        <div
          className='px-4 py-3 mb-3 rounded-lg text-sm font-medium border'
          style={{
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            borderColor: 'var(--color-danger)',
          }}
          role='alert'
        >
          {error}
        </div>
      )}

      {schedules.length === 0 ? (
        <p
          className='text-sm mb-3'
          style={{ color: 'var(--color-text-muted)' }}
          data-testid='schedule-empty'
        >
          No sessions yet. Add the first one below so travellers can book.
        </p>
      ) : (
        <div className='space-y-2 mb-4'>
          {schedules.map((row) => {
            const booked = row.reservations?.length ?? 0
            return (
              <div
                key={row.id}
                className='flex items-center justify-between rounded-lg p-3 text-sm gap-3'
                style={{ backgroundColor: 'var(--color-primary-light)' }}
                data-testid={`schedule-row-${row.id}`}
              >
                <div className='min-w-0'>
                  <span
                    className='font-medium'
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    {format(new Date(row.startTime), 'MMM dd, yyyy HH:mm')}
                  </span>
                  {row.endTime && (
                    <span style={{ color: 'var(--color-text-body)' }}>
                      {' '}
                      - {format(new Date(row.endTime), 'HH:mm')}
                    </span>
                  )}
                  {row.maxCapacity != null && (
                    <span
                      className='ml-2'
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      · {booked}/{row.maxCapacity} booked
                    </span>
                  )}
                  {row.specialInfo && (
                    <span
                      className='ml-2'
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      ({row.specialInfo})
                    </span>
                  )}
                </div>
                <div className='flex items-center gap-2 shrink-0'>
                  <span
                    className='text-xs px-2 py-1 rounded-full'
                    style={{
                      backgroundColor: row.isAvailable
                        ? 'var(--color-success-light)'
                        : 'var(--color-card-border)',
                      color: row.isAvailable
                        ? 'var(--color-success)'
                        : 'var(--color-text-muted)',
                    }}
                  >
                    {row.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <button
                    type='button'
                    onClick={() => {
                      setEditingId(row.id)
                      setDraft(draftFromRow(row))
                      setError('')
                    }}
                    className='text-xs font-semibold hover:underline'
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Edit
                  </button>
                  <button
                    type='button'
                    onClick={() => handleDelete(row)}
                    disabled={busy}
                    className='text-xs font-semibold hover:underline disabled:opacity-50'
                    style={{ color: 'var(--color-danger)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div
        className='rounded-lg p-3 space-y-3'
        style={{ backgroundColor: 'var(--color-card-bg)' }}
      >
        <p
          className='text-sm font-medium'
          style={{ color: 'var(--color-text-heading)' }}
        >
          {editingId ? 'Edit session' : 'Add a session'}
        </p>
        <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
          <label className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
            Date
            <input
              type='date'
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className='w-full mt-1 px-2 py-2 rounded border'
              style={{ borderColor: 'var(--color-card-border)' }}
            />
          </label>
          <label className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
            Start
            <input
              type='time'
              value={draft.startTime}
              onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
              className='w-full mt-1 px-2 py-2 rounded border'
              style={{ borderColor: 'var(--color-card-border)' }}
            />
          </label>
          <label className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
            End (optional)
            <input
              type='time'
              value={draft.endTime}
              onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
              className='w-full mt-1 px-2 py-2 rounded border'
              style={{ borderColor: 'var(--color-card-border)' }}
            />
          </label>
          <label className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
            Capacity
            <input
              type='number'
              min={1}
              value={draft.maxCapacity}
              onChange={(e) =>
                setDraft({ ...draft, maxCapacity: e.target.value })
              }
              className='w-full mt-1 px-2 py-2 rounded border'
              style={{ borderColor: 'var(--color-card-border)' }}
            />
          </label>
        </div>
        <input
          type='text'
          placeholder='Notes for travellers (optional)'
          value={draft.specialInfo}
          onChange={(e) => setDraft({ ...draft, specialInfo: e.target.value })}
          className='w-full px-2 py-2 rounded border text-sm'
          style={{ borderColor: 'var(--color-card-border)' }}
        />
        <label
          className='flex items-center gap-2 text-sm'
          style={{ color: 'var(--color-text-body)' }}
        >
          <input
            type='checkbox'
            checked={draft.isAvailable}
            onChange={(e) =>
              setDraft({ ...draft, isAvailable: e.target.checked })
            }
          />
          Open for bookings
        </label>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={busy}
            className='px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {editingId ? 'Save session' : 'Add session'}
          </button>
          {editingId && (
            <button
              type='button'
              onClick={reset}
              className='px-4 py-2 rounded-lg text-sm font-semibold'
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
