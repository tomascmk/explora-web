import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Guide Portal',
  description: 'Guide dashboard with metrics and analytics'
}

export default function GuideDashboardPage() {
  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {/* Metrics Cards */}
        <MetricCard title="Today's Bookings" value='12' change='+20%' />
        <MetricCard title='This Week Revenue' value='$2,450' change='+15%' />
        <MetricCard title='Pending Claims' value='2' change='-50%' />
        <MetricCard title='Average Rating' value='4.8' change='+5%' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Revenue Chart */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>Revenue This Month</h2>
          <div className='h-64 flex items-center justify-center text-gray-400'>
            Chart Component (Recharts)
          </div>
        </div>

        {/* Recent Feedback */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>Recent Feedback</h2>
          <div className='space-y-4'>
            <FeedbackItem
              tour='Historic City Tour'
              rating={5}
              comment='Amazing experience! Highly recommended.'
              author='John D.'
            />
            <FeedbackItem
              tour='Food Tour'
              rating={4}
              comment='Great food, wonderful guide!'
              author='Sarah M.'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change
}: {
  title: string
  value: string
  change: string
}) {
  const isPositive = change.startsWith('+')

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <p className='text-sm text-gray-600 mb-1'>{title}</p>
      <p className='text-2xl font-bold mb-2'>{value}</p>
      <p
        className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}
      >
        {change} from last period
      </p>
    </div>
  )
}

function FeedbackItem({
  tour,
  rating,
  comment,
  author
}: {
  tour: string
  rating: number
  comment: string
  author: string
}) {
  return (
    <div className='border-b pb-4 last:border-0'>
      <div className='flex justify-between items-start mb-2'>
        <p className='font-medium'>{tour}</p>
        <div className='flex'>
          {Array.from({ length: rating }).map((_, i) => (
            <span key={i} className='text-yellow-400'>
              ★
            </span>
          ))}
        </div>
      </div>
      <p className='text-sm text-gray-600 mb-1'>{comment}</p>
      <p className='text-xs text-gray-400'>- {author}</p>
    </div>
  )
}
