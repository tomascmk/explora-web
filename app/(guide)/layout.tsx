'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ReactNode } from 'react'

export default function GuideLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

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
                <NavLink href='/dashboard'>Dashboard</NavLink>
                <NavLink href='/tours'>Tours</NavLink>
                <NavLink href='/balance'>Balance</NavLink>
                <NavLink href='/orders'>Orders</NavLink>
                <NavLink href='/agenda'>Agenda</NavLink>
                <NavLink href='/feedback'>Feedback</NavLink>
                <NavLink href='/claims'>Claims</NavLink>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              {user && (
                <span className='text-sm text-gray-600'>
                  {user.fullName || user.username}
                </span>
              )}
              <Link
                href='/settings'
                className='text-gray-600 hover:text-gray-900'
              >
                Settings
              </Link>
              <button
                onClick={logout}
                className='text-sm text-gray-600 hover:text-gray-900'
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

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className='text-gray-600 hover:text-gray-900 font-medium text-sm'
    >
      {children}
    </Link>
  )
}
