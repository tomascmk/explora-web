'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

interface DiscountGroup {
  id: string
  name: string
  description: string
  discountPercentage: number
  startDate: string
  endDate: string
  isActive: boolean
  tours: { id: string; title: string }[]
}

export default function DiscountsPage() {
  const { user } = useAuth()
  const [discounts, setDiscounts] = useState<DiscountGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDiscounts()
    }
  }, [user])

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            query DiscountsByGuide($guideId: String!) {
              discountGroupsByGuide(guideId: $guideId) {
                id
                name
                description
                discountPercentage
                startDate
                endDate
                isActive
                tours {
                  id
                  title
                }
              }
            }
          `,
          variables: { guideId: user?.id }
        })
      })

      const { data } = await response.json()
      if (data?.discountGroupsByGuide) {
        setDiscounts(data.discountGroupsByGuide)
      }
    } catch (error) {
      console.error('Error fetching discounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            mutation UpdateDiscountGroup($id: String!, $input: UpdateDiscountGroupDto!) {
              updateDiscountGroup(id: $id, input: $input) {
                id
                isActive
              }
            }
          `,
          variables: {
            id,
            input: { id, isActive: !isActive }
          }
        })
      })

      const { data } = await response.json()
      if (data?.updateDiscountGroup) {
        fetchDiscounts()
      }
    } catch (error) {
      console.error('Error toggling discount:', error)
    }
  }

  if (loading) {
    return (
      <div className='p-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/4'></div>
          <div className='h-32 bg-gray-200 rounded'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>Discount Groups</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition'
        >
          + Create Discount Group
        </button>
      </div>

      {discounts.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-12 text-center'>
          <p className='text-gray-500 mb-4'>No discount groups created yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition'
          >
            Create Your First Discount
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {discounts.map((discount) => (
            <DiscountCard
              key={discount.id}
              discount={discount}
              onToggleActive={(id, isActive) => toggleActive(id, isActive)}
            />
          ))}
        </div>
      )}

      {/* Create Modal - Simple implementation */}
      {showCreateModal && (
        <CreateDiscountModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchDiscounts()
            setShowCreateModal(false)
          }}
          guideId={user?.id || ''}
        />
      )}
    </div>
  )
}

function DiscountCard({
  discount,
  onToggleActive
}: {
  discount: DiscountGroup
  onToggleActive: (id: string, isActive: boolean) => void
}) {
  const isExpired = new Date(discount.endDate) < new Date()
  const isUpcoming = new Date(discount.startDate) > new Date()
  const isActive = discount.isActive && !isExpired && !isUpcoming

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h3 className='text-lg font-semibold'>{discount.name}</h3>
          <p className='text-2xl font-bold text-blue-600 mt-1'>
            {discount.discountPercentage}% OFF
          </p>
        </div>
        <button
          onClick={() => onToggleActive(discount.id, discount.isActive)}
          className={`px-3 py-1 rounded text-xs font-medium ${
            discount.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {discount.isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      {discount.description && (
        <p className='text-sm text-gray-600 mb-4'>{discount.description}</p>
      )}

      <div className='space-y-2 mb-4'>
        <div className='flex justify-between text-sm'>
          <span className='text-gray-600'>Start:</span>
          <span className='font-medium'>
            {format(new Date(discount.startDate), 'MMM d, yyyy')}
          </span>
        </div>
        <div className='flex justify-between text-sm'>
          <span className='text-gray-600'>End:</span>
          <span className='font-medium'>
            {format(new Date(discount.endDate), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <div className='pt-4 border-t'>
        <p className='text-sm text-gray-600 mb-2'>
          Applied to {discount.tours.length} tour(s)
        </p>
        <div className='flex flex-wrap gap-1'>
          {discount.tours.slice(0, 2).map((tour) => (
            <span
              key={tour.id}
              className='px-2 py-1 bg-gray-100 rounded text-xs'
            >
              {tour.title}
            </span>
          ))}
          {discount.tours.length > 2 && (
            <span className='px-2 py-1 bg-gray-100 rounded text-xs'>
              +{discount.tours.length - 2} more
            </span>
          )}
        </div>
      </div>

      <div className='mt-4 flex gap-2'>
        <button className='flex-1 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition text-sm'>
          Edit
        </button>
        <button className='px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition text-sm'>
          Delete
        </button>
      </div>
    </div>
  )
}

function CreateDiscountModal({
  onClose,
  onSuccess,
  guideId
}: {
  onClose: () => void
  onSuccess: () => void
  guideId: string
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountPercentage: '',
    startDate: '',
    endDate: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            mutation CreateDiscountGroup($input: CreateDiscountGroupDto!) {
              createDiscountGroup(input: $input) {
                id
                name
              }
            }
          `,
          variables: {
            input: {
              ...formData,
              discountPercentage: parseFloat(formData.discountPercentage),
              guideId,
              isActive: true
            }
          }
        })
      })

      const { data } = await response.json()
      if (data?.createDiscountGroup) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating discount:', error)
      alert('Failed to create discount')
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-8 max-w-md w-full'>
        <h2 className='text-2xl font-bold mb-6'>Create Discount Group</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Name *</label>
            <input
              type='text'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>
              Discount Percentage *
            </label>
            <input
              type='number'
              min='0'
              max='100'
              value={formData.discountPercentage}
              onChange={(e) =>
                setFormData({ ...formData, discountPercentage: e.target.value })
              }
              className='w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Start Date *
              </label>
              <input
                type='date'
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className='w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                End Date *
              </label>
              <input
                type='date'
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className='w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
          </div>
          <div className='flex gap-2 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 border rounded hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
