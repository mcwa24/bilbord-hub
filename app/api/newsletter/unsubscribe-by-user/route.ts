import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { email } = await request.json()

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

    const { error } = await supabase
      .from('newsletter_subscriptions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase())

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Uspešno ste odjavljeni sa email obaveštenja',
    })
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri odjavi sa email obaveštenja' },
      { status: 500 }
    )
  }
}

