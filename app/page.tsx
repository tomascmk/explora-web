import Link from 'next/link'

export default function MainLanding() {
  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--color-page-bg)' }}>
      {/* Navigation */}
      <nav className='absolute top-0 left-0 right-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-20'>
            <Link href='/' className='text-2xl font-bold text-white flex items-center gap-2'>
              <span
                className='w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                E
              </span>
              Explora
            </Link>
            <div className='hidden md:flex items-center gap-8'>
              <Link
                href='/guides'
                className='text-sm font-medium text-white/80 hover:text-white transition-colors duration-200'
              >
                For Guides
              </Link>
              <Link
                href='/tourists'
                className='text-sm font-medium text-white/80 hover:text-white transition-colors duration-200'
              >
                For Tourists
              </Link>
              <Link
                href='/login'
                className='text-sm font-medium text-white/80 hover:text-white transition-colors duration-200'
              >
                Login
              </Link>
              <Link
                href='/register'
                className='text-sm font-semibold text-white px-6 py-2.5 rounded-xl transition hover:opacity-90'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 pt-36 pb-28 overflow-hidden'>
        {/* Background decorations */}
        <div className='absolute inset-0'>
          <div className='absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10' style={{ backgroundColor: 'var(--color-primary)' }} />
          <div className='absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10' style={{ backgroundColor: 'var(--color-primary)' }} />
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5' style={{ backgroundColor: 'var(--color-primary)' }} />
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
            <div className='space-y-8'>
              <div className='inline-block'>
                <span
                  className='text-sm font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full'
                  style={{
                    backgroundColor: 'rgba(20, 184, 166, 0.15)',
                    color: 'var(--color-primary)',
                  }}
                >
                  ✨ Your Adventure Starts Here
                </span>
              </div>

              <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-white'>
                Discover
                <br />
                <span style={{ color: 'var(--color-primary)' }}>Unforgettable</span>
                <br />
                Experiences
              </h1>

              <p className='text-xl text-slate-300 leading-relaxed max-w-xl'>
                Connect with passionate local guides who transform ordinary
                trips into extraordinary adventures. Your journey, your way.
              </p>

              <div className='flex flex-col sm:flex-row gap-4 pt-4'>
                <Link
                  href='/tourists'
                  className='px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all hover:shadow-lg hover:shadow-teal-500/25 text-center'
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Explore Tours
                </Link>
                <Link
                  href='/guides'
                  className='px-8 py-4 rounded-xl font-semibold text-white text-lg border-2 border-white/20 hover:border-white/40 transition-all backdrop-blur-sm bg-white/5 text-center'
                >
                  Become a Guide →
                </Link>
              </div>

              {/* Social Proof */}
              <div className='flex items-center gap-8 pt-8'>
                <div className='flex -space-x-3'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className='w-11 h-11 rounded-full border-3 border-slate-900 shadow-lg'
                      style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))' }}
                    ></div>
                  ))}
                </div>
                <div>
                  <div className='flex items-center gap-1 mb-1'>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className='text-lg' style={{ color: 'var(--color-warning)' }}>★</span>
                    ))}
                  </div>
                  <p className='text-sm text-slate-400'>
                    Loved by <span className='font-bold text-white'>50,000+</span> travelers
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className='relative group hidden lg:block'>
              <div
                className='absolute -inset-1 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-700'
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))' }}
              ></div>
              <div
                className='relative h-[500px] rounded-3xl overflow-hidden shadow-2xl'
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
              >
                <div className='absolute inset-0 bg-black/20'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center space-y-4'>
                    <div className='text-8xl'>🌍</div>
                    <p className='text-white text-2xl font-bold'>Your Adventure Awaits</p>
                  </div>
                </div>
                {/* Floating Cards */}
                <div className='absolute top-10 right-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-xl transform rotate-6 hover:rotate-0 transition-transform duration-300'>
                  <p className='text-sm font-semibold' style={{ color: 'var(--color-text-heading)' }}>⭐ 4.9/5 Rating</p>
                </div>
                <div className='absolute bottom-10 left-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-300'>
                  <p className='text-sm font-semibold' style={{ color: 'var(--color-text-heading)' }}>🎯 1000+ Tours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-24 px-4' style={{ backgroundColor: 'var(--color-card-bg)' }}>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Simple & Seamless
            </p>
            <h2 className='text-4xl sm:text-5xl font-bold mb-4' style={{ color: 'var(--color-text-heading)' }}>
              How It Works
            </h2>
            <p className='text-lg max-w-2xl mx-auto' style={{ color: 'var(--color-text-secondary)' }}>
              Your journey from discovery to adventure in three effortless steps
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <StepCard number={1} title='Discover' description='Explore curated tours from passionate local experts in destinations worldwide. Find your perfect adventure.' emoji='🔍' />
            <StepCard number={2} title='Choose' description='Select between self-guided audio tours or live in-person experiences. Your journey, your way.' emoji='📱' />
            <StepCard number={3} title='Explore' description='Embark on your adventure, discover hidden gems, and create unforgettable memories that last a lifetime.' emoji='✨' />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='py-24 px-4' style={{ backgroundColor: 'var(--color-page-bg)' }}>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Why Explora
            </p>
            <h2 className='text-4xl sm:text-5xl font-bold' style={{ color: 'var(--color-text-heading)' }}>
              Why Choose Explora?
            </h2>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            <FeatureCard icon='🌍' title='Global Coverage' description='Tours in hundreds of cities worldwide' />
            <FeatureCard icon='⭐' title='Expert Guides' description='Vetted local guides with 5-star ratings' />
            <FeatureCard icon='📱' title='Mobile First' description='Seamless experience on any device' />
            <FeatureCard icon='💳' title='Secure Payment' description='Safe and encrypted transactions' />
            <FeatureCard icon='🎧' title='Audio Guides' description='Professional narration in multiple languages' />
            <FeatureCard icon='🗺️' title='Interactive Maps' description='GPS-enabled routes and points of interest' />
            <FeatureCard icon='💬' title='Instant Support' description='24/7 customer service' />
            <FeatureCard icon='🏆' title='Quality Guaranteed' description='Money-back guarantee on all tours' />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-24 px-4' style={{ backgroundColor: 'var(--color-card-bg)' }}>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Reviews
            </p>
            <h2 className='text-4xl sm:text-5xl font-bold' style={{ color: 'var(--color-text-heading)' }}>
              What Our Users Say
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <TestimonialCard name='Sarah Johnson' role='Tourist' content='The self-guided food tour in Tokyo was incredible! The audio guide was so detailed and the route was perfect.' rating={5} />
            <TestimonialCard name='Miguel Rodriguez' role='Tour Guide' content='Explora helped me turn my passion for history into a thriving business. The platform is easy to use and the support is amazing.' rating={5} />
            <TestimonialCard name='Emily Chen' role='Tourist' content='Booked an in-person tour in Paris and our guide was phenomenal. Would definitely use Explora again!' rating={5} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='relative py-24 px-4 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10' style={{ backgroundColor: 'var(--color-primary)' }} />
          <div className='absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10' style={{ backgroundColor: 'var(--color-primary)' }} />
        </div>

        <div className='max-w-5xl mx-auto text-center relative z-10'>
          <div className='inline-block mb-6'>
            <span
              className='text-sm font-semibold px-4 py-1.5 rounded-full'
              style={{
                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                color: 'var(--color-primary)',
              }}
            >
              🚀 Join 50,000+ Travelers
            </span>
          </div>

          <h2 className='text-4xl sm:text-5xl font-bold text-white mb-8 leading-tight'>
            Your Next Adventure
            <br />
            <span style={{ color: 'var(--color-primary)' }}>Starts Here</span>
          </h2>

          <p className='text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed'>
            Stop dreaming. Start exploring. Connect with passionate local guides
            and transform the way you experience the world.
          </p>

          <div className='flex flex-col sm:flex-row justify-center gap-6'>
            <Link
              href='/register'
              className='px-10 py-4 rounded-xl font-semibold text-white text-lg transition-all hover:shadow-lg hover:shadow-teal-500/25'
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Get Started Free
            </Link>
            <Link
              href='/tourists'
              className='px-10 py-4 rounded-xl font-semibold text-white text-lg border-2 border-white/20 hover:border-white/40 transition-all backdrop-blur-sm bg-white/5'
            >
              Explore Tours →
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className='mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto'>
            <div className='text-center'>
              <p className='text-4xl font-bold text-white mb-2'>1000+</p>
              <p className='text-slate-400 text-sm'>Tours Worldwide</p>
            </div>
            <div className='text-center'>
              <p className='text-4xl font-bold text-white mb-2'>50K+</p>
              <p className='text-slate-400 text-sm'>Happy Travelers</p>
            </div>
            <div className='text-center'>
              <p className='text-4xl font-bold text-white mb-2'>4.9★</p>
              <p className='text-slate-400 text-sm'>Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-slate-900 text-white py-16 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-12'>
            <div>
              <Link href='/' className='text-2xl font-bold flex items-center gap-2 mb-4'>
                <span
                  className='w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold'
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  E
                </span>
                Explora
              </Link>
              <p className='text-slate-400 leading-relaxed'>
                Transforming the way the world explores, one adventure at a time.
              </p>
            </div>
            <div>
              <h4 className='font-bold mb-4 text-white'>For Tourists</h4>
              <ul className='space-y-3 text-slate-400'>
                <li className='hover:text-white transition-colors cursor-pointer'>Browse Tours</li>
                <li className='hover:text-white transition-colors cursor-pointer'>How It Works</li>
                <li className='hover:text-white transition-colors cursor-pointer'>Mobile App</li>
                <li className='hover:text-white transition-colors cursor-pointer'>Gift Cards</li>
              </ul>
            </div>
            <div>
              <h4 className='font-bold mb-4 text-white'>For Guides</h4>
              <ul className='space-y-3 text-slate-400'>
                <li className='hover:text-white transition-colors cursor-pointer'>Become a Guide</li>
                <li className='hover:text-white transition-colors cursor-pointer'>Guide Dashboard</li>
                <li className='hover:text-white transition-colors cursor-pointer'>Pricing</li>
                <li className='hover:text-white transition-colors cursor-pointer'>Resources</li>
              </ul>
            </div>
            <div>
              <h4 className='font-bold mb-4 text-white'>Company</h4>
              <ul className='space-y-3 text-slate-400'>
                <li className='hover:text-white transition-colors cursor-pointer'>About Us</li>
                <li className='hover:text-white transition-colors cursor-pointer'>Contact</li>
                <li className='hover:text-white transition-colors cursor-pointer'>Terms of Service</li>
                <li className='hover:text-white transition-colors cursor-pointer'>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className='border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-slate-400 text-sm'>
              &copy; 2026 Explora. All rights reserved.
            </p>
            <div className='flex gap-6 text-slate-400 text-sm'>
              <span className='hover:text-white transition-colors cursor-pointer'>English</span>
              <span className='hover:text-white transition-colors cursor-pointer'>Español</span>
              <span className='hover:text-white transition-colors cursor-pointer'>Français</span>
              <span className='hover:text-white transition-colors cursor-pointer'>Português</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
  emoji
}: {
  number: number
  title: string
  description: string
  emoji: string
}) {
  return (
    <div
      className='text-center p-8 rounded-xl border transition-shadow hover:shadow-md'
      style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
    >
      <div
        className='w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white'
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {number}
      </div>
      <h3 className='text-2xl font-bold mb-4' style={{ color: 'var(--color-text-heading)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
      <div className='mt-6 text-4xl'>{emoji}</div>
    </div>
  )
}

function FeatureCard({
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
      className='text-center p-6 rounded-xl border transition-shadow hover:shadow-md'
      style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
    >
      <div className='text-4xl mb-4'>{icon}</div>
      <h3 className='text-lg font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>{title}</h3>
      <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
    </div>
  )
}

function TestimonialCard({
  name,
  role,
  content,
  rating
}: {
  name: string
  role: string
  content: string
  rating: number
}) {
  return (
    <div
      className='p-6 rounded-xl border transition-shadow hover:shadow-md'
      style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
    >
      <div className='flex mb-3'>
        {[...Array(rating)].map((_, i) => (
          <span key={i} className='text-xl' style={{ color: 'var(--color-warning)' }}>★</span>
        ))}
      </div>
      <p className='mb-4' style={{ color: 'var(--color-text-body)' }}>&quot;{content}&quot;</p>
      <div className='pt-4' style={{ borderTop: '1px solid var(--color-card-border)' }}>
        <p className='font-semibold' style={{ color: 'var(--color-text-heading)' }}>{name}</p>
        <p className='text-sm' style={{ color: 'var(--color-primary)' }}>{role}</p>
      </div>
    </div>
  )
}
