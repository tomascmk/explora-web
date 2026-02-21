import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shared Trip - Explora',
  description: 'View this shared trip on Explora — discover unique travel experiences',
  openGraph: {
    title: 'Shared Trip - Explora',
    description: 'View this shared trip on Explora — discover unique travel experiences',
    type: 'website'
  }
}

export default function TripLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
