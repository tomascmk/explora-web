'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@apollo/client/react'
import {
  TRIP_BY_SHARE_CODE,
  type TripByShareCodeResult,
  type TripByShareCodeVars
} from '@/graphql/trips'
import { TripContent } from './TripContent'
import { TripPlaceholder } from './TripPlaceholder'
import { useState } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

// ── Main Auth Gate ──

interface TripAuthGateProps {
  shareCode: string
}

export function TripAuthGate({ shareCode }: TripAuthGateProps) {
  const { isAuthenticated, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div
        className='min-h-[60vh] flex items-center justify-center'
        style={{ backgroundColor: 'var(--color-page-bg)' }}
      >
        <div className='text-center'>
          <div
            className='w-10 h-10 border-3 rounded-full animate-spin mx-auto mb-4'
            style={{
              borderColor: 'var(--color-card-border)',
              borderTopColor: 'var(--color-primary)'
            }}
          />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <AuthenticatedTrip shareCode={shareCode} />
  }

  return (
    <div className='relative min-h-[80vh]'>
      {/* Blurred placeholder */}
      <TripPlaceholder />

      {/* Frosted glass overlay */}
      <div className='fixed inset-0 bg-white/60 backdrop-blur-sm z-40' />

      {/* Auth modal */}
      <div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
        <AuthModal shareCode={shareCode} />
      </div>
    </div>
  )
}

// ── Authenticated Trip (fetches real data) ──

function AuthenticatedTrip({ shareCode }: { shareCode: string }) {
  const { data, loading, error } = useQuery<TripByShareCodeResult, TripByShareCodeVars>(
    TRIP_BY_SHARE_CODE,
    {
      variables: { shareCode },
      fetchPolicy: 'network-only'
    }
  )

  if (loading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <div
            className='w-10 h-10 border-3 rounded-full animate-spin mx-auto mb-4'
            style={{
              borderColor: 'var(--color-card-border)',
              borderTopColor: 'var(--color-primary)'
            }}
          />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading trip...</p>
        </div>
      </div>
    )
  }

  if (error || !data?.tripByShareCode) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center max-w-md px-4'>
          <div className='text-6xl mb-4'>🗺️</div>
          <h2
            className='text-2xl font-bold mb-2'
            style={{ color: 'var(--color-text-heading)' }}
          >
            Trip Not Found
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            This trip may not exist or is no longer public.
          </p>
        </div>
      </div>
    )
  }

  return <TripContent trip={data.tripByShareCode} />
}

// ── Auth Modal ──

type AuthTab = 'login' | 'register'

function AuthModal({ shareCode }: { shareCode: string }) {
  const [activeTab, setActiveTab] = useState<AuthTab>('login')

  return (
    <div
      className='w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden'
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-card-border)'
      }}
    >
      {/* Logo */}
      <div className='text-center pt-6 pb-2'>
        <div className='flex justify-center mb-3'>
          <span
            className='w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            E
          </span>
        </div>
        <h2
          className='text-xl font-bold'
          style={{ color: 'var(--color-text-heading)' }}
        >
          Sign in to view this trip
        </h2>
        <p
          className='text-sm mt-1'
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Create a free account or sign in to explore
        </p>
      </div>

      {/* Tabs */}
      <div
        className='flex border-b mx-6 mt-3'
        style={{ borderColor: 'var(--color-card-border)' }}
      >
        <button
          className='flex-1 py-2.5 text-sm font-semibold transition-colors'
          style={{
            color:
              activeTab === 'login'
                ? 'var(--color-primary)'
                : 'var(--color-text-secondary)',
            borderBottom:
              activeTab === 'login'
                ? '2px solid var(--color-primary)'
                : '2px solid transparent'
          }}
          onClick={() => setActiveTab('login')}
        >
          Sign In
        </button>
        <button
          className='flex-1 py-2.5 text-sm font-semibold transition-colors'
          style={{
            color:
              activeTab === 'register'
                ? 'var(--color-primary)'
                : 'var(--color-text-secondary)',
            borderBottom:
              activeTab === 'register'
                ? '2px solid var(--color-primary)'
                : '2px solid transparent'
          }}
          onClick={() => setActiveTab('register')}
        >
          Create Account
        </button>
      </div>

      {/* Form content */}
      <div className='p-6'>
        {activeTab === 'login' ? (
          <LoginForm shareCode={shareCode} />
        ) : (
          <RegisterForm shareCode={shareCode} onSwitchToLogin={() => setActiveTab('login')} />
        )}
      </div>
    </div>
  )
}

// ── Login Form ──

function LoginForm({ shareCode }: { shareCode: string }) {
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Login failed')
      }

      setUser(result.user)
      // Stay on trip page — no navigation
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to login. Please check your credentials.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = (provider: string) => {
    // Store current URL so we can return after OAuth
    sessionStorage.setItem('oauth_return_url', window.location.href)
    window.location.href = `${API_BASE_URL}/auth/${provider}`
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {error && (
        <div
          className='px-4 py-3 rounded-lg text-sm font-medium border'
          style={{
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            borderColor: 'var(--color-danger)'
          }}
        >
          {error}
        </div>
      )}

      <div>
        <label
          className='block text-sm font-semibold mb-1.5'
          style={{ color: 'var(--color-text-heading)' }}
        >
          Email
        </label>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full px-4 py-2.5 rounded-lg transition-all outline-none text-sm'
          style={{
            border: '1px solid var(--color-card-border)',
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text-body)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)'
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-light)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-card-border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          placeholder='you@example.com'
          required
        />
      </div>

      <div>
        <label
          className='block text-sm font-semibold mb-1.5'
          style={{ color: 'var(--color-text-heading)' }}
        >
          Password
        </label>
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full px-4 py-2.5 rounded-lg transition-all outline-none text-sm'
          style={{
            border: '1px solid var(--color-card-border)',
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text-body)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)'
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-light)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-card-border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          placeholder='••••••••'
          required
        />
      </div>

      <button
        type='submit'
        disabled={loading}
        className='w-full text-white py-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm'
        style={{ backgroundColor: 'var(--color-primary)' }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-primary)'
        }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      {/* OAuth divider */}
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div
            className='w-full'
            style={{ borderTop: '1px solid var(--color-card-border)' }}
          />
        </div>
        <div className='relative flex justify-center text-xs'>
          <span
            className='px-2'
            style={{
              backgroundColor: 'var(--color-card-bg)',
              color: 'var(--color-text-muted)'
            }}
          >
            Or continue with
          </span>
        </div>
      </div>

      {/* OAuth buttons */}
      <div className='grid grid-cols-3 gap-2'>
        {['google', 'facebook', 'apple'].map((provider) => (
          <button
            key={provider}
            type='button'
            onClick={() => handleOAuth(provider)}
            className='py-2 px-3 rounded-lg text-xs font-medium transition-colors capitalize'
            style={{
              border: '1px solid var(--color-card-border)',
              backgroundColor: 'var(--color-card-bg)',
              color: 'var(--color-text-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
              e.currentTarget.style.color = 'var(--color-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-card-border)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            {provider.charAt(0).toUpperCase() + provider.slice(1)}
          </button>
        ))}
      </div>
    </form>
  )
}

// ── Register Form ──

function RegisterForm({
  shareCode,
  onSwitchToLogin
}: {
  shareCode: string
  onSwitchToLogin: () => void
}) {
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          roles: 'TOURIST',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      setUser(result.user)
      // Stay on trip page — no navigation
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to register. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    border: '1px solid var(--color-card-border)',
    backgroundColor: 'var(--color-card-bg)',
    color: 'var(--color-text-body)'
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--color-primary)'
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-light)'
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--color-card-border)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-3'>
      {error && (
        <div
          className='px-4 py-3 rounded-lg text-sm font-medium border'
          style={{
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            borderColor: 'var(--color-danger)'
          }}
        >
          {error}
        </div>
      )}

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label
            className='block text-xs font-semibold mb-1'
            style={{ color: 'var(--color-text-heading)' }}
          >
            Username
          </label>
          <input
            type='text'
            name='username'
            value={formData.username}
            onChange={handleChange}
            className='w-full px-3 py-2 rounded-lg transition-all outline-none text-sm'
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder='johndoe'
            required
          />
        </div>
        <div>
          <label
            className='block text-xs font-semibold mb-1'
            style={{ color: 'var(--color-text-heading)' }}
          >
            Full Name
          </label>
          <input
            type='text'
            name='fullName'
            value={formData.fullName}
            onChange={handleChange}
            className='w-full px-3 py-2 rounded-lg transition-all outline-none text-sm'
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder='John Doe'
            required
          />
        </div>
      </div>

      <div>
        <label
          className='block text-xs font-semibold mb-1'
          style={{ color: 'var(--color-text-heading)' }}
        >
          Email
        </label>
        <input
          type='email'
          name='email'
          value={formData.email}
          onChange={handleChange}
          className='w-full px-3 py-2 rounded-lg transition-all outline-none text-sm'
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder='you@example.com'
          required
        />
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label
            className='block text-xs font-semibold mb-1'
            style={{ color: 'var(--color-text-heading)' }}
          >
            Password
          </label>
          <input
            type='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            className='w-full px-3 py-2 rounded-lg transition-all outline-none text-sm'
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder='••••••••'
            required
          />
        </div>
        <div>
          <label
            className='block text-xs font-semibold mb-1'
            style={{ color: 'var(--color-text-heading)' }}
          >
            Confirm
          </label>
          <input
            type='password'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
            className='w-full px-3 py-2 rounded-lg transition-all outline-none text-sm'
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder='••••••••'
            required
          />
        </div>
      </div>

      <p className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
        Min. 8 characters with uppercase, lowercase, number, and special character
      </p>

      <button
        type='submit'
        disabled={loading}
        className='w-full text-white py-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm'
        style={{ backgroundColor: 'var(--color-primary)' }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-primary)'
        }}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p
        className='text-center text-xs'
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Already have an account?{' '}
        <button
          type='button'
          onClick={onSwitchToLogin}
          className='font-semibold hover:underline'
          style={{ color: 'var(--color-primary)' }}
        >
          Sign In
        </button>
      </p>
    </form>
  )
}
