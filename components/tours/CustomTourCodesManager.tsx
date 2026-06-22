'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  CREATE_CUSTOM_TOUR_CODE,
  CUSTOM_TOUR_CODES_FOR_TOUR,
  REVOKE_CUSTOM_TOUR_CODE,
  type CustomTourCode,
} from '@/graphql/customTourCodes'
import { getDisplayError } from '@/utils/errorMessages'

/** Base pública del deep-link de canje en la app/web. */
const REDEEM_BASE_URL = 'https://explora.app/redeem'

interface CodesData {
  customTourCodesForTour: CustomTourCode[]
}

/**
 * F-23: gestor de códigos de acceso de un custom tour. Generar, copiar/compartir
 * el link de canje, y revocar. Sólo se muestra para tours `isCustom`.
 */
export function CustomTourCodesManager({ tourId }: { tourId: string }) {
  const { data, loading, refetch } = useQuery<CodesData>(
    CUSTOM_TOUR_CODES_FOR_TOUR,
    { variables: { tourId }, fetchPolicy: 'cache-and-network' },
  )
  const [createCode, { loading: creating }] = useMutation(
    CREATE_CUSTOM_TOUR_CODE,
  )
  const [revokeCode] = useMutation(REVOKE_CUSTOM_TOUR_CODE)
  const [maxUses, setMaxUses] = useState('')

  const codes = data?.customTourCodesForTour ?? []

  const handleGenerate = async () => {
    try {
      await createCode({
        variables: {
          input: {
            tourId,
            ...(maxUses ? { maxUses: parseInt(maxUses, 10) } : {}),
          },
        },
      })
      setMaxUses('')
      await refetch()
      toast.success('Access code generated')
    } catch (error) {
      toast.error(getDisplayError(error))
    }
  }

  const handleCopy = async (code: string) => {
    const link = `${REDEEM_BASE_URL}/${code}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Share link copied')
    } catch {
      toast.error('Could not copy the link')
    }
  }

  const handleRevoke = async (codeId: string) => {
    try {
      await revokeCode({ variables: { codeId } })
      await refetch()
      toast.success('Code revoked')
    } catch (error) {
      toast.error(getDisplayError(error))
    }
  }

  return (
    <div
      className='border rounded-lg p-4'
      style={{ borderColor: 'var(--color-card-border)' }}
    >
      <h3
        className='text-lg font-medium mb-1'
        style={{ color: 'var(--color-text-heading)' }}
      >
        Access codes
      </h3>
      <p className='text-sm mb-4' style={{ color: 'var(--color-text-muted)' }}>
        This is a private tour. Share an access code so your group can unlock and
        book it. The code grants access — travellers still pay the tour price.
      </p>

      <div className='flex items-end gap-3 mb-4'>
        <div className='flex-1'>
          <label
            className='block text-sm font-medium mb-2'
            style={{ color: 'var(--color-text-body)' }}
          >
            Max uses (optional)
          </label>
          <input
            type='number'
            min='1'
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
            style={{ borderColor: 'var(--color-card-border)' }}
            placeholder='Unlimited'
          />
        </div>
        <button
          type='button'
          onClick={handleGenerate}
          disabled={creating}
          className='px-4 py-2 rounded-lg font-medium text-white disabled:opacity-60'
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {creating ? 'Generating…' : 'Generate code'}
        </button>
      </div>

      {loading && codes.length === 0 ? (
        <p className='text-sm' style={{ color: 'var(--color-text-muted)' }}>
          Loading codes…
        </p>
      ) : codes.length === 0 ? (
        <p className='text-sm' style={{ color: 'var(--color-text-muted)' }}>
          No codes yet. Generate one to share with your group.
        </p>
      ) : (
        <ul className='space-y-2'>
          {codes.map((c) => {
            const isActive = c.status === 'ACTIVE'
            return (
              <li
                key={c.id}
                className='flex items-center justify-between gap-3 px-3 py-2 rounded border'
                style={{ borderColor: 'var(--color-card-border)' }}
              >
                <div>
                  <p
                    className='font-mono font-semibold'
                    style={{ color: 'var(--color-text-heading)' }}
                  >
                    {c.code}
                  </p>
                  <p
                    className='text-xs'
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {c.status}
                    {c.maxUses != null
                      ? ` · ${c.usesRemaining ?? 0}/${c.maxUses} left`
                      : ' · unlimited'}
                    {c.grants?.length ? ` · ${c.grants.length} redeemed` : ''}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => handleCopy(c.code)}
                    className='px-3 py-1.5 rounded text-sm font-medium border'
                    style={{
                      borderColor: 'var(--color-card-border)',
                      color: 'var(--color-text-body)',
                    }}
                  >
                    Copy link
                  </button>
                  {isActive && (
                    <button
                      type='button'
                      onClick={() => handleRevoke(c.id)}
                      className='px-3 py-1.5 rounded text-sm font-medium'
                      style={{ color: 'var(--color-danger)' }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
