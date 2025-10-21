'use client'

import { useAuth } from '@/contexts/AuthContext'
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  startOfMonth
} from 'date-fns'
import { useEffect, useState } from 'react'

interface ScheduledTour {
  id: string
  tourId: string
  tourTitle: string
  startTime: Date
  endTime: Date | null
  isAvailable: boolean
  reservationsCount: number
  maxCapacity: number | null
}

export default function AgendaPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [schedules, setSchedules] = useState<ScheduledTour[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSchedules()
    }
  }, [user, currentDate])

  const fetchSchedules = async () => {
    try {
      // TODO: Connect to real GraphQL query
      // Mock data for now
      setSchedules([
        {
          id: '1',
          tourId: 'tour-1',
          tourTitle: 'Historic City Tour',
          startTime: new Date(2025, 9, 22, 10, 0),
          endTime: new Date(2025, 9, 22, 13, 0),
          isAvailable: true,
          reservationsCount: 8,
          maxCapacity: 15
        },
        {
          id: '2',
          tourId: 'tour-2',
          tourTitle: 'Food Tour',
          startTime: new Date(2025, 9, 22, 15, 0),
          endTime: new Date(2025, 9, 22, 18, 0),
          isAvailable: true,
          reservationsCount: 12,
          maxCapacity: 12
        },
        {
          id: '3',
          tourId: 'tour-1',
          tourTitle: 'Historic City Tour',
          startTime: new Date(2025, 9, 23, 10, 0),
          endTime: new Date(2025, 9, 23, 13, 0),
          isAvailable: true,
          reservationsCount: 5,
          maxCapacity: 15
        }
      ])
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const schedulesForSelectedDate = schedules.filter((schedule) =>
    isSameDay(new Date(schedule.startTime), selectedDate)
  )

  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>My Agenda</h1>
        <button className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition'>
          + Add Availability
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Calendar */}
        <div className='lg:col-span-2 bg-white rounded-lg shadow p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-semibold'>
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className='flex gap-2'>
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                  )
                }
                className='px-3 py-1 border rounded hover:bg-gray-50'
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className='px-3 py-1 border rounded hover:bg-gray-50'
              >
                Today
              </button>
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.setMonth(currentDate.getMonth() + 1))
                  )
                }
                className='px-3 py-1 border rounded hover:bg-gray-50'
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className='grid grid-cols-7 gap-2'>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className='text-center text-sm font-medium text-gray-600 py-2'
              >
                {day}
              </div>
            ))}
            {daysInMonth.map((day) => {
              const daySchedules = schedules.filter((s) =>
                isSameDay(new Date(s.startTime), day)
              )
              const isSelected = isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    p-2 rounded-lg text-sm relative
                    ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }
                    ${
                      isTodayDate && !isSelected
                        ? 'border-2 border-blue-600'
                        : ''
                    }
                  `}
                >
                  <div>{format(day, 'd')}</div>
                  {daySchedules.length > 0 && (
                    <div className='flex justify-center gap-0.5 mt-1'>
                      {daySchedules.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-blue-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Schedule for Selected Date */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold mb-4'>
            {format(selectedDate, 'EEEE, MMM d')}
          </h3>
          {schedulesForSelectedDate.length === 0 ? (
            <p className='text-gray-500 text-sm text-center py-8'>
              No tours scheduled for this day
            </p>
          ) : (
            <div className='space-y-3'>
              {schedulesForSelectedDate.map((schedule) => (
                <div key={schedule.id} className='border rounded-lg p-3'>
                  <p className='font-medium text-sm'>{schedule.tourTitle}</p>
                  <p className='text-xs text-gray-600 mt-1'>
                    {format(new Date(schedule.startTime), 'h:mm a')} -{' '}
                    {schedule.endTime
                      ? format(new Date(schedule.endTime), 'h:mm a')
                      : 'Open'}
                  </p>
                  <div className='flex justify-between items-center mt-2 pt-2 border-t'>
                    <span className='text-xs text-gray-600'>
                      {schedule.reservationsCount}/{schedule.maxCapacity || '∞'}{' '}
                      booked
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        schedule.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {schedule.isAvailable ? 'Available' : 'Full'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
