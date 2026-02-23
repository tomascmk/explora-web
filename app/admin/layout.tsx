'use client'

import { useAuth } from '@/contexts/AuthContext'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminMobileHeader } from '@/components/admin/AdminMobileHeader'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT']

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const hasAdminRole = user?.roles?.some((r) => ADMIN_ROLES.includes(r))

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!loading && isAuthenticated && !hasAdminRole) {
      router.push('/dashboard')
    }
  }, [loading, isAuthenticated, hasAdminRole, router])

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

  if (!isAuthenticated || !user || !hasAdminRole) {
    return null
  }

  return (
    <div className='flex h-screen overflow-hidden'>
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <AdminMobileHeader onMenuClick={() => setSidebarOpen(true)} />

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
