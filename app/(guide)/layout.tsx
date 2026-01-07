'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

export default function GuideLayout({ children }: { children: ReactNode }) {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Wait for loading to finish
    if (!loading && !isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login...')
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>⏳</div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Navigation */}
      <nav className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-8'>
              <Link
                href='/dashboard'
                className='text-xl font-bold text-blue-600'
              >
                Explora Guide
              </Link>
              <div className='hidden md:flex gap-6'>
                <NavLink href='/dashboard' active={pathname === '/dashboard'}>
                  Dashboard
                </NavLink>
                <NavLink href='/tours' active={pathname.startsWith('/tours')}>
                  Tours
                </NavLink>
                <NavLink href='/balance' active={pathname === '/balance'}>
                  Balance
                </NavLink>
                <NavLink href='/orders' active={pathname === '/orders'}>
                  Orders
                </NavLink>
                <NavLink href='/agenda' active={pathname === '/agenda'}>
                  Agenda
                </NavLink>
                <NavLink href='/feedback' active={pathname === '/feedback'}>
                  Feedback
                </NavLink>
                <NavLink href='/claims' active={pathname === '/claims'}>
                  Claims
                </NavLink>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              {user && (
                <span className='text-sm font-medium text-gray-700'>
                  {user.fullName || user.username}
                </span>
              )}
              <Link
                href='/settings'
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === '/settings'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Settings
              </Link>
              <button
                onClick={logout}
                className='text-sm font-medium text-gray-600 hover:text-red-600 transition-colors duration-200'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}

function NavLink({
  href,
  children,
  active = false
}: {
  href: string
  children: ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`font-semibold text-sm transition-all duration-200 px-3 py-1 rounded-md ${
        active
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
      }`}
    >
      {children}
    </Link>
  )
}
