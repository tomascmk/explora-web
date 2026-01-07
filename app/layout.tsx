import { AuthProvider } from '@/contexts/AuthContext'
import { ApolloWrapper } from '@/components/ApolloWrapper'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Explora - Guide Portal',
  description: 'Tour guide management and booking platform'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ApolloWrapper>
          <AuthProvider>{children}</AuthProvider>
          <Toaster richColors position="top-right" />
        </ApolloWrapper>
      </body>
    </html>
  )
}
