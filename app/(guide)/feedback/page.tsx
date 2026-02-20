'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_MY_REVIEWS, CREATE_FEEDBACK_REPORT } from '@/graphql/reviews'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { FilterButton } from '@/components/ui/FilterButton'
import { Star, Users, Award, TrendingUp } from 'lucide-react'

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
      <div>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 rounded w-1/4' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='h-24 rounded-xl' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
            ))}
          </div>
          <div className='h-64 rounded-xl' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title='Feedback & Reviews' />

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6'>
        <StatsCard
          label='Total Reviews'
          value={reviews.length}
          icon={<Users size={20} />}
          variant='default'
        />
        <StatsCard
          label='Overall Rating'
          value={averageRating.toFixed(1)}
          icon={<Star size={20} />}
          variant='warning'
        />
        <StatsCard
          label='Guide Rating'
          value={avgGuideRating.toFixed(1)}
          icon={<Award size={20} />}
          variant='primary'
        />
        <StatsCard
          label='Tour Rating'
          value={avgTourRating.toFixed(1)}
          icon={<TrendingUp size={20} />}
          variant='success'
        />
        <StatsCard
          label='5 Star Reviews'
          value={reviews.filter((r) => Math.round(r.average_rating) === 5).length}
          icon={<Star size={20} />}
          variant='warning'
        />
      </div>

      {/* Filters */}
      <div
        className='rounded-xl border p-4 mb-6'
        style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
      >
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
        <div
          className='rounded-xl border p-12 text-center'
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <p style={{ color: 'var(--color-text-muted)' }}>No reviews found</p>
          {filter !== 'all' && (
            <p className='text-sm mt-2' style={{ color: 'var(--color-text-muted)' }}>Try changing the filter</p>
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
    <div
      className='rounded-xl border p-6'
      style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
    >
      <div className='flex justify-between items-start mb-4'>
        <div>
          <p className='font-semibold text-lg' style={{ color: 'var(--color-text-heading)' }}>{review.tour.title}</p>
          <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>by {reviewerName}</p>
          <p className='text-xs mt-1' style={{ color: 'var(--color-text-muted)' }}>
            {format(new Date(review.created_at), 'MMM d, yyyy')}
          </p>
        </div>
        <div className='text-right'>
          <div className='text-lg mb-1' style={{ color: 'var(--color-warning)' }}>
            {'★'.repeat(roundedAvg)}
            {'☆'.repeat(5 - roundedAvg)}
          </div>
          <div className='flex gap-3 text-xs' style={{ color: 'var(--color-text-muted)' }}>
            <span>Guide: {review.guide_rating}/5</span>
            <span>Tour: {review.tour_rating}/5</span>
          </div>
        </div>
      </div>

      {review.comment && (
        <p className='mb-4' style={{ color: 'var(--color-text-body)' }}>{review.comment}</p>
      )}

      {/* Highlights */}
      <div className='flex flex-wrap gap-2 mb-4'>
        {review.best_guide_part && review.best_guide_part !== 'NONE' && (
          <span className='px-2 py-1 rounded text-xs' style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            + {HIGHLIGHT_LABELS[review.best_guide_part] || review.best_guide_part}
          </span>
        )}
        {review.best_tour_part && review.best_tour_part !== 'NONE' && (
          <span className='px-2 py-1 rounded text-xs' style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            + {HIGHLIGHT_LABELS[review.best_tour_part] || review.best_tour_part}
          </span>
        )}
        {review.worst_guide_part && review.worst_guide_part !== 'NONE' && (
          <span className='px-2 py-1 rounded text-xs' style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
            - {HIGHLIGHT_LABELS[review.worst_guide_part] || review.worst_guide_part}
          </span>
        )}
        {review.worst_tour_part && review.worst_tour_part !== 'NONE' && (
          <span className='px-2 py-1 rounded text-xs' style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            - {HIGHLIGHT_LABELS[review.worst_tour_part] || review.worst_tour_part}
          </span>
        )}
      </div>

      {roundedAvg <= 3 && (
        <button
          onClick={onReport}
          className='text-sm transition'
          style={{ color: 'var(--color-danger)' }}
        >
          Report as unfair
        </button>
      )}
    </div>
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
      <div
        className='rounded-xl p-8 max-w-md w-full'
        style={{ backgroundColor: 'var(--color-card-bg)' }}
      >
        <h2 className='text-xl font-bold mb-2' style={{ color: 'var(--color-text-heading)' }}>Report Unfair Review</h2>
        <p className='text-sm mb-6' style={{ color: 'var(--color-text-muted)' }}>
          Review by {review.user.fullName || review.user.username} for &quot;{review.tour.title}&quot;
        </p>

        <div
          className='rounded-lg p-4 mb-6'
          style={{ backgroundColor: 'var(--color-section-bg)' }}
        >
          <div className='flex items-center gap-2 mb-2'>
            <span style={{ color: 'var(--color-warning)' }}>
              {'★'.repeat(Math.round(review.average_rating))}
            </span>
            <span className='text-sm' style={{ color: 'var(--color-text-muted)' }}>
              ({review.average_rating.toFixed(1)})
            </span>
          </div>
          {review.comment && (
            <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>&quot;{review.comment}&quot;</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
              Why do you think this review is unfair? *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none'
              style={{ borderColor: 'var(--color-card-border)' }}
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
              className='flex-1 px-4 py-2 border rounded-lg hover:opacity-80 disabled:opacity-50 transition'
              style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition'
              style={{ backgroundColor: 'var(--color-danger)' }}
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
