'use client'

import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_RESERVATION_DETAIL, UPDATE_RESERVATION_STATUS, type UpdateReservationStatusInput } from '@/graphql/reservations'
import { GET_OR_CREATE_CONVERSATION } from '@/graphql/chat'
import { useAuth } from '@/contexts/AuthContext'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Calendar, DollarSign, MapPin, Clock, MessageCircle } from 'lucide-react'
import { getDisplayError } from '@/utils/errorMessages'

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
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { featureFlags } = useAuth()

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

  const [getOrCreateConversation, { loading: openingChat }] = useMutation(GET_OR_CREATE_CONVERSATION)

  const reservation = data?.tourReservation

  const handleOpenChat = async (touristId: string) => {
    try {
      const res = await getOrCreateConversation({ variables: { otherUserId: touristId } })
      const conversationId = (res.data as { getOrCreateConversation?: { id: string } })
        ?.getOrCreateConversation?.id
      if (conversationId) router.push(`/chat/${conversationId}`)
    } catch (err) {
      toast.error(getDisplayError(err))
    }
  }

  const handleAction = async () => {
    if (!reservation || !actionType) return

    const input: UpdateReservationStatusInput = {}

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
      <div className='animate-pulse space-y-6'>
        <div className='h-6 rounded w-32' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
        <div className='h-10 rounded w-1/3' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 h-64 rounded-lg' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
          <div className='h-64 rounded-lg' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
        </div>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 hover:opacity-80 mb-6'
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft className='w-5 h-5' />
          Back to Orders
        </button>
        <div className='border px-4 py-3 rounded-lg' style={{ backgroundColor: 'var(--color-danger-light)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
          {error ? getDisplayError(error) : 'Reservation not found'}
        </div>
      </div>
    )
  }

  const customerName = reservation.user.fullName || reservation.user.username
  const statusTimeline = getStatusTimeline(reservation.reservation_status)
  const canTakeAction = reservation.reservation_status === 'PENDING' || reservation.reservation_status === 'CONFIRMED'

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className='flex items-center gap-2 hover:opacity-80 mb-6'
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <ArrowLeft className='w-5 h-5' />
        Back to Orders
      </button>

      {/* Header */}
      <div className='flex justify-between items-start mb-8'>
        <div>
          <h1 className='text-3xl font-bold mb-1' style={{ color: 'var(--color-text-heading)' }}>Reservation Details</h1>
          <p className='text-sm' style={{ color: 'var(--color-text-muted)' }}>ID: {reservation.id}</p>
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
          <div
            className='rounded-xl border p-6'
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2' style={{ color: 'var(--color-text-heading)' }}>
              <MapPin className='w-5 h-5' style={{ color: 'var(--color-primary)' }} />
              Tour Information
            </h2>
            <div className='space-y-3'>
              <p className='text-lg font-medium' style={{ color: 'var(--color-text-heading)' }}>{reservation.tour.title}</p>
              {reservation.tour.description && (
                <p className='text-sm' style={{ color: 'var(--color-text-body)' }}>{reservation.tour.description}</p>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div
            className='rounded-xl border p-6'
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2' style={{ color: 'var(--color-text-heading)' }}>
              <User className='w-5 h-5' style={{ color: 'var(--color-primary)' }} />
              Customer Information
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <InfoCard label='Name' value={customerName} />
              <InfoCard label='Username' value={reservation.user.username} />
              <InfoCard label='Email' value={reservation.user.email} />
            </div>
            {featureFlags.chatEnabled && reservation.user.id && (
              <button
                onClick={() => handleOpenChat(reservation.user.id)}
                disabled={openingChat}
                className='mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition hover:opacity-80 disabled:opacity-50'
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              >
                <MessageCircle className='w-4 h-4' />
                Chatear con el cliente
              </button>
            )}
          </div>

          {/* Schedule Information */}
          <div
            className='rounded-xl border p-6'
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2' style={{ color: 'var(--color-text-heading)' }}>
              <Clock className='w-5 h-5' style={{ color: 'var(--color-primary)' }} />
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
          <div
            className='rounded-xl border p-6'
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <h2 className='text-lg font-semibold mb-6' style={{ color: 'var(--color-text-heading)' }}>Status Timeline</h2>
            <div className='flex items-center justify-between'>
              {statusTimeline.map((step, index) => (
                <div key={step.label} className='flex items-center flex-1'>
                  <div className='flex flex-col items-center'>
                    <div
                      className='w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium'
                      style={
                        step.active
                          ? step.isCurrent
                            ? { backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }
                            : { backgroundColor: 'var(--color-success)', color: '#FFFFFF' }
                          : { backgroundColor: 'var(--color-section-bg)', color: 'var(--color-text-muted)' }
                      }
                    >
                      {step.active && !step.isCurrent ? '\u2713' : index + 1}
                    </div>
                    <p className={`text-xs mt-2 font-medium`} style={{ color: step.active ? 'var(--color-text-heading)' : 'var(--color-text-muted)' }}>
                      {step.label}
                    </p>
                  </div>
                  {index < statusTimeline.length - 1 && (
                    <div
                      className='flex-1 h-1 mx-2 rounded'
                      style={{ backgroundColor: statusTimeline[index + 1].active ? 'var(--color-success)' : 'var(--color-section-bg)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Reason */}
          {reservation.cancellation_reason && (
            <div
              className='border rounded-xl p-6'
              style={{ backgroundColor: 'var(--color-danger-light)', borderColor: 'var(--color-danger)' }}
            >
              <h2 className='text-lg font-semibold mb-2' style={{ color: 'var(--color-danger)' }}>Cancellation Reason</h2>
              <p className='text-sm' style={{ color: 'var(--color-danger)' }}>{reservation.cancellation_reason}</p>
            </div>
          )}
        </div>

        {/* Sidebar - right side */}
        <div className='space-y-6'>
          {/* Payment */}
          <div
            className='rounded-xl border p-6'
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2' style={{ color: 'var(--color-text-heading)' }}>
              <DollarSign className='w-5 h-5' style={{ color: 'var(--color-success)' }} />
              Payment
            </h2>
            <div className='space-y-4'>
              <div className='text-center py-4 rounded-lg' style={{ backgroundColor: 'var(--color-section-bg)' }}>
                <p className='text-sm mb-1' style={{ color: 'var(--color-text-muted)' }}>Total Amount</p>
                <p className='text-3xl font-bold' style={{ color: 'var(--color-success)' }}>${reservation.total_amount?.toFixed(2)}</p>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span style={{ color: 'var(--color-text-muted)' }}>Payment Status</span>
                  <span className='font-medium' style={{ color: 'var(--color-text-heading)' }}>{reservation.payment_status}</span>
                </div>
                {reservation.paid_at && (
                  <div className='flex justify-between text-sm'>
                    <span style={{ color: 'var(--color-text-muted)' }}>Paid At</span>
                    <span className='font-medium' style={{ color: 'var(--color-text-heading)' }}>{format(new Date(reservation.paid_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {reservation.invoice_number && (
                  <div className='flex justify-between text-sm'>
                    <span style={{ color: 'var(--color-text-muted)' }}>Invoice</span>
                    <span className='font-medium' style={{ color: 'var(--color-text-heading)' }}>{reservation.invoice_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div
            className='rounded-xl border p-6'
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2' style={{ color: 'var(--color-text-heading)' }}>
              <Calendar className='w-5 h-5' style={{ color: 'var(--color-primary)' }} />
              Dates
            </h2>
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-sm'>
                <span style={{ color: 'var(--color-text-muted)' }}>Created:</span>
                <span className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
                  {format(new Date(reservation.created_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              {reservation.paid_at && (
                <div className='flex items-center gap-2 text-sm'>
                  <span style={{ color: 'var(--color-text-muted)' }}>Paid:</span>
                  <span className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
                    {format(new Date(reservation.paid_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {canTakeAction && (
            <div
              className='rounded-xl border p-6'
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
            >
              <h2 className='text-lg font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>Actions</h2>
              <div className='space-y-2'>
                {reservation.reservation_status === 'PENDING' && (
                  <button
                    onClick={() => setActionType('CONFIRM')}
                    className='w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition font-medium'
                    style={{ backgroundColor: 'var(--color-success)' }}
                  >
                    Confirm Reservation
                  </button>
                )}
                {reservation.reservation_status === 'CONFIRMED' && (
                  <button
                    onClick={() => setActionType('COMPLETE')}
                    className='w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition font-medium'
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => setActionType('CANCEL')}
                  className='w-full px-4 py-2 border rounded-lg hover:opacity-80 transition font-medium'
                  style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
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
          <div
            className='rounded-xl p-8 max-w-md w-full'
            style={{ backgroundColor: 'var(--color-card-bg)' }}
          >
            <h2 className='text-xl font-bold mb-2' style={{ color: 'var(--color-text-heading)' }}>Cancel Reservation</h2>
            <p className='text-sm mb-6' style={{ color: 'var(--color-text-body)' }}>
              Cancel reservation for &quot;{reservation.tour.title}&quot; by {customerName}?
            </p>
            <div className='mb-6'>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Cancellation Reason (optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                style={{ borderColor: 'var(--color-card-border)' }}
                rows={3}
                placeholder='Provide a reason for cancellation...'
              />
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => { setActionType(null); setCancelReason('') }}
                disabled={updating}
                className='flex-1 px-4 py-2 border rounded-lg hover:opacity-80 disabled:opacity-50'
                style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
              >
                Go Back
              </button>
              <button
                onClick={handleAction}
                disabled={updating}
                className='flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2'
                style={{ backgroundColor: 'var(--color-danger)' }}
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
    <div className='rounded-lg p-3' style={{ backgroundColor: 'var(--color-section-bg)' }}>
      <p className='text-xs mb-1' style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className='text-sm font-medium' style={{ color: 'var(--color-text-heading)' }}>{value}</p>
    </div>
  )
}

const reservationColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
  CONFIRMED: { bg: 'var(--color-info-light)', text: 'var(--color-info)' },
  COMPLETED: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  CANCELLED: { bg: 'var(--color-danger-light)', text: 'var(--color-danger)' }
}

const paymentColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
  COMPLETED: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  FAILED: { bg: 'var(--color-danger-light)', text: 'var(--color-danger)' },
  REFUNDED: { bg: 'var(--color-info-light)', text: 'var(--color-info)' }
}

function StatusBadge({ status, colors }: { label: string; status: string; colors: Record<string, { bg: string; text: string }> }) {
  const colorSet = colors[status] || { bg: 'var(--color-section-bg)', text: 'var(--color-text-body)' }
  return (
    <span
      className='px-3 py-1 rounded-full text-xs font-medium'
      style={{ backgroundColor: colorSet.bg, color: colorSet.text }}
    >
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
