'use client'

import { useAuth } from '@/contexts/AuthContext'
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Compass,
  Gavel,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Settings,
  Shield,
  Users,
  X,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  href: string
  label: string
  icon: ReactNode
  matchPath?: string
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/admin/users', label: 'Users', icon: <Users size={20} />, matchPath: '/admin/users' },
  { href: '/admin/reservations', label: 'Reservations', icon: <ClipboardList size={20} />, matchPath: '/admin/reservations' },
  { href: '/admin/tours', label: 'Tours & Places', icon: <Compass size={20} />, matchPath: '/admin/tours' },
  { href: '/admin/moderation', label: 'Moderation', icon: <Shield size={20} />, matchPath: '/admin/moderation' },
  { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={20} />, matchPath: '/admin/analytics' },
  { href: '/admin/audit-log', label: 'Audit Log', icon: <ScrollText size={20} />, matchPath: '/admin/audit-log' },
]

const bottomNavItems: NavItem[] = [
  { href: '/admin/settings', label: 'Settings', icon: <Settings size={20} />, matchPath: '/admin/settings' },
]

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const isActive = (item: NavItem) => {
    if (item.matchPath) {
      return pathname.startsWith(item.matchPath)
    }
    return pathname === item.href
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#F87171' }
      case 'ADMIN': return { bg: 'rgba(168, 85, 247, 0.2)', color: '#C084FC' }
      case 'SUPPORT': return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA' }
      default: return { bg: 'rgba(107, 114, 128, 0.2)', color: '#9CA3AF' }
    }
  }

  const adminRole = user?.roles?.find(r => ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(r)) || 'ADMIN'
  const roleColors = getRoleBadgeColor(adminRole)

  const sidebarContent = (
    <div className='flex flex-col h-full' style={{ backgroundColor: 'var(--color-sidebar-bg)' }}>
      {/* Logo */}
      <div className='flex items-center justify-between h-16 px-5 flex-shrink-0'>
        <Link href='/admin' className='flex items-center gap-3'>
          <div
            className='w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            E
          </div>
          <div className='flex flex-col'>
            <span className='text-lg font-bold text-white leading-tight'>Explora</span>
            <span
              className='text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded'
              style={{ backgroundColor: roleColors.bg, color: roleColors.color }}
            >
              {adminRole.replace('_', ' ')}
            </span>
          </div>
        </Link>
        <button
          onClick={onClose}
          className='lg:hidden p-1 rounded-md hover:bg-white/10 transition-colors'
          style={{ color: 'var(--color-sidebar-text)' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Divider */}
      <div className='mx-4 border-t' style={{ borderColor: 'var(--color-sidebar-divider)' }} />

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-1'>
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active ? '' : 'hover:translate-x-0.5'
              }`}
              style={{
                color: active ? 'var(--color-sidebar-active)' : 'var(--color-sidebar-text)',
                backgroundColor: active ? 'var(--color-sidebar-active-bg)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)'
                  e.currentTarget.style.color = '#E2E8F0'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--color-sidebar-text)'
                }
              }}
            >
              <div
                className='absolute left-0 w-1 h-6 rounded-r-full transition-opacity'
                style={{
                  backgroundColor: 'var(--color-sidebar-active)',
                  opacity: active ? 1 : 0,
                }}
              />
              <span className='flex-shrink-0'>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className='flex-shrink-0 px-3 pb-3 space-y-1'>
        <div className='mx-1 mb-2 border-t' style={{ borderColor: 'var(--color-sidebar-divider)' }} />

        {/* Back to Guide Portal */}
        <Link
          href='/dashboard'
          className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200'
          style={{ color: 'var(--color-sidebar-text)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)'
            e.currentTarget.style.color = '#E2E8F0'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-sidebar-text)'
          }}
        >
          <ArrowLeft size={20} />
          <span>Guide Portal</span>
        </Link>

        {bottomNavItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200'
              style={{
                color: active ? 'var(--color-sidebar-active)' : 'var(--color-sidebar-text)',
                backgroundColor: active ? 'var(--color-sidebar-active-bg)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)'
                  e.currentTarget.style.color = '#E2E8F0'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--color-sidebar-text)'
                }
              }}
            >
              <span className='flex-shrink-0'>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Logout */}
        <button
          onClick={logout}
          className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full'
          style={{ color: 'var(--color-sidebar-text)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'
            e.currentTarget.style.color = '#F87171'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-sidebar-text)'
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>

        {/* User info */}
        {user && (
          <>
            <div className='mx-1 mt-2 border-t' style={{ borderColor: 'var(--color-sidebar-divider)' }} />
            <div className='flex items-center gap-3 px-3 py-3'>
              <div
                className='w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className='min-w-0'>
                <p className='text-sm font-medium text-white truncate'>
                  {user.fullName || user.username}
                </p>
                <p className='text-xs truncate' style={{ color: 'var(--color-sidebar-text)' }}>
                  Administrator
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className='hidden lg:flex lg:flex-shrink-0 lg:w-64 relative'>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-40 bg-black/50 sidebar-overlay lg:hidden'
            onClick={onClose}
          />
          <aside className='fixed inset-y-0 left-0 z-50 w-64 sidebar-panel lg:hidden'>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
