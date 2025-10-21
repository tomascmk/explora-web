'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
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
      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation Register($input: RegisterInput!) {
              register(registerInput: $input) {
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
          variables: {
            input: {
              username: formData.username,
              email: formData.email,
              fullName: formData.fullName,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
              roles: 'GUIDE'
            }
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (result.errors && result.errors.length > 0) {
        console.error('GraphQL Errors:', result.errors)
        throw new Error(result.errors[0].message || 'Registration failed')
      }

      if (result.data?.register) {
        // Store tokens
        localStorage.setItem('authToken', result.data.register.access_token)
        localStorage.setItem('refreshToken', result.data.register.refresh_token)
        localStorage.setItem('user', JSON.stringify(result.data.register.user))

        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        throw new Error('No data returned from server')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Failed to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 py-12'>
      <div className='bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Become a Guide
          </h1>
          <p className='text-gray-700'>Join our community of local experts</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm font-medium border border-red-200'>
              {error}
            </div>
          )}

          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>
              Username
            </label>
            <input
              type='text'
              name='username'
              value={formData.username}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='johndoe'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>
              Full Name
            </label>
            <input
              type='text'
              name='fullName'
              value={formData.fullName}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='John Doe'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>
              Email
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
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
              name='password'
              value={formData.password}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='••••••••'
              required
            />
            <p className='text-xs text-gray-600 mt-1 font-medium'>
              Must contain uppercase, lowercase, number, and special character
            </p>
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-900 mb-2'>
              Confirm Password
            </label>
            <input
              type='password'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? 'Creating account...' : 'Create Guide Account'}
          </button>
        </form>

        <div className='mt-6 text-center text-sm text-gray-700'>
          Already have an account?{' '}
          <Link
            href='/login'
            className='text-blue-600 hover:underline font-semibold'
          >
            Sign In
          </Link>
        </div>

        <div className='mt-4 text-center'>
          <Link
            href='/'
            className='text-sm text-gray-600 hover:text-gray-900 font-medium'
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
