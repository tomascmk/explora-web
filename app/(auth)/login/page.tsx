'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { encryptPassword } from '@/utils/crypto'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/graphql'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation Login($email: String!, $password: String!) {
              login(loginInput: { email: $email, password: $password }) {
                access_token
                refresh_token
                user {
                  id
                  username
                  email
                  fullName
                  roles
                }
              }
            }
          `,
          variables: { email, password: encryptPassword(password) }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('HTTP Error:', response.status, result)
        throw new Error(`Server error: ${response.status}`)
      }

      if (result.errors && result.errors.length > 0) {
        console.error('GraphQL Errors:', result.errors)
        const errorMessage = result.errors[0].message || 'Login failed'
        throw new Error(errorMessage)
      }

      if (result.data?.login) {
        // Store tokens
        localStorage.setItem('authToken', result.data.login.access_token)
        localStorage.setItem('refreshToken', result.data.login.refresh_token)
        localStorage.setItem('user', JSON.stringify(result.data.login.user))

        console.log('✅ Login successful, redirecting to dashboard...')

        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        throw new Error('No data returned from server')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 px-4'>
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
              Welcome Back
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>Sign in to your guide account</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
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
                Email
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 rounded-lg transition-all outline-none'
                style={{
                  border: '1px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-card-bg)',
                  color: 'var(--color-text-body)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-light)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-card-border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-3 rounded-lg transition-all outline-none'
                style={{
                  border: '1px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-card-bg)',
                  color: 'var(--color-text-body)',
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
              className='w-full text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              style={{ backgroundColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-primary)' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full' style={{ borderTop: '1px solid var(--color-card-border)' }}></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2' style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text-muted)' }}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className='mt-6 grid grid-cols-3 gap-3'>
              <button
                onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}
                className='w-full inline-flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors'
                style={{
                  border: '1px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-card-bg)',
                  color: 'var(--color-text-secondary)',
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
                Google
              </button>
              <button
                onClick={() => window.location.href = `${API_BASE_URL}/auth/facebook`}
                className='w-full inline-flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors'
                style={{
                  border: '1px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-card-bg)',
                  color: 'var(--color-text-secondary)',
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
                Facebook
              </button>
              <button
                onClick={() => window.location.href = `${API_BASE_URL}/auth/apple`}
                className='w-full inline-flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors'
                style={{
                  border: '1px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-card-bg)',
                  color: 'var(--color-text-secondary)',
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
                Apple
              </button>
            </div>
          </div>

          <div className='mt-6 text-center text-sm' style={{ color: 'var(--color-text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link
              href='/register'
              className='font-semibold hover:underline'
              style={{ color: 'var(--color-primary)' }}
            >
              Register as a Guide
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
