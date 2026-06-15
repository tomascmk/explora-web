'use client'

import { useAuth } from '@/contexts/AuthContext'
import type { FeatureFlags } from '@/graphql/feature-flags'
import { useQuery } from '@apollo/client/react'
import { MY_UNREAD_CHAT_COUNT } from '@/graphql/chat'
import {
  Calendar,
  CreditCard,
  History,
  LayoutDashboard,
  Map,
  MessageCircle,
  MessageSquare,
  Percent,
  Settings,
  ShieldAlert,
  ShoppingCart,
  Tag,
  Compass,
  LogOut,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  href: string
  label: string
  icon: ReactNode
  matchPath?: string // for prefix matching
  flag?: keyof FeatureFlags // hide this item when the flag is off (PLAN-035)
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/tours', label: 'Tours', icon: <Compass size={20} />, matchPath: '/tours' },
  { href: '/orders', label: 'Orders', icon: <ShoppingCart size={20} />, matchPath: '/orders' },
  { href: '/agenda', label: 'Agenda', icon: <Calendar size={20} /> },
  { href: '/balance', label: 'Balance', icon: <CreditCard size={20} /> },
  { href: '/feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
  {
    href: '/chat',
    label: 'Messages',
    icon: <MessageCircle size={20} />,
    matchPath: '/chat',
    flag: 'chatEnabled',
  },
  { href: '/claims', label: 'Claims', icon: <ShieldAlert size={20} />, flag: 'claimsEnabled' },
  { href: '/discounts', label: 'Discounts', icon: <Percent size={20} />, flag: 'discountGroupsEnabled' },
  { href: '/coupons', label: 'Coupons', icon: <Tag size={20} />, matchPath: '/coupons' },
  { href: '/history', label: 'History', icon: <History size={20} /> },
  { href: '/map', label: 'Map', icon: <Map size={20} /> },
]

const bottomNavItems: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: <Settings size={20} />, matchPath: '/settings' },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout, featureFlags } = useAuth()
  const pathname = usePathname()

  // PLAN-038: no-leídos para el badge del item de chat.
  const { data: unreadData } = useQuery<{ myUnreadChatCount: number }>(
    MY_UNREAD_CHAT_COUNT,
    { skip: !featureFlags.chatEnabled, pollInterval: 30_000 },
  )
  const unreadChat = unreadData?.myUnreadChatCount ?? 0

  const visibleNavItems = navItems.filter(
    (item) => !item.flag || featureFlags[item.flag],
  )

  const isActive = (item: NavItem) => {
    if (item.matchPath) {
      return pathname.startsWith(item.matchPath)
    }
    return pathname === item.href
  }

  const sidebarContent = (
    <div className='flex flex-col h-full' style={{ backgroundColor: 'var(--color-sidebar-bg)' }}>
      {/* Logo */}
      <div className='flex items-center justify-between h-16 px-5 flex-shrink-0'>
        <Link href='/dashboard' className='flex items-center gap-3'>
          <div
            className='w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            E
          </div>
          <span className='text-lg font-bold text-white'>Explora</span>
        </Link>
        {/* Close button — mobile only */}
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
        {visibleNavItems.map((item) => {
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
              {/* Active indicator bar */}
              <div
                className='absolute left-0 w-1 h-6 rounded-r-full transition-opacity'
                style={{
                  backgroundColor: 'var(--color-sidebar-active)',
                  opacity: active ? 1 : 0,
                }}
              />
              <span className='flex-shrink-0'>{item.icon}</span>
              <span>{item.label}</span>
              {item.href === '/chat' && unreadChat > 0 && (
                <span
                  className='ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-white flex items-center justify-center'
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {unreadChat}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className='flex-shrink-0 px-3 pb-3 space-y-1'>
        {/* Divider */}
        <div className='mx-1 mb-2 border-t' style={{ borderColor: 'var(--color-sidebar-divider)' }} />

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
              {item.href === '/chat' && unreadChat > 0 && (
                <span
                  className='ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-white flex items-center justify-center'
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {unreadChat}
                </span>
              )}
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
                  Guide
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
      {/* Desktop sidebar — always visible */}
      <aside className='hidden lg:flex lg:flex-shrink-0 lg:w-64 relative'>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-40 bg-black/50 sidebar-overlay lg:hidden'
            onClick={onClose}
          />
          {/* Panel */}
          <aside className='fixed inset-y-0 left-0 z-50 w-64 sidebar-panel lg:hidden'>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
