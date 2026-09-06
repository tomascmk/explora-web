'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { DISCOUNT_GROUPS_BY_GUIDE, UPDATE_DISCOUNT_GROUP, DELETE_DISCOUNT_GROUP, CREATE_DISCOUNT_GROUP, type DiscountGroupInput } from '@/graphql/discount-groups'
import { GET_TOURS_BY_GUIDE, type ToursByGuideData } from '@/graphql/tours'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { toast } from 'sonner'
import { formatMoney } from '@/lib/formatMoney';

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
  const [toggleTarget, setToggleTarget] = useState<DiscountGroup | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { data, loading, refetch } = useQuery<{ discountGroupsByGuide: DiscountGroup[] }>(
    DISCOUNT_GROUPS_BY_GUIDE,
    {
      variables: { guideId: user?.id },
      skip: !user
    }
  )

  // Apollo merges by `id` (UPDATE_DISCOUNT_GROUP returns the updated entity), no refetch needed.
  const [updateDiscountMutation] = useMutation(UPDATE_DISCOUNT_GROUP)

  const [deleteDiscountMutation, { loading: deleting }] = useMutation(DELETE_DISCOUNT_GROUP, {
    update: (cache, _result, options) => {
      const id = options?.variables?.id
      if (!id) return
      const cacheId = cache.identify({ __typename: 'DiscountGroup', id })
      if (cacheId) {
        cache.evict({ id: cacheId })
        cache.gc()
      }
    },
    onCompleted: () => {
      setDeleteTarget(null)
      toast.success('Discount group deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete discount group')
      console.error('Error deleting discount:', error)
    }
  })

  const discounts = data?.discountGroupsByGuide || []

  const requestToggleActive = (discount: DiscountGroup) => {
    setToggleTarget(discount)
  }

  const confirmToggleActive = async () => {
    if (!toggleTarget) return
    const { id, isActive } = toggleTarget
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
      setToggleTarget(null)
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
      <div>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 rounded w-1/4' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-64 rounded-xl' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title='Discount Groups'
        subtitle={`${discounts.length} discount group${discounts.length !== 1 ? 's' : ''} total`}
        actions={
          <button
            onClick={() => {
              setEditingDiscount(null)
              setShowCreateModal(true)
            }}
            className='text-white px-6 py-2 rounded-lg hover:opacity-90 transition'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            + Create Discount Group
          </button>
        }
      />

      {discounts.length === 0 ? (
        <div
          className='rounded-xl border p-12 text-center'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <div className='text-6xl mb-4'>🏷️</div>
          <p className='mb-4' style={{ color: 'var(--color-text-muted)' }}>No discount groups created yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='text-white px-6 py-2 rounded-lg hover:opacity-90 transition'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Create Your First Discount
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {discounts.map((discount) => (
            <DiscountCard
              key={discount.id}
              discount={discount}
              toggling={togglingId === discount.id}
              onToggleActive={() => requestToggleActive(discount)}
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

      <ConfirmModal
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={confirmToggleActive}
        title={toggleTarget?.isActive ? 'Deactivate Discount Group?' : 'Activate Discount Group?'}
        description={
          toggleTarget?.isActive
            ? `"${toggleTarget?.name}" will no longer apply to new bookings until you reactivate it.`
            : `"${toggleTarget?.name}" will start applying to new bookings immediately.`
        }
        confirmText={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.isActive ? 'danger' : 'primary'}
        loading={togglingId === toggleTarget?.id}
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
  onToggleActive: () => void
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

  return (
    <div
      className='rounded-xl border p-6'
      style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
    >
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h3 className='text-lg font-semibold' style={{ color: 'var(--color-text-heading)' }}>{discount.name}</h3>
          <p className='text-2xl font-bold mt-1' style={{ color: 'var(--color-primary)' }}>
            {discount.discountType === 'percentage'
              ? `${discount.discountPercentage}% OFF`
              : `${formatMoney(Number(discount.discountAmount ?? 0), null)} OFF`}
          </p>
        </div>
        <button
          onClick={onToggleActive}
          disabled={toggling || isExpired}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            toggling ? 'opacity-50 cursor-wait' : isExpired ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
          }`}
        >
          <StatusBadge status={statusLabel} />
        </button>
      </div>

      {discount.description && (
        <p className='text-sm mb-4' style={{ color: 'var(--color-text-secondary)' }}>{discount.description}</p>
      )}

      <div className='space-y-2 mb-4'>
        <div className='flex justify-between text-sm'>
          <span style={{ color: 'var(--color-text-secondary)' }}>Start:</span>
          <span className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
            {format(new Date(discount.startDate), 'MMM d, yyyy')}
          </span>
        </div>
        <div className='flex justify-between text-sm'>
          <span style={{ color: 'var(--color-text-secondary)' }}>End:</span>
          <span className='font-medium' style={{ color: isExpired ? 'var(--color-danger)' : 'var(--color-text-heading)' }}>
            {format(new Date(discount.endDate), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <div className='pt-4' style={{ borderTop: '1px solid var(--color-card-border)' }}>
        <p className='text-sm mb-2' style={{ color: 'var(--color-text-secondary)' }}>
          Applied to {discount.tours.length} tour(s)
        </p>
        <div className='flex flex-wrap gap-1'>
          {discount.tours.slice(0, 2).map((tour) => (
            <span
              key={tour.id}
              className='px-2 py-1 rounded text-xs'
              style={{ backgroundColor: 'var(--color-section-bg)', color: 'var(--color-text-body)' }}
            >
              {tour.title}
            </span>
          ))}
          {discount.tours.length > 2 && (
            <span
              className='px-2 py-1 rounded text-xs'
              style={{ backgroundColor: 'var(--color-section-bg)', color: 'var(--color-text-body)' }}
            >
              +{discount.tours.length - 2} more
            </span>
          )}
        </div>
      </div>

      <div className='mt-4 flex gap-2'>
        <button
          onClick={onEdit}
          className='flex-1 px-4 py-2 rounded-lg hover:opacity-80 transition text-sm'
          style={{ backgroundColor: 'var(--color-section-bg)', color: 'var(--color-text-body)' }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className='px-4 py-2 border rounded-lg hover:opacity-80 transition text-sm'
          style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
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

  const { data: toursData } = useQuery<ToursByGuideData>(GET_TOURS_BY_GUIDE, {
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

    const input: DiscountGroupInput = {
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
    } catch {
      // Errors handled by onError callbacks
    }
  }

  const tours = toursData?.toursByGuide || []

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div
        className='rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto'
        style={{ backgroundColor: 'var(--color-card-bg)' }}
      >
        <h2 className='text-2xl font-bold mb-6' style={{ color: 'var(--color-text-heading)' }}>
          {editingDiscount ? 'Edit' : 'Create'} Discount Group
        </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Name *</label>
            <input
              type='text'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
              style={{ borderColor: 'var(--color-card-border)' }}
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
              style={{ borderColor: 'var(--color-card-border)' }}
              rows={2}
              placeholder='Optional description for this discount group...'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
              Discount Type *
            </label>
            <select
              value={formData.discountType}
              onChange={(e) =>
                setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed_amount' })
              }
              className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
              style={{ borderColor: 'var(--color-card-border)' }}
              required
            >
              <option value='percentage'>Percentage</option>
              <option value='fixed_amount'>Fixed Amount</option>
            </select>
          </div>

          {formData.discountType === 'percentage' ? (
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
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
                className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                style={{ borderColor: 'var(--color-card-border)' }}
                required
              />
            </div>
          ) : (
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
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
                className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                style={{ borderColor: 'var(--color-card-border)' }}
                required
              />
            </div>
          )}

          <div>
            <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
              Select Tours *
            </label>
            <div
              className='border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2'
              style={{ borderColor: 'var(--color-card-border)' }}
            >
              {tours.length === 0 ? (
                <p className='text-sm' style={{ color: 'var(--color-text-muted)' }}>No tours available. Create a tour first.</p>
              ) : (
                tours.map((tour) => (
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
                    <span className='text-sm' style={{ color: 'var(--color-text-body)' }}>{tour.title}</span>
                  </label>
                ))
              )}
            </div>
            {selectedTours.length > 0 && (
              <p className='text-xs mt-1' style={{ color: 'var(--color-text-muted)' }}>{selectedTours.length} tour(s) selected</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
                Start Date *
              </label>
              <input
                type='date'
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                style={{ borderColor: 'var(--color-card-border)' }}
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
                End Date *
              </label>
              <input
                type='date'
                value={formData.endDate}
                min={formData.startDate || undefined}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                style={{ borderColor: 'var(--color-card-border)' }}
                required
              />
            </div>
          </div>

          <div className='flex gap-2 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 border rounded-lg hover:opacity-80 transition'
              style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={creating || updating}
              className='flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition'
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {creating || updating ? 'Saving...' : editingDiscount ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
