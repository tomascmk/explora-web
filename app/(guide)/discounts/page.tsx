'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { DISCOUNT_GROUPS_BY_GUIDE, UPDATE_DISCOUNT_GROUP, DELETE_DISCOUNT_GROUP, CREATE_DISCOUNT_GROUP } from '@/graphql/discount-groups'
import { GET_TOURS_BY_GUIDE } from '@/graphql/tours'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { toast } from 'sonner'

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
  createdAt: string
  updatedAt: string
}

export default function DiscountsPage() {
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<DiscountGroup | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DiscountGroup | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { data, loading, refetch } = useQuery<{ discountGroupsByGuide: DiscountGroup[] }>(
    DISCOUNT_GROUPS_BY_GUIDE,
    {
      variables: { guideId: user?.id },
      skip: !user
    }
  )

  const [updateDiscountMutation] = useMutation(UPDATE_DISCOUNT_GROUP, {
    onCompleted: () => refetch()
  })

  const [deleteDiscountMutation, { loading: deleting }] = useMutation(DELETE_DISCOUNT_GROUP, {
    onCompleted: () => {
      refetch()
      setDeleteTarget(null)
      toast.success('Discount group deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete discount group')
      console.error('Error deleting discount:', error)
    }
  })

  const discounts = data?.discountGroupsByGuide || []

  const toggleActive = async (id: string, isActive: boolean) => {
    setTogglingId(id)
    try {
      await updateDiscountMutation({
        variables: {
          id,
          input: { isActive: !isActive }
        }
      })
      toast.success(`Discount ${!isActive ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error toggling discount:', error)
      toast.error('Failed to update discount status')
    } finally {
      setTogglingId(null)
    }
  }

  const handleEdit = (discount: DiscountGroup) => {
    setEditingDiscount(discount)
    setShowCreateModal(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteDiscountMutation({ variables: { id: deleteTarget.id } })
    } catch (error) {
      console.error('Error deleting discount:', error)
    }
  }

  if (loading) {
    return (
      <div className='p-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/4'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-64 bg-gray-200 rounded-lg'></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Discount Groups</h1>
          <p className='text-gray-500 mt-1'>
            {discounts.length} discount group{discounts.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDiscount(null)
            setShowCreateModal(true)
          }}
          className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition'
        >
          + Create Discount Group
        </button>
      </div>

      {discounts.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-12 text-center'>
          <div className='text-6xl mb-4'>🏷️</div>
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
              toggling={togglingId === discount.id}
              onToggleActive={(id, isActive) => toggleActive(id, isActive)}
              onEdit={() => handleEdit(discount)}
              onDelete={() => setDeleteTarget(discount)}
            />
          ))}
        </div>
      )}

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

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title='Delete Discount Group'
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText='Delete'
        variant='danger'
        loading={deleting}
      />
    </div>
  )
}

function DiscountCard({
  discount,
  toggling,
  onToggleActive,
  onEdit,
  onDelete
}: {
  discount: DiscountGroup
  toggling: boolean
  onToggleActive: (id: string, isActive: boolean) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const isExpired = new Date(discount.endDate) < new Date()
  const isUpcoming = new Date(discount.startDate) > new Date()

  const statusLabel = isExpired
    ? 'Expired'
    : isUpcoming
    ? 'Upcoming'
    : discount.isActive
    ? 'Active'
    : 'Inactive'

  const statusColor = isExpired
    ? 'bg-gray-100 text-gray-600'
    : isUpcoming
    ? 'bg-blue-100 text-blue-800'
    : discount.isActive
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-800'

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
          disabled={toggling || isExpired}
          className={`px-3 py-1 rounded text-xs font-medium transition ${statusColor} ${
            toggling ? 'opacity-50 cursor-wait' : isExpired ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
          }`}
        >
          {toggling ? 'Updating...' : statusLabel}
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
          <span className={`font-medium ${isExpired ? 'text-red-500' : ''}`}>
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
    onCompleted: () => {
      toast.success('Discount group created successfully')
      onSuccess()
    },
    onError: (error) => {
      console.error('Error creating discount:', error)
      toast.error('Failed to create discount group')
    }
  })

  const [updateDiscountMutation, { loading: updating }] = useMutation(UPDATE_DISCOUNT_GROUP, {
    onCompleted: () => {
      toast.success('Discount group updated successfully')
      onSuccess()
    },
    onError: (error) => {
      console.error('Error updating discount:', error)
      toast.error('Failed to update discount group')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (selectedTours.length === 0) {
      toast.error('Please select at least one tour')
      return
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date')
      return
    }

    const input: any = {
      name: formData.name,
      description: formData.description,
      discountType: formData.discountType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      tourIds: selectedTours,
      isActive: editingDiscount?.isActive ?? true
    }

    if (formData.discountType === 'percentage') {
      input.discountPercentage = parseFloat(formData.discountPercentage)
    } else {
      input.discountAmount = parseFloat(formData.discountAmount)
    }

    try {
      if (editingDiscount) {
        await updateDiscountMutation({
          variables: { id: editingDiscount.id, input }
        })
      } else {
        await createDiscountMutation({
          variables: { input: { ...input, guideId } }
        })
      }
    } catch (error) {
      // Errors handled by onError callbacks
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
            <label className='block text-sm font-medium mb-2'>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500'
              rows={2}
              placeholder='Optional description for this discount group...'
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
                <p className='text-sm text-gray-500'>No tours available. Create a tour first.</p>
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
            {selectedTours.length > 0 && (
              <p className='text-xs text-gray-500 mt-1'>{selectedTours.length} tour(s) selected</p>
            )}
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
                min={formData.startDate || undefined}
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
