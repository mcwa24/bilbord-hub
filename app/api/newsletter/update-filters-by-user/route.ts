import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { email, tags, receiveAll } = await request.json()

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
      .update({
        receive_all: receiveAll === true,
        subscribed_tags: receiveAll ? [] : (tags || []),
        updated_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase())
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Subscription nije pronađen' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Filteri su ažurirani',
      subscription: data,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Greška pri ažuriranju filtera' },
      { status: 500 }
    )
  }
}

