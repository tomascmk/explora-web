import Link from 'next/link'

export default function MainLanding() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Navigation */}
      <nav className='border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-blue-600'>Explora</h1>
            </div>
            <div className='hidden md:flex items-center gap-8'>
              <Link href='/guides' className='text-gray-600 hover:text-gray-900'>
                For Guides
              </Link>
              <Link href='/tourists' className='text-gray-600 hover:text-gray-900'>
                For Tourists
              </Link>
              <Link href='/login' className='text-gray-600 hover:text-gray-900'>
                Login
              </Link>
              <Link
                href='/register'
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700'
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='py-20 px-4 bg-gradient-to-br from-blue-50 to-white'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h1 className='text-5xl font-bold text-gray-900 mb-6'>
                Discover Unforgettable Experiences
              </h1>
              <p className='text-xl text-gray-600 mb-8'>
                Connect with local expert guides and explore the world like never before.
                Self-guided or in-person tours tailored to your interests.
              </p>
              <div className='flex gap-4'>
                <Link
                  href='/tourists'
                  className='bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg'
                >
                  Explore Tours
                </Link>
                <Link
                  href='/guides'
                  className='bg-white border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 font-semibold text-lg'
                >
                  Become a Guide
                </Link>
              </div>
            </div>
            <div className='relative h-96 bg-gray-200 rounded-2xl overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-80'></div>
              <div className='absolute inset-0 flex items-center justify-center text-white text-2xl font-bold'>
                Hero Image
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-4'>How Explora Works</h2>
          <p className='text-xl text-gray-600 text-center mb-16'>
            Three simple steps to your next adventure
          </p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <span className='text-2xl font-bold text-blue-600'>1</span>
              </div>
              <h3 className='text-xl font-semibold mb-4'>Browse Tours</h3>
              <p className='text-gray-600'>
                Explore hundreds of curated tours from local expert guides in destinations
                worldwide.
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <span className='text-2xl font-bold text-blue-600'>2</span>
              </div>
              <h3 className='text-xl font-semibold mb-4'>Choose Your Style</h3>
              <p className='text-gray-600'>
                Pick self-guided tours with audio guides or book in-person experiences with a
                live guide.
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <span className='text-2xl font-bold text-blue-600'>3</span>
              </div>
              <h3 className='text-xl font-semibold mb-4'>Start Exploring</h3>
              <p className='text-gray-600'>
                Follow the guide, discover hidden gems, and create unforgettable memories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='py-20 px-4 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-16'>Why Choose Explora?</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <FeatureCard
              icon='🌍'
              title='Global Coverage'
              description='Tours in hundreds of cities worldwide'
            />
            <FeatureCard
              icon='⭐'
              title='Expert Guides'
              description='Vetted local guides with 5-star ratings'
            />
            <FeatureCard
              icon='📱'
              title='Mobile First'
              description='Seamless experience on any device'
            />
            <FeatureCard
              icon='💳'
              title='Secure Payment'
              description='Safe and encrypted transactions'
            />
            <FeatureCard
              icon='🎧'
              title='Audio Guides'
              description='Professional narration in multiple languages'
            />
            <FeatureCard
              icon='🗺️'
              title='Interactive Maps'
              description='GPS-enabled routes and points of interest'
            />
            <FeatureCard
              icon='💬'
              title='Instant Support'
              description='24/7 customer service'
            />
            <FeatureCard
              icon='🏆'
              title='Quality Guaranteed'
              description='Money-back guarantee on all tours'
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-16'>What Our Users Say</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <TestimonialCard
              name='Sarah Johnson'
              role='Tourist'
              content='The self-guided food tour in Tokyo was incredible! The audio guide was so detailed and the route was perfect.'
              rating={5}
            />
            <TestimonialCard
              name='Miguel Rodriguez'
              role='Tour Guide'
              content='Explora helped me turn my passion for history into a thriving business. The platform is easy to use and the support is amazing.'
              rating={5}
            />
            <TestimonialCard
              name='Emily Chen'
              role='Tourist'
              content='Booked an in-person tour in Paris and our guide was phenomenal. Would definitely use Explora again!'
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 px-4 bg-blue-600'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-4xl font-bold text-white mb-6'>
            Ready to Start Your Journey?
          </h2>
          <p className='text-xl text-blue-100 mb-8'>
            Join thousands of travelers discovering the world through local expert guides.
          </p>
          <div className='flex justify-center gap-4'>
            <Link
              href='/register'
              className='bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg'
            >
              Sign Up Free
            </Link>
            <Link
              href='/tourists'
              className='bg-blue-700 text-white px-8 py-4 rounded-lg hover:bg-blue-800 font-semibold text-lg'
            >
              Browse Tours
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div>
              <h3 className='text-2xl font-bold mb-4'>Explora</h3>
              <p className='text-gray-400'>
                Connecting tourists with unforgettable experiences.
              </p>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>For Tourists</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>Browse Tours</li>
                <li>How It Works</li>
                <li>Mobile App</li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>For Guides</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>Become a Guide</li>
                <li>Guide Dashboard</li>
                <li>Pricing</li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>Company</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>About Us</li>
                <li>Contact</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
            <p>&copy; 2025 Explora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className='bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition'>
      <div className='text-4xl mb-4'>{icon}</div>
      <h3 className='text-lg font-semibold mb-2'>{title}</h3>
      <p className='text-gray-600 text-sm'>{description}</p>
    </div>
  )
}

function TestimonialCard({
  name,
  role,
  content,
  rating,
}: {
  name: string
  role: string
  content: string
  rating: number
}) {
  return (
    <div className='bg-white p-6 rounded-lg shadow-sm'>
      <div className='flex mb-4'>
        {[...Array(rating)].map((_, i) => (
          <span key={i} className='text-yellow-400 text-xl'>
            ★
          </span>
        ))}
      </div>
      <p className='text-gray-600 mb-4'>&quot;{content}&quot;</p>
      <div>
        <p className='font-semibold'>{name}</p>
        <p className='text-sm text-gray-500'>{role}</p>
      </div>
    </div>
  )
}
