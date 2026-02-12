'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { DISCOUNT_GROUPS_BY_GUIDE, UPDATE_DISCOUNT_GROUP, DELETE_DISCOUNT_GROUP, CREATE_DISCOUNT_GROUP } from '@/graphql/discount-groups'
import { GET_TOURS_BY_GUIDE } from '@/graphql/tours'

interface DiscountGroup {
  id: string
  name: string
  description: string
  discountType: 'percentage' | 'fixed_amount'
  discountPercentage?: number
  discountAmount?: number
  startDate: string
  endDate: string
  isActive: boolean
  tours: { id: string; title: string }[]
}

export default function DiscountsPage() {
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<DiscountGroup | null>(null)

  const { data, loading, refetch } = useQuery<{ discountGroupsByGuide: DiscountGroup[] }>(
    DISCOUNT_GROUPS_BY_GUIDE,
    { skip: !user }
  )

  const [updateDiscountMutation] = useMutation(UPDATE_DISCOUNT_GROUP, {
    onCompleted: () => refetch()
  })

  const [deleteDiscountMutation] = useMutation(DELETE_DISCOUNT_GROUP, {
    onCompleted: () => refetch()
  })

  const discounts = data?.discountGroupsByGuide || []

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateDiscountMutation({
        variables: {
          input: { id, isActive: !isActive }
        }
      })
    } catch (error) {
      console.error('Error toggling discount:', error)
      alert('Failed to update discount')
    }
  }

  const handleEdit = (discount: DiscountGroup) => {
    setEditingDiscount(discount)
    setShowCreateModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount group?')) return

    try {
      await deleteDiscountMutation({ variables: { id } })
    } catch (error) {
      console.error('Error deleting discount:', error)
      alert('Failed to delete discount')
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
              onEdit={() => handleEdit(discount)}
              onDelete={() => handleDelete(discount.id)}
            />
          ))}
        </div>
      )}

      {/* Create Modal - Simple implementation */}
      {showCreateModal && (
        <CreateDiscountModal
          onClose={() => {
            setShowCreateModal(false)
            setEditingDiscount(null)
          }}
          onSuccess={() => {
            refetch()
            setShowCreateModal(false)
            setEditingDiscount(null)
          }}
          guideId={user?.id || ''}
          editingDiscount={editingDiscount}
        />
      )}
    </div>
  )
}

function DiscountCard({
  discount,
  onToggleActive,
  onEdit,
  onDelete
}: {
  discount: DiscountGroup
  onToggleActive: (id: string, isActive: boolean) => void
  onEdit: () => void
  onDelete: () => void
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
            {discount.discountType === 'percentage'
              ? `${discount.discountPercentage}% OFF`
              : `$${discount.discountAmount} OFF`}
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
        <button 
          onClick={onEdit}
          className='flex-1 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition text-sm'
        >
          Edit
        </button>
        <button 
          onClick={onDelete}
          className='px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition text-sm'
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function CreateDiscountModal({
  onClose,
  onSuccess,
  guideId,
  editingDiscount
}: {
  onClose: () => void
  onSuccess: () => void
  guideId: string
  editingDiscount?: DiscountGroup | null
}) {
  const [formData, setFormData] = useState({
    name: editingDiscount?.name || '',
    description: editingDiscount?.description || '',
    discountType: editingDiscount?.discountType || 'percentage',
    discountPercentage: editingDiscount?.discountPercentage?.toString() || '',
    discountAmount: editingDiscount?.discountAmount?.toString() || '',
    startDate: editingDiscount?.startDate?.split('T')[0] || '',
    endDate: editingDiscount?.endDate?.split('T')[0] || ''
  })

  const { data: toursData } = useQuery<{ toursByGuide: any[] }>(GET_TOURS_BY_GUIDE, {
    variables: { guideId },
    skip: !guideId
  })

  const [selectedTours, setSelectedTours] = useState<string[]>(
    editingDiscount?.tours.map(t => t.id) || []
  )

  const [createDiscountMutation, { loading: creating }] = useMutation(CREATE_DISCOUNT_GROUP, {
    onCompleted: () => onSuccess(),
    onError: (error) => {
      console.error('Error creating discount:', error)
      alert('Failed to create discount')
    }
  })

  const [updateDiscountMutation, { loading: updating }] = useMutation(UPDATE_DISCOUNT_GROUP, {
    onCompleted: () => onSuccess(),
    onError: (error) => {
      console.error('Error updating discount:', error)
      alert('Failed to update discount')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const input: any = {
      name: formData.name,
      description: formData.description,
      discountType: formData.discountType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      tourIds: selectedTours,
      isActive: true
    }

    // Agregar el campo correcto según el tipo de descuento
    if (formData.discountType === 'percentage') {
      input.discountPercentage = parseFloat(formData.discountPercentage)
    } else {
      input.discountAmount = parseFloat(formData.discountAmount)
    }

    if (editingDiscount) {
      await updateDiscountMutation({
        variables: { input: { id: editingDiscount.id, ...input } }
      })
    } else {
      await createDiscountMutation({
        variables: { input: { ...input, guideId } }
      })
    }
  }

  const tours = toursData?.toursByGuide || []

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <h2 className='text-2xl font-bold mb-6'>
          {editingDiscount ? 'Edit' : 'Create'} Discount Group
        </h2>
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
              Discount Type *
            </label>
            <select
              value={formData.discountType}
              onChange={(e) =>
                setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed_amount' })
              }
              className='w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500'
              required
            >
              <option value='percentage'>Percentage</option>
              <option value='fixed_amount'>Fixed Amount</option>
            </select>
          </div>

          {formData.discountType === 'percentage' ? (
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
          ) : (
            <div>
              <label className='block text-sm font-medium mb-2'>
                Discount Amount ($) *
              </label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={formData.discountAmount}
                onChange={(e) =>
                  setFormData({ ...formData, discountAmount: e.target.value })
                }
                className='w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
          )}
          <div>
            <label className='block text-sm font-medium mb-2'>
              Select Tours *
            </label>
            <div className='border rounded p-3 max-h-40 overflow-y-auto space-y-2'>
              {tours.length === 0 ? (
                <p className='text-sm text-gray-500'>No tours available</p>
              ) : (
                tours.map((tour: any) => (
                  <label key={tour.id} className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={selectedTours.includes(tour.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTours([...selectedTours, tour.id])
                        } else {
                          setSelectedTours(selectedTours.filter(id => id !== tour.id))
                        }
                      }}
                      className='rounded'
                    />
                    <span className='text-sm'>{tour.title}</span>
                  </label>
                ))
              )}
            </div>
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
              disabled={creating || updating}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400'
            >
              {creating || updating ? 'Saving...' : editingDiscount ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
