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
              <Link
                href='/tourists'
                className='text-gray-600 hover:text-gray-900'
              >
                For Tourists
              </Link>
              <Link href='/login' className='text-gray-600 hover:text-gray-900'>
                Login
              </Link>
              <Link
                href='/register'
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700'
              >
                Become a Guide
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='py-20 px-4 bg-gradient-to-br from-green-50 to-white'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h1 className='text-5xl font-bold text-gray-900 mb-6'>
                Turn Your Passion Into Profit
              </h1>
              <p className='text-xl text-gray-600 mb-8'>
                Share your local knowledge and earn money as a tour guide. Set
                your own schedule, create unique experiences, and build a
                thriving business.
              </p>
              <Link
                href='/register'
                className='inline-block bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 font-semibold text-lg'
              >
                Start Earning Today
              </Link>
              <p className='text-sm text-gray-500 mt-4'>
                ✓ Free to join • ✓ No monthly fees • ✓ Keep 85% of your earnings
              </p>
            </div>
            <div className='relative h-96 bg-gray-200 rounded-2xl overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 opacity-80'></div>
              <div className='absolute inset-0 flex items-center justify-center text-white text-2xl font-bold'>
                Guide Success Stories
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className='py-20 px-4 bg-white'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-4'>
            Calculate Your Earnings
          </h2>
          <p className='text-xl text-gray-600 text-center mb-12'>
            See how much you could earn as an Explora guide
          </p>

          <div className='bg-gray-50 p-8 rounded-2xl'>
            <div className='space-y-6 mb-8'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Tours per week: {earnings.toursPerWeek}
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
                  className='w-full'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Price per tour: ${earnings.pricePerTour}
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
                  className='w-full'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-white p-6 rounded-lg text-center'>
                <p className='text-gray-600 text-sm mb-2'>Weekly Earnings</p>
                <p className='text-3xl font-bold text-green-600'>
                  ${weeklyEarnings.toFixed(0)}
                </p>
              </div>
              <div className='bg-white p-6 rounded-lg text-center'>
                <p className='text-gray-600 text-sm mb-2'>Monthly Earnings</p>
                <p className='text-3xl font-bold text-green-600'>
                  ${monthlyEarnings.toFixed(0)}
                </p>
              </div>
              <div className='bg-white p-6 rounded-lg text-center'>
                <p className='text-gray-600 text-sm mb-2'>Yearly Earnings</p>
                <p className='text-3xl font-bold text-green-600'>
                  ${yearlyEarnings.toFixed(0)}
                </p>
              </div>
            </div>

            <p className='text-sm text-gray-500 text-center mt-6'>
              * Based on {earnings.platformFee}% platform fee. Actual earnings
              may vary.
            </p>
          </div>
        </div>
      </section>

      {/* Features for Guides */}
      <section className='py-20 px-4 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-16'>
            Everything You Need
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <GuideFeature
              icon='📱'
              title='Easy Tour Creation'
              description='Create tours in minutes with our intuitive drag-and-drop map editor. Add photos, audio, and detailed descriptions.'
            />
            <GuideFeature
              icon='💰'
              title='Flexible Pricing'
              description='Set your own prices and offer time-based discounts. Create premium experiences for higher earnings.'
            />
            <GuideFeature
              icon='📊'
              title='Powerful Dashboard'
              description='Track bookings, earnings, and reviews in real-time. Get insights to grow your business.'
            />
            <GuideFeature
              icon='🗓️'
              title='Smart Scheduling'
              description='Manage your availability with our calendar. Accept or decline bookings with one click.'
            />
            <GuideFeature
              icon='💳'
              title='Fast Payouts'
              description='Get paid weekly or monthly via Stripe. No waiting 30+ days like other platforms.'
            />
            <GuideFeature
              icon='🌟'
              title='Build Your Brand'
              description='Get verified badges, collect reviews, and become a top-rated guide in your city.'
            />
            <GuideFeature
              icon='🎧'
              title='Audio Guide Tools'
              description='Record audio guides for self-guided tours. Reach tourists even when you sleep.'
            />
            <GuideFeature
              icon='🛡️'
              title='Protected by Insurance'
              description='All tours covered by liability insurance. We protect you and your business.'
            />
            <GuideFeature
              icon='📞'
              title='24/7 Support'
              description='Our guide success team is here to help you grow. Live chat, email, and phone support.'
            />
          </div>
        </div>
      </section>

      {/* How It Works for Guides */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-16'>
            Start Guiding in 3 Simple Steps
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
            <div>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6'>
                <span className='text-xl font-bold text-green-600'>1</span>
              </div>
              <h3 className='text-2xl font-semibold mb-4'>Sign Up Free</h3>
              <p className='text-gray-600 mb-4'>
                Create your guide profile in 5 minutes. Tell us about your
                expertise and passion.
              </p>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li>✓ No credit card required</li>
                <li>✓ No monthly fees</li>
                <li>✓ Instant approval</li>
              </ul>
            </div>
            <div>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6'>
                <span className='text-xl font-bold text-green-600'>2</span>
              </div>
              <h3 className='text-2xl font-semibold mb-4'>Create Your Tours</h3>
              <p className='text-gray-600 mb-4'>
                Use our map editor to design amazing tours. Add photos, audio
                guides, and insider tips.
              </p>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li>✓ Self-guided or in-person</li>
                <li>✓ Set your own prices</li>
                <li>✓ Unlimited tours</li>
              </ul>
            </div>
            <div>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6'>
                <span className='text-xl font-bold text-green-600'>3</span>
              </div>
              <h3 className='text-2xl font-semibold mb-4'>Start Earning</h3>
              <p className='text-gray-600 mb-4'>
                Get discovered by tourists worldwide. Accept bookings and get
                paid automatically.
              </p>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li>✓ Keep 85% of earnings</li>
                <li>✓ Weekly payouts</li>
                <li>✓ Global reach</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className='py-20 px-4 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-16'>
            Guide Success Stories
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <SuccessStory
              name='Carlos Martinez'
              city='Barcelona'
              earnings='$4,500/month'
              tours={120}
              rating={4.9}
              quote='Explora changed my life. I quit my 9-5 and now I make more money doing what I love.'
            />
            <SuccessStory
              name='Yuki Tanaka'
              city='Tokyo'
              earnings='$3,800/month'
              tours={95}
              rating={5.0}
              quote='The platform is so easy to use. I created 10 tours in my first week and got bookings immediately.'
            />
            <SuccessStory
              name='Sophie Dubois'
              city='Paris'
              earnings='$5,200/month'
              tours={150}
              rating={4.95}
              quote='Best decision ever. My food tours are fully booked months in advance. The automatic payouts are a game-changer.'
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='py-20 px-4 bg-green-600'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-4xl font-bold text-white mb-6'>
            Ready to Become a Guide?
          </h2>
          <p className='text-xl text-green-100 mb-8'>
            Join thousands of guides earning money sharing their passion. Sign
            up free in 5 minutes.
          </p>
          <Link
            href='/register'
            className='inline-block bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg'
          >
            Start Your Guide Journey
          </Link>
          <p className='text-sm text-green-100 mt-4'>
            Already a guide?{' '}
            <Link href='/login' className='underline font-semibold'>
              Login here
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <p className='text-gray-400'>
            &copy; 2025 Explora. All rights reserved. • Built for guides, by
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
    <div className='bg-white p-6 rounded-lg shadow-sm'>
      <div className='text-4xl mb-4'>{icon}</div>
      <h3 className='text-xl font-semibold mb-3'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
    </div>
  )
}

function SuccessStory({
  name,
  city,
  earnings,
  tours,
  rating,
  quote
}: {
  name: string
  city: string
  earnings: string
  tours: number
  rating: number
  quote: string
}) {
  return (
    <div className='bg-white p-6 rounded-lg shadow-sm'>
      <div className='flex items-center mb-4'>
        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4'>
          <span className='text-2xl'>👤</span>
        </div>
        <div>
          <h3 className='font-semibold text-lg'>{name}</h3>
          <p className='text-sm text-gray-600'>{city}</p>
        </div>
      </div>
      <div className='grid grid-cols-3 gap-2 mb-4'>
        <div className='text-center'>
          <p className='text-xs text-gray-600'>Earnings</p>
          <p className='font-semibold text-green-600'>{earnings}</p>
        </div>
        <div className='text-center'>
          <p className='text-xs text-gray-600'>Tours</p>
          <p className='font-semibold'>{tours}</p>
        </div>
        <div className='text-center'>
          <p className='text-xs text-gray-600'>Rating</p>
          <p className='font-semibold'>⭐ {rating}</p>
        </div>
      </div>
      <p className='text-gray-600 text-sm italic'>&quot;{quote}&quot;</p>
    </div>
  )
}
