'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface AppPromoBannerProps {
  shareCode: string
}

export function AppPromoBanner({ shareCode }: AppPromoBannerProps) {
  const [showModal, setShowModal] = useState(false)
  const deepLink = `exploraapp://trip/${shareCode}`

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    // Show toast suggesting to open in app
    toast('Open in Explora App', {
      description: 'Get the best experience with the Explora app',
      action: {
        label: 'Open',
        onClick: () => {
          tryOpenApp()
        }
      },
      duration: 8000
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const tryOpenApp = () => {
    const start = Date.now()
    window.location.href = deepLink

    // If still visible after timeout, app is not installed
    setTimeout(() => {
      if (document.hidden) return // App opened successfully
      if (Date.now() - start > 2000) {
        setShowModal(true)
      }
    }, 1500)
  }

  if (!showModal) return null

  return (
    <div className='fixed inset-0 z-[90] flex items-center justify-center px-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={() => setShowModal(false)}
      />

      {/* Modal */}
      <div
        className='relative w-full max-w-sm rounded-2xl shadow-2xl p-6 border text-center'
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)'
        }}
      >
        {/* Logo */}
        <div className='flex justify-center mb-4'>
          <span
            className='w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold text-white'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            E
          </span>
        </div>

        <h2
          className='text-xl font-bold mb-2'
          style={{ color: 'var(--color-text-heading)' }}
        >
          Get the Explora App
        </h2>
        <p
          className='text-sm mb-6'
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Download the app for the best experience with offline maps, real-time GPS, and exclusive features.
        </p>

        {/* Store buttons */}
        <div className='space-y-3 mb-4'>
          <a
            href='#'
            className='flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl text-white font-semibold transition-opacity hover:opacity-90'
            style={{ backgroundColor: '#000000' }}
          >
            <svg width='20' height='24' viewBox='0 0 20 24' fill='currentColor'>
              <path d='M16.5 12.5c0-2.7 1.4-4.3 2.8-5.3-1.1-1.6-2.8-2.5-4.3-2.5-1.8-.2-3.6 1.1-4.5 1.1-.9 0-2.4-1.1-3.9-1C4.6 4.9 2.7 6.1 1.7 8c-2.1 3.7-.5 9.2 1.5 12.2 1 1.5 2.2 3.1 3.8 3 1.5-.1 2.1-1 3.9-1s2.3 1 3.9 1c1.6 0 2.7-1.5 3.7-3-1.2-1.7-1.9-3.7-2-5.7z' />
            </svg>
            Download on the App Store
          </a>
          <a
            href='#'
            className='flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl text-white font-semibold transition-opacity hover:opacity-90'
            style={{ backgroundColor: '#000000' }}
          >
            <svg width='20' height='22' viewBox='0 0 20 22' fill='currentColor'>
              <path d='M1 1.3L11.7 11 1 20.7V1.3zm1.5-1L14.2 9.6l-2.5 2.5L2.5.3zm0 21.4l9.2-8.4 2.5 2.5L2.5 21.7zM15 10.2l3.3 1.9-3.3 1.9-2.5-2.5L15 10.2z' />
            </svg>
            GET IT ON Google Play
          </a>
        </div>

        <button
          onClick={() => setShowModal(false)}
          className='text-sm font-medium hover:underline'
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Continue in browser
        </button>
      </div>
    </div>
  )
}
