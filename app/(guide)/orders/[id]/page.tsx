'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_RESERVATION_DETAIL, UPDATE_RESERVATION_STATUS } from '@/graphql/reservations'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Calendar, DollarSign, MapPin, Clock, Users } from 'lucide-react'
import Link from 'next/link'

interface ReservationDetail {
  id: string
  reservation_status: string
  payment_status: string
  total_amount: number
  created_at: string
  cancellation_reason?: string
  paid_at?: string
  is_invoice_generated?: boolean
  invoice_number?: string
  schedule: {
    id: string
    startTime: string
    endTime?: string
    maxCapacity?: number
    specialInfo?: string
  }
  tour: {
    id: string
    title: string
    description?: string
  }
  user: {
    id: string
    fullName?: string
    email: string
    username: string
  }
}

export default function OrderDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [actionType, setActionType] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const { data, loading, error, refetch } = useQuery<{ tourReservation: ReservationDetail }>(
    GET_RESERVATION_DETAIL,
    {
      variables: { id },
      skip: !id
    }
  )

  const [updateStatusMutation, { loading: updating }] = useMutation(UPDATE_RESERVATION_STATUS, {
    onCompleted: () => {
      refetch()
      setActionType(null)
      setCancelReason('')
    },
    onError: (err) => {
      console.error('Error updating reservation:', err)
      toast.error('Failed to update reservation')
    }
  })

  const reservation = data?.tourReservation

  const handleAction = async () => {
    if (!reservation || !actionType) return

    const input: any = {}

    switch (actionType) {
      case 'CONFIRM':
        input.reservation_status = 'CONFIRMED'
        break
      case 'COMPLETE':
        input.reservation_status = 'COMPLETED'
        input.payment_status = 'COMPLETED'
        break
      case 'CANCEL':
        input.reservation_status = 'CANCELLED'
        if (cancelReason) input.cancellation_reason = cancelReason
        break
      default:
        return
    }

    try {
      await updateStatusMutation({
        variables: { id: reservation.id, input }
      })
      const actionLabels: Record<string, string> = {
        CONFIRM: 'confirmed',
        COMPLETE: 'completed',
        CANCEL: 'cancelled'
      }
      toast.success(`Reservation ${actionLabels[actionType]}`)
    } catch {
      // Handled by onError
    }
  }

  if (loading) {
    return (
      <div className='p-8'>
        <div className='animate-pulse space-y-6'>
          <div className='h-6 bg-gray-200 rounded w-32'></div>
          <div className='h-10 bg-gray-200 rounded w-1/3'></div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 h-64 bg-gray-200 rounded-lg'></div>
            <div className='h-64 bg-gray-200 rounded-lg'></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className='p-8'>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6'
        >
          <ArrowLeft className='w-5 h-5' />
          Back to Orders
        </button>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
          {error ? error.message : 'Reservation not found'}
        </div>
      </div>
    )
  }

  const customerName = reservation.user.fullName || reservation.user.username
  const statusTimeline = getStatusTimeline(reservation.reservation_status)
  const canTakeAction = reservation.reservation_status === 'PENDING' || reservation.reservation_status === 'CONFIRMED'

  return (
    <div className='p-8'>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6'
      >
        <ArrowLeft className='w-5 h-5' />
        Back to Orders
      </button>

      {/* Header */}
      <div className='flex justify-between items-start mb-8'>
        <div>
          <h1 className='text-3xl font-bold mb-1'>Reservation Details</h1>
          <p className='text-sm text-gray-500'>ID: {reservation.id}</p>
        </div>
        <div className='flex items-center gap-3'>
          <StatusBadge label='Reservation' status={reservation.reservation_status} colors={reservationColors} />
          <StatusBadge label='Payment' status={reservation.payment_status} colors={paymentColors} />
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main content - left side */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Tour Information */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <MapPin className='w-5 h-5 text-blue-600' />
              Tour Information
            </h2>
            <div className='space-y-3'>
              <p className='text-lg font-medium text-gray-900'>{reservation.tour.title}</p>
              {reservation.tour.description && (
                <p className='text-sm text-gray-600'>{reservation.tour.description}</p>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <User className='w-5 h-5 text-blue-600' />
              Customer Information
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <InfoCard label='Name' value={customerName} />
              <InfoCard label='Username' value={reservation.user.username} />
              <InfoCard label='Email' value={reservation.user.email} />
            </div>
          </div>

          {/* Schedule Information */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Clock className='w-5 h-5 text-blue-600' />
              Schedule
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <InfoCard
                label='Start Time'
                value={format(new Date(reservation.schedule.startTime), 'EEEE, MMM d, yyyy h:mm a')}
              />
              {reservation.schedule.endTime && (
                <InfoCard
                  label='End Time'
                  value={format(new Date(reservation.schedule.endTime), 'EEEE, MMM d, yyyy h:mm a')}
                />
              )}
              {reservation.schedule.maxCapacity && (
                <InfoCard label='Max Capacity' value={`${reservation.schedule.maxCapacity} people`} />
              )}
              {reservation.schedule.specialInfo && (
                <InfoCard label='Special Info' value={reservation.schedule.specialInfo} />
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-lg font-semibold mb-6'>Status Timeline</h2>
            <div className='flex items-center justify-between'>
              {statusTimeline.map((step, index) => (
                <div key={step.label} className='flex items-center flex-1'>
                  <div className='flex flex-col items-center'>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.active
                          ? step.isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step.active && !step.isCurrent ? '✓' : index + 1}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${step.active ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                  {index < statusTimeline.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${statusTimeline[index + 1].active ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Reason */}
          {reservation.cancellation_reason && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
              <h2 className='text-lg font-semibold mb-2 text-red-800'>Cancellation Reason</h2>
              <p className='text-sm text-red-700'>{reservation.cancellation_reason}</p>
            </div>
          )}
        </div>

        {/* Sidebar - right side */}
        <div className='space-y-6'>
          {/* Payment */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <DollarSign className='w-5 h-5 text-green-600' />
              Payment
            </h2>
            <div className='space-y-4'>
              <div className='text-center py-4 bg-gray-50 rounded-lg'>
                <p className='text-sm text-gray-500 mb-1'>Total Amount</p>
                <p className='text-3xl font-bold text-green-600'>${reservation.total_amount?.toFixed(2)}</p>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Payment Status</span>
                  <span className='font-medium'>{reservation.payment_status}</span>
                </div>
                {reservation.paid_at && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>Paid At</span>
                    <span className='font-medium'>{format(new Date(reservation.paid_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {reservation.invoice_number && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>Invoice</span>
                    <span className='font-medium'>{reservation.invoice_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Calendar className='w-5 h-5 text-blue-600' />
              Dates
            </h2>
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-gray-500'>Created:</span>
                <span className='font-medium'>
                  {format(new Date(reservation.created_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              {reservation.paid_at && (
                <div className='flex items-center gap-2 text-sm'>
                  <span className='text-gray-500'>Paid:</span>
                  <span className='font-medium'>
                    {format(new Date(reservation.paid_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {canTakeAction && (
            <div className='bg-white rounded-lg shadow p-6'>
              <h2 className='text-lg font-semibold mb-4'>Actions</h2>
              <div className='space-y-2'>
                {reservation.reservation_status === 'PENDING' && (
                  <button
                    onClick={() => setActionType('CONFIRM')}
                    className='w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium'
                  >
                    Confirm Reservation
                  </button>
                )}
                {reservation.reservation_status === 'CONFIRMED' && (
                  <button
                    onClick={() => setActionType('COMPLETE')}
                    className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium'
                  >
                    Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => setActionType('CANCEL')}
                  className='w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium'
                >
                  Cancel Reservation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {actionType === 'CANCEL' && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-8 max-w-md w-full'>
            <h2 className='text-xl font-bold mb-2'>Cancel Reservation</h2>
            <p className='text-sm text-gray-600 mb-6'>
              Cancel reservation for &quot;{reservation.tour.title}&quot; by {customerName}?
            </p>
            <div className='mb-6'>
              <label className='block text-sm font-medium mb-2'>Cancellation Reason (optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className='w-full px-4 py-3 border rounded focus:ring-2 focus:ring-red-500'
                rows={3}
                placeholder='Provide a reason for cancellation...'
              />
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => { setActionType(null); setCancelReason('') }}
                disabled={updating}
                className='flex-1 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50'
              >
                Go Back
              </button>
              <button
                onClick={handleAction}
                disabled={updating}
                className='flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2'
              >
                {updating && (
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                )}
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm/Complete Modal */}
      <ConfirmModal
        isOpen={actionType === 'CONFIRM' || actionType === 'COMPLETE'}
        onClose={() => setActionType(null)}
        onConfirm={handleAction}
        title={actionType === 'CONFIRM' ? 'Confirm Reservation' : 'Complete Reservation'}
        description={
          actionType === 'CONFIRM'
            ? `Confirm reservation for "${reservation.tour.title}" by ${customerName}? The customer will be notified.`
            : `Mark reservation for "${reservation.tour.title}" by ${customerName} as completed?`
        }
        confirmText={actionType === 'CONFIRM' ? 'Confirm' : 'Complete'}
        variant='primary'
        loading={updating}
      />
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className='bg-gray-50 rounded-lg p-3'>
      <p className='text-xs text-gray-500 mb-1'>{label}</p>
      <p className='text-sm font-medium'>{value}</p>
    </div>
  )
}

const reservationColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const paymentColors: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800'
}

function StatusBadge({ label, status, colors }: { label: string; status: string; colors: Record<string, string> }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}

function getStatusTimeline(status: string) {
  if (status === 'CANCELLED') {
    return [
      { label: 'Created', active: true, isCurrent: false },
      { label: 'Cancelled', active: true, isCurrent: true }
    ]
  }

  const steps = [
    { label: 'Pending', active: false, isCurrent: false },
    { label: 'Confirmed', active: false, isCurrent: false },
    { label: 'Completed', active: false, isCurrent: false }
  ]

  const statusOrder = ['PENDING', 'CONFIRMED', 'COMPLETED']
  const currentIndex = statusOrder.indexOf(status)

  for (let i = 0; i < steps.length; i++) {
    if (i <= currentIndex) {
      steps[i].active = true
      steps[i].isCurrent = i === currentIndex
    }
  }

  return steps
}
