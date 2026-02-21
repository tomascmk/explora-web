'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import type { TripData, TripPostData } from '@/graphql/trips'

const TripMap = dynamic(() => import('@/components/trips/TripMap'), {
  ssr: false,
  loading: () => (
    <div
      className='flex items-center justify-center rounded-2xl'
      style={{ height: 300, backgroundColor: 'var(--color-section-bg)' }}
    >
      <div
        className='w-8 h-8 border-3 rounded-full animate-spin'
        style={{
          borderColor: 'var(--color-card-border)',
          borderTopColor: 'var(--color-primary)'
        }}
      />
    </div>
  )
})

// ── Sub-components ──

function TripHeader({
  trip,
  postCount
}: {
  trip: TripData
  postCount: number
}) {
  const dateRange = useMemo(() => {
    if (!trip.startDate) return null
    const start = new Date(trip.startDate).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    if (!trip.endDate) return start
    const end = new Date(trip.endDate).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    return `${start} — ${end}`
  }, [trip.startDate, trip.endDate])

  return (
    <div className='mb-6'>
      <h1
        className='text-2xl sm:text-3xl font-bold mb-2'
        style={{ color: 'var(--color-text-heading)' }}
      >
        {trip.title}
      </h1>
      {trip.description && (
        <p
          className='text-base mb-3 leading-relaxed'
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {trip.description}
        </p>
      )}
      <div className='flex flex-wrap items-center gap-3'>
        <span
          className='text-sm font-semibold'
          style={{ color: 'var(--color-primary)' }}
        >
          {trip.user.fullName}
        </span>
        <span
          className='text-sm'
          style={{ color: 'var(--color-text-muted)' }}
        >
          {postCount} {postCount === 1 ? 'post' : 'posts'}
        </span>
        {dateRange && (
          <span
            className='text-sm'
            style={{ color: 'var(--color-text-muted)' }}
          >
            {dateRange}
          </span>
        )}
      </div>
    </div>
  )
}

function PostCard({
  tripPost,
  index
}: {
  tripPost: TripPostData
  index: number
}) {
  const { post } = tripPost
  return (
    <div
      className='rounded-2xl p-4 border shadow-sm mb-4'
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-card-border)'
      }}
    >
      <div className='flex items-center gap-3 mb-3'>
        {/* Order badge */}
        <div
          className='w-7 h-7 rounded-full flex items-center justify-center shrink-0'
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <span className='text-white text-xs font-bold'>{index + 1}</span>
        </div>

        {/* Author + location */}
        <div className='flex-1 min-w-0'>
          <p
            className='text-sm font-semibold truncate'
            style={{ color: 'var(--color-text-heading)' }}
          >
            {post.author.fullName}
          </p>
          {post.location && (
            <p
              className='text-xs truncate'
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {post.location}
            </p>
          )}
        </div>

        {/* Date */}
        <span
          className='text-xs shrink-0'
          style={{ color: 'var(--color-text-muted)' }}
        >
          {new Date(post.createdAt).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short'
          })}
        </span>
      </div>

      <p
        className='text-sm leading-relaxed'
        style={{ color: 'var(--color-text-body)' }}
      >
        {post.content}
      </p>

      {post.signature && (
        <p
          className='text-xs italic mt-2'
          style={{ color: 'var(--color-text-muted)' }}
        >
          {post.signature}
        </p>
      )}
    </div>
  )
}

function PostsList({ posts }: { posts: TripPostData[] }) {
  return (
    <div>
      <h2
        className='text-lg font-bold mb-4'
        style={{ color: 'var(--color-text-heading)' }}
      >
        Travel Log
      </h2>
      {posts.map((tp, index) => (
        <PostCard key={tp.id} tripPost={tp} index={index} />
      ))}
    </div>
  )
}

// ── Main Component ──

interface TripContentProps {
  trip: TripData
}

export function TripContent({ trip }: TripContentProps) {
  const sortedPosts = useMemo(
    () => [...(trip.tripPosts || [])].sort((a, b) => a.order - b.order),
    [trip.tripPosts]
  )

  const hasPostsWithCoords = useMemo(
    () =>
      sortedPosts.some(
        (tp) => tp.post.latitude != null && tp.post.longitude != null
      ),
    [sortedPosts]
  )

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      {/* Desktop: side-by-side */}
      <div className='hidden lg:grid lg:grid-cols-2 lg:gap-8'>
        {/* Left: trip info + posts */}
        <div className='overflow-y-auto pr-2' style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <TripHeader trip={trip} postCount={sortedPosts.length} />
          <PostsList posts={sortedPosts} />
        </div>
        {/* Right: sticky map */}
        {hasPostsWithCoords ? (
          <div className='sticky top-24'>
            <TripMap
              tripPosts={sortedPosts}
              style={{ height: 'calc(100vh - 140px)', borderRadius: '16px' }}
            />
          </div>
        ) : (
          <div
            className='sticky top-24 flex items-center justify-center rounded-2xl'
            style={{
              height: 'calc(100vh - 140px)',
              backgroundColor: 'var(--color-section-bg)'
            }}
          >
            <p style={{ color: 'var(--color-text-muted)' }}>No map data</p>
          </div>
        )}
      </div>

      {/* Mobile: vertical */}
      <div className='lg:hidden'>
        <TripHeader trip={trip} postCount={sortedPosts.length} />
        {hasPostsWithCoords && (
          <div className='mb-5'>
            <TripMap
              tripPosts={sortedPosts}
              style={{ height: 300, borderRadius: '16px' }}
            />
          </div>
        )}
        <PostsList posts={sortedPosts} />
      </div>
    </div>
  )
}
