import Link from 'next/link'

export default function TouristsLanding() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Navigation */}
      <nav className='border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <Link href='/' className='text-2xl font-bold text-blue-600'>
              Explora
            </Link>
            <div className='hidden md:flex items-center gap-8'>
              <Link href='/' className='text-gray-600 hover:text-gray-900'>
                Home
              </Link>
              <Link href='/guides' className='text-gray-600 hover:text-gray-900'>
                For Guides
              </Link>
              <Link href='/login' className='text-gray-600 hover:text-gray-900'>
                Login
              </Link>
              <Link
                href='/register'
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700'
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='py-20 px-4 bg-gradient-to-br from-purple-50 to-white'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h1 className='text-5xl font-bold text-gray-900 mb-6'>
                Discover Authentic Local Experiences
              </h1>
              <p className='text-xl text-gray-600 mb-8'>
                Explore the world through the eyes of local expert guides. From hidden gems to
                iconic landmarks, find your perfect adventure.
              </p>
              <div className='flex gap-4 mb-6'>
                <Link
                  href='/register'
                  className='bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 font-semibold text-lg'
                >
                  Browse Tours
                </Link>
                <button className='bg-white border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg hover:bg-purple-50 font-semibold text-lg'>
                  Download App
                </button>
              </div>
              <div className='flex items-center gap-6'>
                <div className='flex -space-x-2'>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white'
                    ></div>
                  ))}
                </div>
                <div>
                  <p className='text-sm font-semibold'>50,000+ Happy Travelers</p>
                  <p className='text-xs text-gray-600'>⭐⭐⭐⭐⭐ 4.9/5 Average Rating</p>
                </div>
              </div>
            </div>
            <div className='relative h-96 bg-gray-200 rounded-2xl overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 opacity-80'></div>
              <div className='absolute inset-0 flex items-center justify-center text-white text-2xl font-bold'>
                Happy Travelers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-4'>Popular Destinations</h2>
          <p className='text-xl text-gray-600 text-center mb-16'>
            Explore the most loved tours worldwide
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <DestinationCard
              city='Paris'
              country='France'
              tours={234}
              image='🗼'
              priceFrom={25}
            />
            <DestinationCard
              city='Tokyo'
              country='Japan'
              tours={189}
              image='🗾'
              priceFrom={30}
            />
            <DestinationCard
              city='Barcelona'
              country='Spain'
              tours={156}
              image='🏰'
              priceFrom={20}
            />
            <DestinationCard
              city='New York'
              country='USA'
              tours={298}
              image='🗽'
              priceFrom={35}
            />
            <DestinationCard
              city='Rome'
              country='Italy'
              tours={167}
              image='🏛️'
              priceFrom={28}
            />
            <DestinationCard
              city='London'
              country='UK'
              tours={245}
              image='🎡'
              priceFrom={32}
            />
            <DestinationCard
              city='Sydney'
              country='Australia'
              tours={123}
              image='🦘'
              priceFrom={40}
            />
            <DestinationCard
              city='Dubai'
              country='UAE'
              tours={98}
              image='🏜️'
              priceFrom={45}
            />
          </div>
        </div>
      </section>

      {/* Tour Types */}
      <section className='py-20 px-4 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-16'>Choose Your Style</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <TourTypeCard
              title='Self-Guided Tours'
              description='Explore at your own pace with GPS-enabled audio guides. Perfect for flexible travelers.'
              features={[
                'Professional audio narration',
                'Interactive maps',
                'Offline access',
                'Available 24/7',
                'Multiple languages',
              ]}
              icon='📱'
              color='purple'
            />
            <TourTypeCard
              title='In-Person Tours'
              description='Experience authentic local culture with live expert guides. Ask questions and get insider tips.'
              features={[
                'Expert local guides',
                'Small group sizes',
                'Live Q&A',
                'Personalized experience',
                'Skip-the-line access',
              ]}
              icon='👥'
              color='pink'
            />
          </div>
        </div>
      </section>

      {/* Features for Tourists */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-16'>Why Travelers Love Us</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <TouristFeature
              icon='💳'
              title='Best Price Guarantee'
              description='Find a lower price elsewhere? We will match it plus give you 10% off your next tour.'
            />
            <TouristFeature
              icon='🔒'
              title='Secure Booking'
              description='Your payment information is encrypted and secure. Book with confidence.'
            />
            <TouristFeature
              icon='⭐'
              title='Verified Reviews'
              description='Read honest reviews from real travelers. All reviews are verified by our team.'
            />
            <TouristFeature
              icon='🎧'
              title='Multi-Language Support'
              description='Audio guides and live tours available in English, Spanish, French, Portuguese, and more.'
            />
            <TouristFeature
              icon='📅'
              title='Easy Cancellation'
              description='Free cancellation up to 24 hours before your tour. No questions asked.'
            />
            <TouristFeature
              icon='🎁'
              title='Exclusive Experiences'
              description='Access unique tours you won&apos;t find anywhere else, curated by local experts.'
            />
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className='py-20 px-4 bg-gradient-to-br from-purple-600 to-pink-600'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-4xl font-bold text-white mb-6'>
                Download the Explora App
              </h2>
              <p className='text-xl text-purple-100 mb-8'>
                Take your tours offline, get real-time navigation, and access exclusive mobile-only
                deals.
              </p>
              <ul className='space-y-4 mb-8'>
                <li className='flex items-center text-white'>
                  <span className='text-2xl mr-4'>✓</span>
                  <span>Offline maps and audio guides</span>
                </li>
                <li className='flex items-center text-white'>
                  <span className='text-2xl mr-4'>✓</span>
                  <span>Real-time GPS navigation</span>
                </li>
                <li className='flex items-center text-white'>
                  <span className='text-2xl mr-4'>✓</span>
                  <span>Instant booking confirmations</span>
                </li>
                <li className='flex items-center text-white'>
                  <span className='text-2xl mr-4'>✓</span>
                  <span>Exclusive mobile deals</span>
                </li>
              </ul>
              <div className='flex gap-4'>
                <button className='bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 flex items-center gap-3'>
                  <span className='text-2xl'>📱</span>
                  <div className='text-left'>
                    <p className='text-xs'>Download on the</p>
                    <p className='font-semibold'>App Store</p>
                  </div>
                </button>
                <button className='bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 flex items-center gap-3'>
                  <span className='text-2xl'>🤖</span>
                  <div className='text-left'>
                    <p className='text-xs'>GET IT ON</p>
                    <p className='font-semibold'>Google Play</p>
                  </div>
                </button>
              </div>
            </div>
            <div className='relative h-96 bg-white/10 rounded-2xl backdrop-blur-sm p-8 flex items-center justify-center'>
              <div className='text-white text-center'>
                <div className='text-8xl mb-4'>📱</div>
                <p className='text-xl font-semibold'>Mobile App Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-20 px-4 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-16'>What Travelers Say</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <TravelTestimonial
              name='Emma Wilson'
              location='London, UK'
              tourName='Food Tour in Tokyo'
              rating={5}
              content='The best tour I have ever taken! Our guide was so knowledgeable and took us to places we would never have found on our own.'
            />
            <TravelTestimonial
              name='David Chen'
              location='San Francisco, USA'
              tourName='Historic Paris Walk'
              rating={5}
              content='The audio guide was perfect for my solo trip. I could pause and explore at my own pace. Highly recommend!'
            />
            <TravelTestimonial
              name='Maria Garcia'
              location='Madrid, Spain'
              tourName='Art Tour in New York'
              rating={5}
              content='Exceeded all my expectations. The guide was passionate and made the experience truly memorable.'
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='py-20 px-4 bg-purple-600'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-4xl font-bold text-white mb-6'>
            Start Your Next Adventure Today
          </h2>
          <p className='text-xl text-purple-100 mb-8'>
            Join thousands of travelers discovering the world through authentic local experiences.
          </p>
          <Link
            href='/register'
            className='inline-block bg-white text-purple-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg'
          >
            Browse Tours Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <p className='text-gray-400'>
            &copy; 2025 Explora. All rights reserved. • Your gateway to authentic travel
            experiences.
          </p>
        </div>
      </footer>
    </div>
  )
}

function DestinationCard({
  city,
  country,
  tours,
  image,
  priceFrom,
}: {
  city: string
  country: string
  tours: number
  image: string
  priceFrom: number
}) {
  return (
    <div className='bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer'>
      <div className='h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-6xl'>
        {image}
      </div>
      <div className='p-4'>
        <h3 className='text-xl font-semibold mb-1'>{city}</h3>
        <p className='text-sm text-gray-600 mb-2'>{country}</p>
        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-600'>{tours} tours</span>
          <span className='text-sm font-semibold text-purple-600'>
            From ${priceFrom}
          </span>
        </div>
      </div>
    </div>
  )
}

function TourTypeCard({
  title,
  description,
  features,
  icon,
  color,
}: {
  title: string
  description: string
  features: string[]
  icon: string
  color: 'purple' | 'pink'
}) {
  const bgColor = color === 'purple' ? 'bg-purple-50' : 'bg-pink-50'
  const textColor = color === 'purple' ? 'text-purple-600' : 'text-pink-600'

  return (
    <div className={`${bgColor} p-8 rounded-2xl`}>
      <div className='text-5xl mb-4'>{icon}</div>
      <h3 className='text-2xl font-bold mb-3'>{title}</h3>
      <p className='text-gray-600 mb-6'>{description}</p>
      <ul className='space-y-3'>
        {features.map((feature, i) => (
          <li key={i} className='flex items-center'>
            <span className={`${textColor} mr-3 text-xl`}>✓</span>
            <span className='text-gray-700'>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TouristFeature({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className='text-center'>
      <div className='text-5xl mb-4'>{icon}</div>
      <h3 className='text-xl font-semibold mb-3'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
    </div>
  )
}

function TravelTestimonial({
  name,
  location,
  tourName,
  rating,
  content,
}: {
  name: string
  location: string
  tourName: string
  rating: number
  content: string
}) {
  return (
    <div className='bg-white p-6 rounded-lg shadow-sm'>
      <div className='flex mb-3'>
        {[...Array(rating)].map((_, i) => (
          <span key={i} className='text-yellow-400 text-xl'>
            ★
          </span>
        ))}
      </div>
      <p className='text-gray-700 mb-4'>&quot;{content}&quot;</p>
      <div className='border-t pt-4'>
        <p className='font-semibold'>{name}</p>
        <p className='text-sm text-gray-600'>{location}</p>
        <p className='text-xs text-purple-600 mt-1'>{tourName}</p>
      </div>
    </div>
  )
}

