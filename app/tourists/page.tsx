import Link from 'next/link'

export default function TouristsLanding() {
  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--color-page-bg)' }}>
      {/* Navigation */}
      <nav className='absolute top-0 left-0 right-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <Link href='/' className='text-xl font-bold text-white flex items-center gap-2'>
              <span
                className='w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                E
              </span>
              Explora
            </Link>
            <div className='hidden md:flex items-center gap-6'>
              <Link href='/' className='text-sm font-medium text-white/80 hover:text-white transition'>
                Home
              </Link>
              <Link href='/guides' className='text-sm font-medium text-white/80 hover:text-white transition'>
                For Guides
              </Link>
              <Link href='/login' className='text-sm font-medium text-white/80 hover:text-white transition'>
                Login
              </Link>
              <Link
                href='/register'
                className='text-sm font-semibold text-white px-5 py-2 rounded-lg transition hover:opacity-90'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white pt-32 pb-24'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10' style={{ backgroundColor: 'var(--color-primary)' }} />
          <div className='absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10' style={{ backgroundColor: 'var(--color-primary)' }} />
        </div>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wider mb-4' style={{ color: 'var(--color-primary)' }}>
                For Travelers
              </p>
              <h1 className='text-4xl sm:text-5xl font-bold mb-6 leading-tight'>
                Discover Authentic Local Experiences
              </h1>
              <p className='text-lg text-slate-300 mb-8'>
                Explore the world through the eyes of local expert guides. From
                hidden gems to iconic landmarks, find your perfect adventure.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 mb-6'>
                <Link
                  href='/register'
                  className='px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:shadow-teal-500/25 text-center'
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Browse Tours
                </Link>
                <button className='px-8 py-3.5 rounded-xl font-semibold text-white border-2 border-white/20 hover:border-white/40 transition-all backdrop-blur-sm bg-white/5'>
                  Download App
                </button>
              </div>
              <div className='flex items-center gap-6'>
                <div className='flex -space-x-2'>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className='w-10 h-10 rounded-full border-2 border-slate-900'
                      style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))' }}
                    ></div>
                  ))}
                </div>
                <div>
                  <p className='text-sm font-semibold text-white'>
                    50,000+ Happy Travelers
                  </p>
                  <p className='text-xs text-slate-400'>
                    ⭐⭐⭐⭐⭐ 4.9/5 Average Rating
                  </p>
                </div>
              </div>
            </div>
            <div className='relative h-96 rounded-2xl overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-teal-500/40 to-slate-900/60'></div>
              <div className='absolute inset-0 flex items-center justify-center text-white text-2xl font-bold'>
                Happy Travelers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className='py-20 px-4' style={{ backgroundColor: 'var(--color-card-bg)' }}>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Top Destinations
            </p>
            <h2 className='text-3xl sm:text-4xl font-bold mb-4' style={{ color: 'var(--color-text-heading)' }}>
              Popular Destinations
            </h2>
            <p className='text-lg' style={{ color: 'var(--color-text-secondary)' }}>
              Explore the most loved tours worldwide
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            <DestinationCard city='Paris' country='France' tours={234} image='🗼' priceFrom={25} />
            <DestinationCard city='Tokyo' country='Japan' tours={189} image='🗾' priceFrom={30} />
            <DestinationCard city='Barcelona' country='Spain' tours={156} image='🏰' priceFrom={20} />
            <DestinationCard city='New York' country='USA' tours={298} image='🗽' priceFrom={35} />
            <DestinationCard city='Rome' country='Italy' tours={167} image='🏛️' priceFrom={28} />
            <DestinationCard city='London' country='UK' tours={245} image='🎡' priceFrom={32} />
            <DestinationCard city='Sydney' country='Australia' tours={123} image='🦘' priceFrom={40} />
            <DestinationCard city='Dubai' country='UAE' tours={98} image='🏜️' priceFrom={45} />
          </div>
        </div>
      </section>

      {/* Tour Types */}
      <section className='py-20 px-4' style={{ backgroundColor: 'var(--color-page-bg)' }}>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Tour Styles
            </p>
            <h2 className='text-3xl sm:text-4xl font-bold' style={{ color: 'var(--color-text-heading)' }}>
              Choose Your Style
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <TourTypeCard
              title='Self-Guided Tours'
              description='Explore at your own pace with GPS-enabled audio guides. Perfect for flexible travelers.'
              features={[
                'Professional audio narration',
                'Interactive maps',
                'Offline access',
                'Available 24/7',
                'Multiple languages'
              ]}
              icon='📱'
            />
            <TourTypeCard
              title='In-Person Tours'
              description='Experience authentic local culture with live expert guides. Ask questions and get insider tips.'
              features={[
                'Expert local guides',
                'Small group sizes',
                'Live Q&A',
                'Personalized experience',
                'Skip-the-line access'
              ]}
              icon='👥'
            />
          </div>
        </div>
      </section>

      {/* Features for Tourists */}
      <section className='py-20 px-4' style={{ backgroundColor: 'var(--color-card-bg)' }}>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Benefits
            </p>
            <h2 className='text-3xl sm:text-4xl font-bold' style={{ color: 'var(--color-text-heading)' }}>
              Why Travelers Love Us
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <TouristFeature icon='💳' title='Best Price Guarantee' description='Find a lower price elsewhere? We will match it plus give you 10% off your next tour.' />
            <TouristFeature icon='🔒' title='Secure Booking' description='Your payment information is encrypted and secure. Book with confidence.' />
            <TouristFeature icon='⭐' title='Verified Reviews' description='Read honest reviews from real travelers. All reviews are verified by our team.' />
            <TouristFeature icon='🎧' title='Multi-Language Support' description='Audio guides and live tours available in English, Spanish, French, Portuguese, and more.' />
            <TouristFeature icon='📅' title='Easy Cancellation' description='Free cancellation up to 24 hours before your tour. No questions asked.' />
            <TouristFeature icon='🎁' title='Exclusive Experiences' description="Access unique tours you won't find anywhere else, curated by local experts." />
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className='py-20 px-4 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wider mb-4' style={{ color: 'var(--color-primary)' }}>
                Mobile App
              </p>
              <h2 className='text-3xl sm:text-4xl font-bold text-white mb-6'>
                Download the Explora App
              </h2>
              <p className='text-lg text-slate-300 mb-8'>
                Take your tours offline, get real-time navigation, and access
                exclusive mobile-only deals.
              </p>
              <ul className='space-y-4 mb-8'>
                <li className='flex items-center text-white'>
                  <span className='text-2xl mr-4' style={{ color: 'var(--color-primary)' }}>✓</span>
                  <span>Offline maps and audio guides</span>
                </li>
                <li className='flex items-center text-white'>
                  <span className='text-2xl mr-4' style={{ color: 'var(--color-primary)' }}>✓</span>
                  <span>Real-time GPS navigation</span>
                </li>
                <li className='flex items-center text-white'>
                  <span className='text-2xl mr-4' style={{ color: 'var(--color-primary)' }}>✓</span>
                  <span>Instant booking confirmations</span>
                </li>
                <li className='flex items-center text-white'>
                  <span className='text-2xl mr-4' style={{ color: 'var(--color-primary)' }}>✓</span>
                  <span>Exclusive mobile deals</span>
                </li>
              </ul>
              <div className='flex gap-4'>
                <button className='bg-black text-white px-6 py-3 rounded-lg flex items-center gap-3 transition hover:opacity-80'>
                  <span className='text-2xl'>📱</span>
                  <div className='text-left'>
                    <p className='text-xs'>Download on the</p>
                    <p className='font-semibold'>App Store</p>
                  </div>
                </button>
                <button className='bg-black text-white px-6 py-3 rounded-lg flex items-center gap-3 transition hover:opacity-80'>
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
      <section className='py-20 px-4' style={{ backgroundColor: 'var(--color-page-bg)' }}>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Reviews
            </p>
            <h2 className='text-3xl sm:text-4xl font-bold' style={{ color: 'var(--color-text-heading)' }}>
              What Travelers Say
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <TravelTestimonial name='Emma Wilson' location='London, UK' tourName='Food Tour in Tokyo' rating={5} content='The best tour I have ever taken! Our guide was so knowledgeable and took us to places we would never have found on our own.' />
            <TravelTestimonial name='David Chen' location='San Francisco, USA' tourName='Historic Paris Walk' rating={5} content='The audio guide was perfect for my solo trip. I could pause and explore at my own pace. Highly recommend!' />
            <TravelTestimonial name='Maria Garcia' location='Madrid, Spain' tourName='Art Tour in New York' rating={5} content='Exceeded all my expectations. The guide was passionate and made the experience truly memorable.' />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white py-20'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold mb-6'>
            Start Your Next Adventure Today
          </h2>
          <p className='text-lg text-slate-300 mb-10'>
            Join thousands of travelers discovering the world through authentic
            local experiences.
          </p>
          <Link
            href='/register'
            className='inline-block px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:shadow-teal-500/25'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Browse Tours Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-slate-900 text-white py-12 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <p className='text-slate-400'>
            &copy; 2026 Explora. All rights reserved. • Your gateway to
            authentic travel experiences.
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
  priceFrom
}: {
  city: string
  country: string
  tours: number
  image: string
  priceFrom: number
}) {
  return (
    <div
      className='rounded-xl border overflow-hidden cursor-pointer transition-shadow hover:shadow-md'
      style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
    >
      <div
        className='h-48 flex items-center justify-center text-6xl'
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
      >
        {image}
      </div>
      <div className='p-4'>
        <h3 className='text-xl font-semibold mb-1' style={{ color: 'var(--color-text-heading)' }}>{city}</h3>
        <p className='text-sm mb-2' style={{ color: 'var(--color-text-secondary)' }}>{country}</p>
        <div className='flex justify-between items-center'>
          <span className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>{tours} tours</span>
          <span className='text-sm font-semibold' style={{ color: 'var(--color-primary)' }}>
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
}: {
  title: string
  description: string
  features: string[]
  icon: string
}) {
  return (
    <div
      className='p-8 rounded-2xl border'
      style={{ backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-card-border)' }}
    >
      <div className='text-5xl mb-4'>{icon}</div>
      <h3 className='text-2xl font-bold mb-3' style={{ color: 'var(--color-text-heading)' }}>{title}</h3>
      <p className='mb-6' style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
      <ul className='space-y-3'>
        {features.map((feature, i) => (
          <li key={i} className='flex items-center'>
            <span className='mr-3 text-xl' style={{ color: 'var(--color-primary)' }}>✓</span>
            <span style={{ color: 'var(--color-text-body)' }}>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TouristFeature({
  icon,
  title,
  description
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div
      className='text-center p-8 rounded-xl border transition-shadow hover:shadow-md'
      style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
    >
      <div className='text-5xl mb-5'>{icon}</div>
      <h3 className='text-xl font-semibold mb-3' style={{ color: 'var(--color-text-heading)' }}>{title}</h3>
      <p style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
    </div>
  )
}

function TravelTestimonial({
  name,
  location,
  tourName,
  rating,
  content
}: {
  name: string
  location: string
  tourName: string
  rating: number
  content: string
}) {
  return (
    <div
      className='p-6 rounded-xl border transition-shadow hover:shadow-md'
      style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
    >
      <div className='flex mb-3'>
        {[...Array(rating)].map((_, i) => (
          <span key={i} className='text-xl' style={{ color: 'var(--color-warning)' }}>
            ★
          </span>
        ))}
      </div>
      <p className='mb-4' style={{ color: 'var(--color-text-body)' }}>&quot;{content}&quot;</p>
      <div className='pt-4' style={{ borderTop: '1px solid var(--color-card-border)' }}>
        <p className='font-semibold' style={{ color: 'var(--color-text-heading)' }}>{name}</p>
        <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>{location}</p>
        <p className='text-xs mt-1' style={{ color: 'var(--color-primary)' }}>{tourName}</p>
      </div>
    </div>
  )
}
