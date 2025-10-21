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
      // TODO: Connect to GraphQL API
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
                  roles
                }
              }
            }
          `,
          variables: { email, password }
        })
      })

      const { data, errors } = await response.json()

      if (errors) {
        throw new Error(errors[0].message)
      }

      if (data?.login) {
        // Store tokens
        localStorage.setItem('authToken', data.login.access_token)
        localStorage.setItem('refreshToken', data.login.refresh_token)
        localStorage.setItem('user', JSON.stringify(data.login.user))

        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login')
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
          <p className='text-gray-600'>Sign in to your guide account</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <div className='bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
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
            <label className='block text-sm font-medium text-gray-700 mb-2'>
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

        <div className='mt-6 text-center text-sm text-gray-600'>
          Don't have an account?{' '}
          <Link
            href='/register'
            className='text-blue-600 hover:underline font-medium'
          >
            Register as a Guide
          </Link>
        </div>

        <div className='mt-4 text-center'>
          <Link href='/' className='text-sm text-gray-500 hover:text-gray-700'>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
