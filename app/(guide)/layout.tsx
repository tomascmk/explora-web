'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

export default function GuideLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div
        className='min-h-screen flex items-center justify-center'
        style={{ backgroundColor: 'var(--color-page-bg)' }}
      >
        <div className='text-center'>
          <div
            className='w-10 h-10 border-3 rounded-full animate-spin mx-auto mb-4'
            style={{
              borderColor: 'var(--color-card-border)',
              borderTopColor: 'var(--color-primary)',
            }}
          />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className='flex h-screen overflow-hidden'>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        {/* Mobile header with hamburger */}
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable content */}
        <main
          className='flex-1 overflow-y-auto p-4 lg:p-8'
          style={{ backgroundColor: 'var(--color-page-bg)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
