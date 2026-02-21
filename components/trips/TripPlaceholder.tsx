'use client'

/**
 * TripPlaceholder — Generic trip placeholder shown behind frosted glass overlay.
 * Uses fake/hardcoded data to give users a sense of what a shared trip looks like
 * without revealing any real content before authentication.
 */
export function TripPlaceholder() {
  return (
    <div className='pointer-events-none select-none overflow-hidden max-h-screen'>
      <div style={{ filter: 'blur(8px)' }}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          {/* Desktop layout */}
          <div className='hidden lg:grid lg:grid-cols-2 lg:gap-8'>
            <div>
              <PlaceholderContent />
            </div>
            <div>
              <PlaceholderMap />
            </div>
          </div>

          {/* Mobile layout */}
          <div className='lg:hidden'>
            <PlaceholderContent />
            <PlaceholderMap />
          </div>
        </div>
      </div>
    </div>
  )
}

function PlaceholderContent() {
  return (
    <div>
      {/* Title */}
      <div
        className='h-8 w-64 rounded-lg mb-3'
        style={{ backgroundColor: 'var(--color-section-bg)' }}
      />
      {/* Description */}
      <div
        className='h-4 w-full rounded mb-2'
        style={{ backgroundColor: 'var(--color-section-bg)' }}
      />
      <div
        className='h-4 w-3/4 rounded mb-4'
        style={{ backgroundColor: 'var(--color-section-bg)' }}
      />
      {/* Meta */}
      <div className='flex gap-3 mb-8'>
        <div
          className='h-4 w-24 rounded'
          style={{ backgroundColor: 'var(--color-primary-light)' }}
        />
        <div
          className='h-4 w-16 rounded'
          style={{ backgroundColor: 'var(--color-section-bg)' }}
        />
      </div>

      {/* Section title */}
      <div
        className='h-6 w-32 rounded mb-4'
        style={{ backgroundColor: 'var(--color-section-bg)' }}
      />

      {/* Placeholder post cards */}
      {[1, 2, 3, 4].map((i) => (
        <PlaceholderPostCard key={i} index={i} />
      ))}
    </div>
  )
}

function PlaceholderPostCard({ index }: { index: number }) {
  return (
    <div
      className='rounded-2xl p-4 border mb-4'
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-card-border)'
      }}
    >
      <div className='flex items-center gap-3 mb-3'>
        <div
          className='w-7 h-7 rounded-full flex items-center justify-center shrink-0'
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <span className='text-white text-xs font-bold'>{index}</span>
        </div>
        <div className='flex-1'>
          <div
            className='h-4 w-28 rounded mb-1'
            style={{ backgroundColor: 'var(--color-section-bg)' }}
          />
          <div
            className='h-3 w-40 rounded'
            style={{ backgroundColor: 'var(--color-section-bg)' }}
          />
        </div>
        <div
          className='h-3 w-12 rounded'
          style={{ backgroundColor: 'var(--color-section-bg)' }}
        />
      </div>
      <div
        className='h-3 w-full rounded mb-2'
        style={{ backgroundColor: 'var(--color-section-bg)' }}
      />
      <div
        className='h-3 w-5/6 rounded mb-2'
        style={{ backgroundColor: 'var(--color-section-bg)' }}
      />
      <div
        className='h-3 w-2/3 rounded'
        style={{ backgroundColor: 'var(--color-section-bg)' }}
      />
    </div>
  )
}

function PlaceholderMap() {
  return (
    <div
      className='rounded-2xl mb-5 lg:mb-0'
      style={{
        height: 300,
        backgroundColor: 'var(--color-section-bg)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Fake map grid lines */}
      <div className='absolute inset-0 opacity-20'>
        {[...Array(6)].map((_, i) => (
          <div
            key={`h-${i}`}
            className='absolute w-full'
            style={{
              top: `${(i + 1) * 14}%`,
              height: 1,
              backgroundColor: 'var(--color-card-border)'
            }}
          />
        ))}
        {[...Array(6)].map((_, i) => (
          <div
            key={`v-${i}`}
            className='absolute h-full'
            style={{
              left: `${(i + 1) * 14}%`,
              width: 1,
              backgroundColor: 'var(--color-card-border)'
            }}
          />
        ))}
      </div>

      {/* Fake markers */}
      <div
        className='absolute w-8 h-8 rounded-full flex items-center justify-center'
        style={{
          top: '30%',
          left: '25%',
          backgroundColor: 'var(--color-primary)',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        <span className='text-white text-xs font-bold'>1</span>
      </div>
      <div
        className='absolute w-8 h-8 rounded-full flex items-center justify-center'
        style={{
          top: '50%',
          left: '55%',
          backgroundColor: 'var(--color-primary)',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        <span className='text-white text-xs font-bold'>2</span>
      </div>
      <div
        className='absolute w-8 h-8 rounded-full flex items-center justify-center'
        style={{
          top: '35%',
          left: '75%',
          backgroundColor: 'var(--color-primary)',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        <span className='text-white text-xs font-bold'>3</span>
      </div>

      {/* Fake dashed polyline */}
      <svg className='absolute inset-0 w-full h-full opacity-40'>
        <line
          x1='27%' y1='35%' x2='57%' y2='55%'
          stroke='#14B8A6' strokeWidth='2' strokeDasharray='6,6'
        />
        <line
          x1='57%' y1='55%' x2='77%' y2='40%'
          stroke='#14B8A6' strokeWidth='2' strokeDasharray='6,6'
        />
      </svg>
    </div>
  )
}
