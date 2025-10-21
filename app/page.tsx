import Link from 'next/link'

export default function MainLanding() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      {/* Navigation */}
      <nav className='backdrop-blur-md bg-white/70 border-b border-white/20 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-20'>
            <div className='flex items-center group'>
              <h1 className='text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105'>
                Explora
              </h1>
            </div>
            <div className='hidden md:flex items-center gap-8'>
              <Link
                href='/guides'
                className='text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200'
              >
                For Guides
              </Link>
              <Link
                href='/tourists'
                className='text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200'
              >
                For Tourists
              </Link>
              <Link href='/login' className='text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200'>
                Login
              </Link>
              <Link
                href='/register'
                className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold'
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative py-32 px-4 overflow-hidden'>
        {/* Animated Background Gradient */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5'></div>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent'></div>
        
        <div className='max-w-7xl mx-auto relative z-10'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
            <div className='space-y-8'>
              <div className='inline-block'>
                <span className='bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold px-6 py-2 rounded-full shadow-lg'>
                  ✨ The Future of Travel
                </span>
              </div>
              
              <h1 className='text-6xl lg:text-7xl font-black leading-tight'>
                <span className='bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent'>
                  Discover
                </span>
                <br />
                <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'>
                  Unforgettable
                </span>
                <br />
                <span className='text-gray-900'>Experiences</span>
              </h1>
              
              <p className='text-2xl text-gray-600 leading-relaxed max-w-xl'>
                Connect with passionate local guides who transform ordinary trips into 
                <span className='text-blue-600 font-semibold'> extraordinary adventures</span>. 
                Your journey, your way.
              </p>
              
              <div className='flex flex-col sm:flex-row gap-4 pt-4'>
                <Link
                  href='/tourists'
                  className='group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden'
                >
                  <span className='relative z-10'>Explore Tours</span>
                  <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                </Link>
                <Link
                  href='/guides'
                  className='group bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-xl'
                >
                  Become a Guide →
                </Link>
              </div>

              {/* Social Proof */}
              <div className='flex items-center gap-8 pt-8'>
                <div className='flex -space-x-4'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-4 border-white shadow-lg'
                    ></div>
                  ))}
                </div>
                <div>
                  <div className='flex items-center gap-1 mb-1'>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className='text-yellow-400 text-xl'>★</span>
                    ))}
                  </div>
                  <p className='text-sm text-gray-600 font-medium'>
                    Loved by <span className='font-bold text-gray-900'>50,000+</span> travelers
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className='relative group'>
              <div className='absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition duration-1000'></div>
              <div className='relative h-[500px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl overflow-hidden shadow-2xl'>
                <div className='absolute inset-0 bg-black/20'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center space-y-4'>
                    <div className='text-8xl'>🌍</div>
                    <p className='text-white text-2xl font-bold'>Your Adventure Awaits</p>
                  </div>
                </div>
                {/* Floating Cards */}
                <div className='absolute top-10 right-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-xl transform rotate-6 hover:rotate-0 transition-transform duration-300'>
                  <p className='text-sm font-semibold text-gray-900'>⭐ 4.9/5 Rating</p>
                </div>
                <div className='absolute bottom-10 left-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-300'>
                  <p className='text-sm font-semibold text-gray-900'>🎯 1000+ Tours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-32 px-4 bg-white relative overflow-hidden'>
        {/* Decorative Elements */}
        <div className='absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-20'></div>
        <div className='absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20'></div>
        
        <div className='max-w-7xl mx-auto relative z-10'>
          <div className='text-center mb-20'>
            <span className='text-blue-600 font-semibold text-sm uppercase tracking-wider'>Simple & Seamless</span>
            <h2 className='text-5xl lg:text-6xl font-black text-gray-900 mt-4 mb-6'>
              How It <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>Works</span>
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Your journey from discovery to adventure in three effortless steps
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12'>
            {/* Step 1 */}
            <div className='group relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl transform group-hover:scale-105 transition-transform duration-300'></div>
              <div className='relative bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300'>
                <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300'>
                  <span className='text-3xl font-black text-white'>1</span>
                </div>
                <h3 className='text-2xl font-bold mb-4 text-gray-900'>Discover</h3>
                <p className='text-gray-600 leading-relaxed'>
                  Explore curated tours from <span className='font-semibold text-blue-600'>passionate local experts</span> in destinations worldwide. Find your perfect adventure.
                </p>
                <div className='mt-6 flex justify-center'>
                  <span className='text-4xl'>🔍</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className='group relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl transform group-hover:scale-105 transition-transform duration-300'></div>
              <div className='relative bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300'>
                <div className='w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300'>
                  <span className='text-3xl font-black text-white'>2</span>
                </div>
                <h3 className='text-2xl font-bold mb-4 text-gray-900'>Choose</h3>
                <p className='text-gray-600 leading-relaxed'>
                  Select between <span className='font-semibold text-purple-600'>self-guided audio tours</span> or <span className='font-semibold text-purple-600'>live in-person experiences</span>. Your journey, your way.
                </p>
                <div className='mt-6 flex justify-center gap-3'>
                  <span className='text-3xl'>📱</span>
                  <span className='text-3xl'>👥</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className='group relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-3xl transform group-hover:scale-105 transition-transform duration-300'></div>
              <div className='relative bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300'>
                <div className='w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300'>
                  <span className='text-3xl font-black text-white'>3</span>
                </div>
                <h3 className='text-2xl font-bold mb-4 text-gray-900'>Explore</h3>
                <p className='text-gray-600 leading-relaxed'>
                  Embark on your adventure, discover <span className='font-semibold text-pink-600'>hidden gems</span>, and create <span className='font-semibold text-pink-600'>unforgettable memories</span> that last a lifetime.
                </p>
                <div className='mt-6 flex justify-center'>
                  <span className='text-4xl'>✨</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='py-20 px-4 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-4xl font-bold text-center mb-16'>
            Why Choose Explora?
          </h2>
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
          <h2 className='text-4xl font-bold text-center mb-16'>
            What Our Users Say
          </h2>
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
      <section className='relative py-32 px-4 overflow-hidden'>
        {/* Animated Gradient Background */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'></div>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]'></div>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]'></div>
        
        <div className='max-w-5xl mx-auto text-center relative z-10'>
          <div className='inline-block mb-6'>
            <span className='bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-6 py-2 rounded-full'>
              🚀 Join 50,000+ Travelers
            </span>
          </div>
          
          <h2 className='text-5xl lg:text-6xl font-black text-white mb-8 leading-tight'>
            Your Next Adventure<br />
            <span className='bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent'>
              Starts Here
            </span>
          </h2>
          
          <p className='text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed'>
            Stop dreaming. Start exploring. Connect with passionate local guides 
            and transform the way you experience the world.
          </p>
          
          <div className='flex flex-col sm:flex-row justify-center gap-6'>
            <Link
              href='/register'
              className='group relative bg-white text-gray-900 px-12 py-5 rounded-2xl font-black text-lg shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:scale-105 overflow-hidden'
            >
              <span className='relative z-10'>Get Started Free</span>
              <div className='absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            </Link>
            <Link
              href='/tourists'
              className='group bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105'
            >
              Explore Tours →
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className='mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto'>
            <div className='text-center'>
              <p className='text-4xl font-black text-white mb-2'>1000+</p>
              <p className='text-white/80 text-sm'>Tours Worldwide</p>
            </div>
            <div className='text-center'>
              <p className='text-4xl font-black text-white mb-2'>50K+</p>
              <p className='text-white/80 text-sm'>Happy Travelers</p>
            </div>
            <div className='text-center'>
              <p className='text-4xl font-black text-white mb-2'>4.9★</p>
              <p className='text-white/80 text-sm'>Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white py-16 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-12'>
            <div>
              <h3 className='text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4'>
                Explora
              </h3>
              <p className='text-gray-400 leading-relaxed mb-6'>
                Transforming the way the world explores, one adventure at a time.
              </p>
              <div className='flex gap-4'>
                <div className='w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 transition-colors duration-200 flex items-center justify-center cursor-pointer'>
                  <span>𝕏</span>
                </div>
                <div className='w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 transition-colors duration-200 flex items-center justify-center cursor-pointer'>
                  <span>in</span>
                </div>
                <div className='w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 transition-colors duration-200 flex items-center justify-center cursor-pointer'>
                  <span>ig</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className='font-bold mb-4 text-white'>For Tourists</h4>
              <ul className='space-y-3 text-gray-400'>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>Browse Tours</li>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>How It Works</li>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>Mobile App</li>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>Gift Cards</li>
              </ul>
            </div>
            <div>
              <h4 className='font-bold mb-4 text-white'>For Guides</h4>
              <ul className='space-y-3 text-gray-400'>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>Become a Guide</li>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>Guide Dashboard</li>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>Pricing</li>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>Resources</li>
              </ul>
            </div>
            <div>
              <h4 className='font-bold mb-4 text-white'>Company</h4>
              <ul className='space-y-3 text-gray-400'>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>About Us</li>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>Contact</li>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>Terms of Service</li>
                <li className='hover:text-white transition-colors duration-200 cursor-pointer'>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-gray-400 text-sm'>&copy; 2025 Explora. All rights reserved. Built with ❤️ for travelers.</p>
            <div className='flex gap-6 text-gray-400 text-sm'>
              <span className='hover:text-white transition-colors duration-200 cursor-pointer'>English</span>
              <span className='hover:text-white transition-colors duration-200 cursor-pointer'>Español</span>
              <span className='hover:text-white transition-colors duration-200 cursor-pointer'>Français</span>
              <span className='hover:text-white transition-colors duration-200 cursor-pointer'>Português</span>
            </div>
          </div>
        </div>
      </footer>
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
  rating
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
