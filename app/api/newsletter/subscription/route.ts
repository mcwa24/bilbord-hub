import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Validan email je obavezan' },
        { status: 400 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Token je obavezan za pristup upravljanju' },
        { status: 403 }
      )
    }

    // Proveri token
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('verification_token', token)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Nevažeći token ili email' },
        { status: 403 }
      )
    }

    return NextResponse.json({ subscription: data })
  } catch (error: any) {
    console.error('Newsletter subscription get error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri učitavanju subscriptiona' },
      { status: 500 }
    )
  }
}

