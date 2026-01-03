import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// by default, all routes are protected

// put the public routes here - these will be accessed by both guests and users
const publicRoutes = [
  '/terms-of-service',
  '/privacy-policy',
  '/city-select',
  '/book',
  '/booking',
]

// City slugs that are public (dynamic routes)
const publicCitySlugs = ['mallorca', 'mazunte']

// put the authentication routes here - these will only be accessed by guests
const authRoutes = ['/sign-in', '/sign-up', '/reset-password']

// Base domain for subdomain routing (e.g., 'connection.ink')
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'

// Helper to extract city slug from subdomain
function getCityFromSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0]

  // Skip for localhost without subdomain
  if (host === 'localhost' || host === '127.0.0.1') return null

  // Extract subdomain from hostname
  // e.g., mallorca.connection.ink -> mallorca
  const baseDomainWithoutPort = BASE_DOMAIN.split(':')[0]
  if (host.endsWith(baseDomainWithoutPort)) {
    const subdomain = host.replace(`.${baseDomainWithoutPort}`, '')
    // Check if it's a valid city slug (not 'www' or empty)
    if (subdomain && subdomain !== 'www' && subdomain !== baseDomainWithoutPort) {
      return subdomain
    }
  }

  return null
}

// Helper to check if a path is a public city route
function isPublicCityRoute(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return false
  const citySlug = segments[0]
  // Allow all routes under public city slugs (e.g., /mallorca, /mallorca/practitioners)
  return publicCitySlugs.includes(citySlug)
}

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const cityFromSubdomain = getCityFromSubdomain(hostname)

  // If accessing via subdomain (e.g., mallorca.connection.ink)
  // Rewrite to the city path (e.g., /mallorca)
  if (cityFromSubdomain) {
    const pathname = req.nextUrl.pathname

    // Don't rewrite if already on a city path or special routes
    if (!pathname.startsWith(`/${cityFromSubdomain}`) &&
        !pathname.startsWith('/api') &&
        !pathname.startsWith('/_next') &&
        !pathname.startsWith('/sign-in') &&
        !pathname.startsWith('/sign-up') &&
        !pathname.startsWith('/practitioner') &&
        !pathname.startsWith('/admin') &&
        !pathname.startsWith('/settings')) {

      // Rewrite / to /[city] and /practitioners to /[city]/practitioners etc.
      const newPath = pathname === '/'
        ? `/${cityFromSubdomain}`
        : `/${cityFromSubdomain}${pathname}`

      const url = req.nextUrl.clone()
      url.pathname = newPath
      return NextResponse.rewrite(url)
    }
  }

  // we need to create a response and hand it to the supabase client to be able to modify the response headers.
  const res = NextResponse.next()

  // public routes - no need for Supabase
  if (publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    return res
  }

  // public city routes (e.g., /mallorca, /mazunte/practitioners)
  if (isPublicCityRoute(req.nextUrl.pathname)) {
    return res
  }
  // create authenticated Supabase Client.
  const supabase = createMiddlewareClient({ req, res })
  // check if we have a session
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  // redirect if a logged in user is accessing an auth route (e.g. /sign-in)
  if (user && isAuthRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }
  // show auth routes for guests
  if (!user && isAuthRoute) {
    return res
  }
  // restrict the user if trying to access protected routes
  if (!user) {
    console.log(`User not logged in. Attempted to access: ${req.nextUrl.pathname}`)
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/sign-in'
    // redirectUrl.searchParams.set(`redirected_from`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  // show the protected page to logged in route
  return res
}

export const config = {
  // we're only interested in /pages, not assets or api routes
  // so we exclude those here
  matcher: '/((?!api|static|.*\\..*|_next).*)',
}
