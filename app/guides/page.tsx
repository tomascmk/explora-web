'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function GuidesLanding() {
  const [earnings, setEarnings] = useState({
    toursPerWeek: 5,
    pricePerTour: 50,
    platformFee: 15
  })

  const weeklyEarnings =
    earnings.toursPerWeek *
    earnings.pricePerTour *
    (1 - earnings.platformFee / 100)
  const monthlyEarnings = weeklyEarnings * 4
  const yearlyEarnings = monthlyEarnings * 12

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
                Become a Guide
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
                For Local Experts
              </p>
              <h1 className='text-4xl sm:text-5xl font-bold mb-6 leading-tight'>
                Turn Your Passion Into Profit
              </h1>
              <p className='text-lg text-slate-300 mb-8'>
                Share your local knowledge and earn money as a tour guide. Set
                your own schedule, create unique experiences, and build a
                thriving business.
              </p>
              <Link
                href='/register'
                className='inline-block px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:shadow-teal-500/25'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Start Earning Today
              </Link>
              <p className='text-sm text-slate-400 mt-4'>
                ✓ Free to join • ✓ No monthly fees • ✓ Keep 85% of your earnings
              </p>
            </div>
            <div className='relative h-96 rounded-2xl overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-teal-500/40 to-slate-900/60'></div>
              <div className='absolute inset-0 flex items-center justify-center text-white text-2xl font-bold'>
                Guide Success Stories
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className='py-20 px-4' style={{ backgroundColor: 'var(--color-card-bg)' }}>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Earnings Calculator
            </p>
            <h2 className='text-3xl sm:text-4xl font-bold mb-4' style={{ color: 'var(--color-text-heading)' }}>
              Calculate Your Earnings
            </h2>
            <p className='text-lg' style={{ color: 'var(--color-text-secondary)' }}>
              See how much you could earn as an Explora guide
            </p>
          </div>

          <div
            className='p-8 rounded-2xl border'
            style={{ backgroundColor: 'var(--color-section-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <div className='space-y-6 mb-8'>
              <div>
                <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
                  Tours per week: <span className='font-bold' style={{ color: 'var(--color-primary)' }}>{earnings.toursPerWeek}</span>
                </label>
                <input
                  type='range'
                  min='1'
                  max='20'
                  value={earnings.toursPerWeek}
                  onChange={(e) =>
                    setEarnings({
                      ...earnings,
                      toursPerWeek: parseInt(e.target.value)
                    })
                  }
                  className='w-full accent-teal-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>
                  Price per tour: <span className='font-bold' style={{ color: 'var(--color-primary)' }}>${earnings.pricePerTour}</span>
                </label>
                <input
                  type='range'
                  min='20'
                  max='200'
                  step='10'
                  value={earnings.pricePerTour}
                  onChange={(e) =>
                    setEarnings({
                      ...earnings,
                      pricePerTour: parseInt(e.target.value)
                    })
                  }
                  className='w-full accent-teal-500'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div
                className='p-6 rounded-xl text-center border'
                style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
              >
                <p className='text-sm mb-2' style={{ color: 'var(--color-text-secondary)' }}>Weekly Earnings</p>
                <p className='text-3xl font-bold' style={{ color: 'var(--color-primary)' }}>
                  ${weeklyEarnings.toFixed(0)}
                </p>
              </div>
              <div
                className='p-6 rounded-xl text-center border'
                style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
              >
                <p className='text-sm mb-2' style={{ color: 'var(--color-text-secondary)' }}>Monthly Earnings</p>
                <p className='text-3xl font-bold' style={{ color: 'var(--color-primary)' }}>
                  ${monthlyEarnings.toFixed(0)}
                </p>
              </div>
              <div
                className='p-6 rounded-xl text-center border'
                style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
              >
                <p className='text-sm mb-2' style={{ color: 'var(--color-text-secondary)' }}>Yearly Earnings</p>
                <p className='text-3xl font-bold' style={{ color: 'var(--color-primary)' }}>
                  ${yearlyEarnings.toFixed(0)}
                </p>
              </div>
            </div>

            <p className='text-sm text-center mt-6' style={{ color: 'var(--color-text-muted)' }}>
              * Based on {earnings.platformFee}% platform fee. Actual earnings
              may vary.
            </p>
          </div>
        </div>
      </section>

      {/* Features for Guides */}
      <section className='py-20 px-4' style={{ backgroundColor: 'var(--color-page-bg)' }}>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Guide Tools
            </p>
            <h2 className='text-3xl sm:text-4xl font-bold' style={{ color: 'var(--color-text-heading)' }}>
              Everything You Need
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <GuideFeature icon='📱' title='Easy Tour Creation' description='Create tours in minutes with our intuitive drag-and-drop map editor. Add photos, audio, and detailed descriptions.' />
            <GuideFeature icon='💰' title='Flexible Pricing' description='Set your own prices and offer time-based discounts. Create premium experiences for higher earnings.' />
            <GuideFeature icon='📊' title='Powerful Dashboard' description='Track bookings, earnings, and reviews in real-time. Get insights to grow your business.' />
            <GuideFeature icon='🗓️' title='Smart Scheduling' description='Manage your availability with our calendar. Accept or decline bookings with one click.' />
            <GuideFeature icon='💳' title='Fast Payouts' description='Get paid weekly or monthly via Stripe. No waiting 30+ days like other platforms.' />
            <GuideFeature icon='🌟' title='Build Your Brand' description='Get verified badges, collect reviews, and become a top-rated guide in your city.' />
            <GuideFeature icon='🎧' title='Audio Guide Tools' description='Record audio guides for self-guided tours. Reach tourists even when you sleep.' />
            <GuideFeature icon='🛡️' title='Protected by Insurance' description='All tours covered by liability insurance. We protect you and your business.' />
            <GuideFeature icon='📞' title='24/7 Support' description='Our guide success team is here to help you grow. Live chat, email, and phone support.' />
          </div>
        </div>
      </section>

      {/* How It Works for Guides */}
      <section className='py-20 px-4' style={{ backgroundColor: 'var(--color-card-bg)' }}>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-primary)' }}>
              Simple Process
            </p>
            <h2 className='text-3xl sm:text-4xl font-bold' style={{ color: 'var(--color-text-heading)' }}>
              Start Guiding in 3 Simple Steps
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
            <div>
              <div
                className='w-14 h-14 rounded-full flex items-center justify-center mb-6 text-xl font-bold text-white'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                1
              </div>
              <h3 className='text-2xl font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>Sign Up Free</h3>
              <p className='mb-4' style={{ color: 'var(--color-text-secondary)' }}>
                Create your guide profile in 5 minutes. Tell us about your
                expertise and passion.
              </p>
              <ul className='space-y-2 text-sm' style={{ color: 'var(--color-text-secondary)' }}>
                <li>✓ No credit card required</li>
                <li>✓ No monthly fees</li>
                <li>✓ Instant approval</li>
              </ul>
            </div>
            <div>
              <div
                className='w-14 h-14 rounded-full flex items-center justify-center mb-6 text-xl font-bold text-white'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                2
              </div>
              <h3 className='text-2xl font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>Create Your Tours</h3>
              <p className='mb-4' style={{ color: 'var(--color-text-secondary)' }}>
                Use our map editor to design amazing tours. Add photos, audio
                guides, and insider tips.
              </p>
              <ul className='space-y-2 text-sm' style={{ color: 'var(--color-text-secondary)' }}>
                <li>✓ Self-guided or in-person</li>
                <li>✓ Set your own prices</li>
                <li>✓ Unlimited tours</li>
              </ul>
            </div>
            <div>
              <div
                className='w-14 h-14 rounded-full flex items-center justify-center mb-6 text-xl font-bold text-white'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                3
              </div>
              <h3 className='text-2xl font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>Start Earning</h3>
              <p className='mb-4' style={{ color: 'var(--color-text-secondary)' }}>
                Get discovered by tourists worldwide. Accept bookings and get
                paid automatically.
              </p>
              <ul className='space-y-2 text-sm' style={{ color: 'var(--color-text-secondary)' }}>
                <li>✓ Keep 85% of earnings</li>
                <li>✓ Weekly payouts</li>
                <li>✓ Global reach</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white py-20'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold mb-6'>
            Ready to Become a Guide?
          </h2>
          <p className='text-lg text-slate-300 mb-8'>
            Join thousands of guides earning money sharing their passion. Sign
            up free in 5 minutes.
          </p>
          <Link
            href='/register'
            className='inline-block px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:shadow-teal-500/25'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Start Your Guide Journey
          </Link>
          <p className='text-sm text-slate-400 mt-4'>
            Already a guide?{' '}
            <Link href='/login' className='underline font-semibold text-white/80 hover:text-white'>
              Login here
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-slate-900 text-white py-12 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <p className='text-slate-400'>
            &copy; 2026 Explora. All rights reserved. • Built for guides, by
            guides.
          </p>
        </div>
      </footer>
    </div>
  )
}

function GuideFeature({
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
