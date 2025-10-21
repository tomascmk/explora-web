'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ToursPage() {
  const [filter, setFilter] = useState('all')

  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>My Tours</h1>
        <Link
          href='/tours/create'
          className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition'
        >
          + Create New Tour
        </Link>
      </div>

      {/* Filters */}
      <div className='flex gap-4 mb-6'>
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All Tours
        </FilterButton>
        <FilterButton
          active={filter === 'active'}
          onClick={() => setFilter('active')}
        >
          Active
        </FilterButton>
        <FilterButton
          active={filter === 'draft'}
          onClick={() => setFilter('draft')}
        >
          Draft
        </FilterButton>
        <FilterButton
          active={filter === 'archived'}
          onClick={() => setFilter('archived')}
        >
          Archived
        </FilterButton>
      </div>

      {/* Tours Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Example Tours */}
        <TourCard
          title='Historic City Tour'
          description='Walk through centuries of history'
          price={75}
          bookings={45}
          rating={4.8}
          status='active'
          image='/placeholder-tour.jpg'
        />
        <TourCard
          title='Food & Wine Experience'
          description='Taste the authentic local cuisine'
          price={95}
          bookings={32}
          rating={4.9}
          status='active'
          image='/placeholder-tour.jpg'
        />
        <TourCard
          title='Sunset Photography Tour'
          description='Capture the perfect golden hour'
          price={60}
          bookings={18}
          rating={4.7}
          status='draft'
          image='/placeholder-tour.jpg'
        />
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
      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

function TourCard({
  title,
  description,
  price,
  bookings,
  rating,
  status,
  image
}: {
  title: string
  description: string
  price: number
  bookings: number
  rating: number
  status: string
  image: string
}) {
  return (
    <div className='bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition'>
      <div className='h-48 bg-gradient-to-r from-blue-400 to-indigo-500'></div>
      <div className='p-6'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='text-lg font-semibold'>{title}</h3>
          <span
            className={`px-2 py-1 rounded text-xs ${
              status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {status}
          </span>
        </div>
        <p className='text-sm text-gray-600 mb-4'>{description}</p>
        <div className='flex justify-between items-center text-sm'>
          <div>
            <span className='font-semibold text-lg'>${price}</span>
            <span className='text-gray-500'>/person</span>
          </div>
          <div className='text-right'>
            <p className='text-gray-600'>{bookings} bookings</p>
            <p className='text-yellow-600'>★ {rating}</p>
          </div>
        </div>
        <div className='mt-4 pt-4 border-t flex gap-2'>
          <button className='flex-1 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition text-sm'>
            Edit
          </button>
          <button className='flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm'>
            View
          </button>
        </div>
      </div>
    </div>
  )
}
