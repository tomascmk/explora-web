import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Explora - Discover Unforgettable Experiences',
  description: 'Connect with local guides and discover authentic experiences'
}

export default function LandingPage() {
  return (
    <div className='min-h-screen'>
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
              <Link href='/guides' className='text-sm font-medium text-white/80 hover:text-white transition'>
                For Guides
              </Link>
              <Link href='/tourists' className='text-sm font-medium text-white/80 hover:text-white transition'>
                For Tourists
              </Link>
              <Link href='/login' className='text-sm font-medium text-white/80 hover:text-white transition'>
                Login
              </Link>
              <Link
                href='/register'
                className='text-sm font-semibold text-white px-5 py-2 rounded-lg transition hover:opacity-90'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Get Started
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
          <div className='text-center max-w-3xl mx-auto'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-4' style={{ color: 'var(--color-primary)' }}>
              Your Adventure Starts Here
            </p>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
              Discover Unforgettable Experiences
            </h1>
            <p className='text-lg sm:text-xl mb-10 text-slate-300'>
              Connect with local guides or explore at your own pace. Authentic tours crafted by people who know every hidden gem.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/guides'
                className='px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:shadow-teal-500/25'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                For Guides
              </Link>
              <Link
                href='/tourists'
                className='px-8 py-3.5 rounded-xl font-semibold text-white border-2 border-white/20 hover:border-white/40 transition-all backdrop-blur-sm bg-white/5'
              >
                For Tourists
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20' style={{ backgroundColor: 'var(--color-page-bg)' }}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Why Explora
            </p>
            <h2 className='text-3xl sm:text-4xl font-bold' style={{ color: 'var(--color-text-heading)' }}>
              Why Choose Explora?
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <FeatureCard title='Local Expertise' description='Connect with verified local guides who know the best spots' icon='🗺️' />
            <FeatureCard title='Flexible Options' description='Choose guided tours or self-guided adventures' icon='🎯' />
            <FeatureCard title='Secure Booking' description='Safe payments and verified reviews' icon='🔒' />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-20' style={{ backgroundColor: 'var(--color-card-bg)' }}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Simple Process
            </p>
            <h2 className='text-3xl sm:text-4xl font-bold' style={{ color: 'var(--color-text-heading)' }}>
              How It Works
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <Step number={1} title='Browse' description='Explore tours and experiences in your destination' />
            <Step number={2} title='Book' description='Reserve your spot securely in seconds' />
            <Step number={3} title='Enjoy' description='Experience something truly amazing' />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white py-20'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold mb-6'>
            Ready to Start Your Adventure?
          </h2>
          <p className='text-lg text-slate-300 mb-10'>Join thousands of happy explorers worldwide</p>
          <Link
            href='/register'
            className='inline-block px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:shadow-teal-500/25'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-slate-900 text-white py-12 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <p className='text-slate-400'>&copy; 2026 Explora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
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

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className='text-center'>
      <div
        className='w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-5 text-white'
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {number}
      </div>
      <h3 className='text-xl font-semibold mb-3' style={{ color: 'var(--color-text-heading)' }}>{title}</h3>
      <p style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
    </div>
  )
}
