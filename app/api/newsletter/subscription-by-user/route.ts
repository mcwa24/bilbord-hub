import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Validan email je obavezan' },
        { status: 400 }
      )
    }

    // Proveri da li je korisnik ulogovan i da li je email njegov
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Morate biti prijavljeni' },
        { status: 401 }
      )
    }

    if (user.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Nemate pristup ovoj pretplati' },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Subscription nije pronađen' },
        { status: 404 }
      )
    }

    return NextResponse.json({ subscription: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Greška pri učitavanju subscriptiona' },
      { status: 500 }
    )
  }
}

