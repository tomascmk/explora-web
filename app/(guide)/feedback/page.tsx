'use client'

import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

interface Review {
  id: string
  tour: {
    id: string
    title: string
  }
  user: {
    username: string
  }
  tour_rating: number
  guide_rating: number
  comment: string
  created_at: string
}

export default function FeedbackPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchReviews()
    }
  }, [user])

  const fetchReviews = async () => {
    try {
      // TODO: Create GraphQL query for guide reviews
      // Mock data for now
      setReviews([
        {
          id: '1',
          tour: { id: 'tour-1', title: 'Historic City Tour' },
          user: { username: 'John Doe' },
          tour_rating: 5,
          guide_rating: 5,
          comment:
            'Amazing experience! The guide was very knowledgeable and friendly.',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          tour: { id: 'tour-2', title: 'Food Tour' },
          user: { username: 'Sarah Smith' },
          tour_rating: 4,
          guide_rating: 5,
          comment: 'Great tour, learned a lot about local cuisine.',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          tour: { id: 'tour-1', title: 'Historic City Tour' },
          user: { username: 'Mike Johnson' },
          tour_rating: 3,
          guide_rating: 2,
          comment: 'It was okay, but I expected more historical details.',
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportReview = async (reviewId: string) => {
    const reason = prompt('Why do you think this review is unfair?')
    if (!reason) return

    try {
      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: `
            mutation CreateFeedbackReport($input: CreateFeedbackReportDto!) {
              createFeedbackReport(input: $input) {
                id
                status
              }
            }
          `,
          variables: {
            input: {
              reporterId: user?.id,
              reviewId,
              reason
            }
          }
        })
      })

      const { data } = await response.json()
      if (data?.createFeedbackReport) {
        alert('Review reported successfully. Our team will review it.')
      }
    } catch (error) {
      console.error('Error reporting review:', error)
      alert('Failed to report review')
    }
  }

  const filteredReviews =
    filter === 'all'
      ? reviews
      : reviews.filter((r) => r.guide_rating === filter)

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.guide_rating, 0) / reviews.length
      : 0

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold mb-8'>Feedback & Reviews</h1>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Total Reviews</p>
          <p className='text-3xl font-bold'>{reviews.length}</p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Average Rating</p>
          <p className='text-3xl font-bold text-yellow-600'>
            ★ {averageRating.toFixed(1)}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>5 Star Reviews</p>
          <p className='text-3xl font-bold text-green-600'>
            {reviews.filter((r) => r.guide_rating === 5).length}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <p className='text-sm text-gray-600 mb-1'>Low Ratings</p>
          <p className='text-3xl font-bold text-red-600'>
            {reviews.filter((r) => r.guide_rating <= 2).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow p-4 mb-6'>
        <div className='flex gap-2'>
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All
          </FilterButton>
          <FilterButton active={filter === 5} onClick={() => setFilter(5)}>
            ★★★★★
          </FilterButton>
          <FilterButton active={filter === 4} onClick={() => setFilter(4)}>
            ★★★★
          </FilterButton>
          <FilterButton active={filter === 3} onClick={() => setFilter(3)}>
            ★★★
          </FilterButton>
          <FilterButton active={filter === 2} onClick={() => setFilter(2)}>
            ★★
          </FilterButton>
          <FilterButton active={filter === 1} onClick={() => setFilter(1)}>
            ★
          </FilterButton>
        </div>
      </div>

      {/* Reviews List */}
      <div className='space-y-4'>
        {filteredReviews.map((review) => (
          <div key={review.id} className='bg-white rounded-lg shadow p-6'>
            <div className='flex justify-between items-start mb-4'>
              <div>
                <p className='font-semibold'>{review.tour.title}</p>
                <p className='text-sm text-gray-600'>
                  by {review.user.username}
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  {format(new Date(review.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div className='text-right'>
                <div className='text-yellow-600 mb-1'>
                  {'★'.repeat(review.guide_rating)}
                  {'☆'.repeat(5 - review.guide_rating)}
                </div>
                <p className='text-xs text-gray-500'>Guide Rating</p>
              </div>
            </div>
            <p className='text-gray-700 mb-4'>{review.comment}</p>
            {review.guide_rating <= 3 && (
              <button
                onClick={() => handleReportReview(review.id)}
                className='text-sm text-red-600 hover:text-red-800'
              >
                Report as unfair
              </button>
            )}
          </div>
        ))}
      </div>
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
