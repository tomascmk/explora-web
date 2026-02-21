'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TripAuthGate } from '@/components/trips/TripAuthGate'
import { AppPromoBanner } from '@/components/trips/AppPromoBanner'

export default function TripSharePage() {
  const params = useParams<{ shareCode: string }>()
  const shareCode = params.shareCode

  if (!shareCode) {
    return (
      <div
        className='min-h-screen flex items-center justify-center'
        style={{ backgroundColor: 'var(--color-page-bg)' }}
      >
        <p style={{ color: 'var(--color-text-secondary)' }}>Invalid trip link</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--color-page-bg)' }}>
      {/* Minimal top nav */}
      <header
        className='sticky top-0 z-30 border-b'
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)'
        }}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-2'>
            <span
              className='w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white'
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              E
            </span>
            <span
              className='text-lg font-bold'
              style={{ color: 'var(--color-text-heading)' }}
            >
              Explora
            </span>
          </Link>

          <Link
            href='/tourists'
            className='text-sm font-medium px-4 py-2 rounded-lg transition-colors'
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            }}
          >
            Download App
          </Link>
        </div>
      </header>

      {/* App promo (mobile only) */}
      <AppPromoBanner shareCode={shareCode} />

      {/* Auth gate wrapping trip content */}
      <TripAuthGate shareCode={shareCode} />
    </div>
  )
}
