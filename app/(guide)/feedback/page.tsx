'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_MY_REVIEWS, CREATE_FEEDBACK_REPORT } from '@/graphql/reviews'
import { toast } from 'sonner'

interface Review {
  id: string
  guide_rating: number
  tour_rating: number
  average_rating: number
  comment: string
  created_at: string
  best_tour_part?: string
  worst_tour_part?: string
  best_guide_part?: string
  worst_guide_part?: string
  user: {
    id: string
    username: string
    fullName?: string
  }
  tour: {
    id: string
    title: string
  }
}

const HIGHLIGHT_LABELS: Record<string, string> = {
  PLACES: 'Places',
  INTERESTING: 'Interesting',
  AMABILITY: 'Friendliness',
  VALUE: 'Value',
  GUIDE_KNOWLEDGE: 'Guide Knowledge',
  ORGANIZATION: 'Organization',
  ENTERTAINMENT: 'Entertainment',
  SCENERY: 'Scenery',
  CULTURAL_VALUE: 'Cultural Value',
  FOOD: 'Food',
  ACCESSIBILITY: 'Accessibility',
  KNOWLEDGEABLE: 'Knowledgeable',
  FRIENDLY: 'Friendly',
  ENTHUSIASTIC: 'Enthusiastic',
  ORGANIZED: 'Organized',
  ATTENTIVE: 'Attentive',
  COMMUNICATION: 'Communication',
  FUNNY: 'Funny',
  MULTILINGUAL: 'Multilingual',
  PROFESSIONAL: 'Professional',
  NONE: 'None'
}

export default function FeedbackPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all')
  const [reportingReview, setReportingReview] = useState<Review | null>(null)

  const { data, loading } = useQuery<{ getMyReviews: Review[] }>(GET_MY_REVIEWS, {
    skip: !user
  })

  const [createReportMutation, { loading: reporting }] = useMutation(CREATE_FEEDBACK_REPORT, {
    onCompleted: () => {
      toast.success('Review reported successfully. Our team will review it.')
      setReportingReview(null)
    },
    onError: (error) => {
      console.error('Error reporting review:', error)
      toast.error('Failed to report review')
    }
  })

  const reviews = data?.getMyReviews || []

  const handleReport = async (reason: string) => {
    if (!reportingReview || !user) return

    try {
      await createReportMutation({
        variables: {
          input: {
            reporterId: user.id,
            reviewId: reportingReview.id,
            reason
          }
        }
      })
    } catch {
      // Handled by onError
    }
  }

  const filteredReviews =
    filter === 'all'
      ? reviews
      : reviews.filter((r) => Math.round(r.average_rating) === filter)

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.average_rating, 0) / reviews.length
      : 0

  const avgGuideRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.guide_rating, 0) / reviews.length
      : 0

  const avgTourRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.tour_rating, 0) / reviews.length
      : 0

  if (loading) {
    return (
      <div className='p-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/4'></div>
          <div className='grid grid-cols-1 md:grid-cols-5 gap-6'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='h-24 bg-gray-200 rounded-lg'></div>
            ))}
          </div>
          <div className='h-64 bg-gray-200 rounded-lg'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold mb-8'>Feedback & Reviews</h1>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Total Reviews</p>
          <p className='text-3xl font-bold'>{reviews.length}</p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Overall Rating</p>
          <p className='text-3xl font-bold text-yellow-600'>
            {averageRating.toFixed(1)}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Guide Rating</p>
          <p className='text-3xl font-bold text-blue-600'>
            {avgGuideRating.toFixed(1)}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Tour Rating</p>
          <p className='text-3xl font-bold text-green-600'>
            {avgTourRating.toFixed(1)}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>5 Star Reviews</p>
          <p className='text-3xl font-bold text-yellow-600'>
            {reviews.filter((r) => Math.round(r.average_rating) === 5).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow p-4 mb-6'>
        <div className='flex gap-2 flex-wrap'>
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            All ({reviews.length})
          </FilterButton>
          {[5, 4, 3, 2, 1].map((stars) => (
            <FilterButton
              key={stars}
              active={filter === stars}
              onClick={() => setFilter(stars as 5 | 4 | 3 | 2 | 1)}
            >
              {'★'.repeat(stars)} ({reviews.filter((r) => Math.round(r.average_rating) === stars).length})
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-12 text-center'>
          <p className='text-gray-500'>No reviews found</p>
          {filter !== 'all' && (
            <p className='text-sm text-gray-400 mt-2'>Try changing the filter</p>
          )}
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onReport={() => setReportingReview(review)}
            />
          ))}
        </div>
      )}

      {/* Report Modal */}
      {reportingReview && (
        <ReportModal
          review={reportingReview}
          onClose={() => setReportingReview(null)}
          onReport={handleReport}
          loading={reporting}
        />
      )}
    </div>
  )
}

function ReviewCard({
  review,
  onReport
}: {
  review: Review
  onReport: () => void
}) {
  const reviewerName = review.user.fullName || review.user.username
  const roundedAvg = Math.round(review.average_rating)

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <p className='font-semibold text-lg'>{review.tour.title}</p>
          <p className='text-sm text-gray-600'>by {reviewerName}</p>
          <p className='text-xs text-gray-400 mt-1'>
            {format(new Date(review.created_at), 'MMM d, yyyy')}
          </p>
        </div>
        <div className='text-right'>
          <div className='text-yellow-500 text-lg mb-1'>
            {'★'.repeat(roundedAvg)}
            {'☆'.repeat(5 - roundedAvg)}
          </div>
          <div className='flex gap-3 text-xs text-gray-500'>
            <span>Guide: {review.guide_rating}/5</span>
            <span>Tour: {review.tour_rating}/5</span>
          </div>
        </div>
      </div>

      {review.comment && (
        <p className='text-gray-700 mb-4'>{review.comment}</p>
      )}

      {/* Highlights */}
      <div className='flex flex-wrap gap-2 mb-4'>
        {review.best_guide_part && review.best_guide_part !== 'NONE' && (
          <span className='px-2 py-1 bg-green-50 text-green-700 rounded text-xs'>
            + {HIGHLIGHT_LABELS[review.best_guide_part] || review.best_guide_part}
          </span>
        )}
        {review.best_tour_part && review.best_tour_part !== 'NONE' && (
          <span className='px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs'>
            + {HIGHLIGHT_LABELS[review.best_tour_part] || review.best_tour_part}
          </span>
        )}
        {review.worst_guide_part && review.worst_guide_part !== 'NONE' && (
          <span className='px-2 py-1 bg-red-50 text-red-700 rounded text-xs'>
            - {HIGHLIGHT_LABELS[review.worst_guide_part] || review.worst_guide_part}
          </span>
        )}
        {review.worst_tour_part && review.worst_tour_part !== 'NONE' && (
          <span className='px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs'>
            - {HIGHLIGHT_LABELS[review.worst_tour_part] || review.worst_tour_part}
          </span>
        )}
      </div>

      {roundedAvg <= 3 && (
        <button
          onClick={onReport}
          className='text-sm text-red-600 hover:text-red-800 transition'
        >
          Report as unfair
        </button>
      )}
    </div>
  )
}

function FilterButton({
  children,
  active,
  onClick
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-medium text-sm transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50 border'
      }`}
    >
      {children}
    </button>
  )
}

function ReportModal({
  review,
  onClose,
  onReport,
  loading
}: {
  review: Review
  onClose: () => void
  onReport: (reason: string) => void
  loading: boolean
}) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      toast.error('Please provide a reason')
      return
    }
    onReport(reason)
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-8 max-w-md w-full'>
        <h2 className='text-xl font-bold mb-2'>Report Unfair Review</h2>
        <p className='text-sm text-gray-500 mb-6'>
          Review by {review.user.fullName || review.user.username} for &quot;{review.tour.title}&quot;
        </p>

        <div className='bg-gray-50 rounded p-4 mb-6'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-yellow-500'>
              {'★'.repeat(Math.round(review.average_rating))}
            </span>
            <span className='text-sm text-gray-500'>
              ({review.average_rating.toFixed(1)})
            </span>
          </div>
          {review.comment && (
            <p className='text-sm text-gray-600'>&quot;{review.comment}&quot;</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>
              Why do you think this review is unfair? *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='w-full px-4 py-3 border rounded focus:ring-2 focus:ring-red-500'
              rows={4}
              placeholder='Explain why this review should be reviewed by our team...'
              required
            />
          </div>

          <div className='flex gap-2 pt-2'>
            <button
              type='button'
              onClick={onClose}
              disabled={loading}
              className='flex-1 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2'
            >
              {loading && (
                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              )}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
