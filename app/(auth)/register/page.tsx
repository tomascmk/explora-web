'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
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
          roles: 'GUIDE',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      setUser(result.user)

      // Hard navigation to ensure AuthProvider re-mounts with fresh state
      window.location.href = '/dashboard'
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
    color: 'var(--color-text-body)',
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
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 px-4 py-12'>
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10' style={{ backgroundColor: 'var(--color-primary)' }} />
        <div className='absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10' style={{ backgroundColor: 'var(--color-primary)' }} />
      </div>

      <div className='relative w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <Link href='/' className='inline-flex items-center gap-2 text-white'>
            <span
              className='w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white'
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              E
            </span>
            <span className='text-2xl font-bold'>Explora</span>
          </Link>
        </div>

        {/* Card */}
        <div
          className='p-8 rounded-2xl shadow-2xl border'
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold mb-2' style={{ color: 'var(--color-text-heading)' }}>
              Become a Guide
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>Join our community of local experts</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div
                className='px-4 py-3 rounded-lg text-sm font-medium border'
                style={{
                  backgroundColor: 'var(--color-danger-light)',
                  color: 'var(--color-danger)',
                  borderColor: 'var(--color-danger)',
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>
                Username
              </label>
              <input
                type='text'
                name='username'
                value={formData.username}
                onChange={handleChange}
                className='w-full px-4 py-3 rounded-lg transition-all outline-none'
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder='johndoe'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>
                Full Name
              </label>
              <input
                type='text'
                name='fullName'
                value={formData.fullName}
                onChange={handleChange}
                className='w-full px-4 py-3 rounded-lg transition-all outline-none'
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder='John Doe'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>
                Email
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='w-full px-4 py-3 rounded-lg transition-all outline-none'
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder='guide@example.com'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>
                Password
              </label>
              <input
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                className='w-full px-4 py-3 rounded-lg transition-all outline-none'
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder='••••••••'
                required
              />
              <p className='text-xs mt-1 font-medium' style={{ color: 'var(--color-text-muted)' }}>
                Must contain uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>
                Confirm Password
              </label>
              <input
                type='password'
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleChange}
                className='w-full px-4 py-3 rounded-lg transition-all outline-none'
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder='••••••••'
                required
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              style={{ backgroundColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-primary)' }}
            >
              {loading ? 'Creating account...' : 'Create Guide Account'}
            </button>
          </form>

          <div className='mt-6 text-center text-sm' style={{ color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link
              href='/login'
              className='font-semibold hover:underline'
              style={{ color: 'var(--color-primary)' }}
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className='mt-6 text-center'>
          <Link
            href='/'
            className='text-sm font-medium text-white/60 hover:text-white transition'
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
