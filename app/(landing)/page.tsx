import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Explora - Discover Unforgettable Experiences',
  description: 'Connect with local guides and discover authentic experiences'
}

export default function LandingPage() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='bg-gradient-to-r from-blue-600 to-indigo-700 text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
          <div className='text-center'>
            <h1 className='text-5xl font-bold mb-6'>
              Discover Unforgettable Experiences
            </h1>
            <p className='text-xl mb-8 text-blue-100'>
              Connect with local guides or explore at your own pace
            </p>
            <div className='flex gap-4 justify-center'>
              <Link
                href='/guides'
                className='bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition'
              >
                For Guides
              </Link>
              <Link
                href='/tourists'
                className='bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition'
              >
                For Tourists
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl font-bold text-center mb-12'>
            Why Choose Explora?
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <FeatureCard
              title='Local Expertise'
              description='Connect with verified local guides who know the best spots'
              icon='🗺️'
            />
            <FeatureCard
              title='Flexible Options'
              description='Choose guided tours or self-guided adventures'
              icon='🎯'
            />
            <FeatureCard
              title='Secure Booking'
              description='Safe payments and verified reviews'
              icon='🔒'
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='bg-gray-50 py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl font-bold text-center mb-12'>How It Works</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <Step
              number={1}
              title='Browse'
              description='Explore tours and experiences'
            />
            <Step
              number={2}
              title='Book'
              description='Reserve your spot securely'
            />
            <Step
              number={3}
              title='Enjoy'
              description='Experience something amazing'
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-blue-600 text-white py-20'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-4xl font-bold mb-6'>
            Ready to Start Your Adventure?
          </h2>
          <p className='text-xl mb-8'>Join thousands of happy explorers</p>
          <Link
            href='/register'
            className='bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-block'
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <div className='text-center p-6'>
      <div className='text-5xl mb-4'>{icon}</div>
      <h3 className='text-xl font-semibold mb-2'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
    </div>
  )
}

function Step({
  number,
  title,
  description
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className='text-center'>
      <div className='w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4'>
        {number}
      </div>
      <h3 className='text-xl font-semibold mb-2'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
    </div>
  )
}




