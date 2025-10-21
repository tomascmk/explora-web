import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/guides',
  '/tourists',
  '/api',
  '/_next',
  '/favicon.ico'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isPublicPath) {
    return NextResponse.next()
  }

  // For protected routes, let the client-side auth handle it
  // since we're using localStorage for tokens (not httpOnly cookies)
  // The AuthContext and page-level checks will handle authentication
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
