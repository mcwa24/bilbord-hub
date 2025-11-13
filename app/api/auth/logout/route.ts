import { NextResponse } from 'next/server'

export async function GET() {
  // Admin logout se sada radi kroz client-side funkciju u Header komponenti
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}

