import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Security headers - primenjuju se na sve rute
  // CSP je u next.config.js da bi se primenio na build-time
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')

  // Dodaj cache headere po tipu rute
  const pathname = request.nextUrl.pathname
  
  // Lista saopštenja - NO CACHE (lista se osvežava često)
  // Match-uje tačno /api/releases (bez dodatnih segmenata)
  if (pathname === '/api/releases') {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  // Glavna stranica - NO CACHE jer prikazuje listu saopštenja
  else if (pathname === '/') {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  // Ostale API rute - kratak cache (5 minuta)
  else if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  }

  // Supabase auth removed - we only use it for newsletter subscriptions, not user login

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

