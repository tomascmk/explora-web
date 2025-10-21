'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
      const response = await fetch('http://localhost:3001/graphql', {
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
          variables: { email, password }
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
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700'>
      <div className='bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Welcome Back
          </h1>
          <p className='text-gray-700'>Sign in to your guide account</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <div className='bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm font-medium border border-red-200'>
              {error}
            </div>
          )}

          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='guide@example.com'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='••••••••'
              required
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition'
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className='mt-6 text-center text-sm text-gray-700'>
          Don't have an account?{' '}
          <Link
            href='/register'
            className='text-blue-600 hover:underline font-semibold'
          >
            Register as a Guide
          </Link>
        </div>

        <div className='mt-4 text-center'>
          <Link href='/' className='text-sm text-gray-600 hover:text-gray-900 font-medium'>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
