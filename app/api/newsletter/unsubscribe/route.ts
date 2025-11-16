import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { email, token } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Validan email je obavezan' },
        { status: 400 }
      )
    }

    // Ako postoji token, proveri ga
    if (token) {
      const { data: subscription, error: fetchError } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('verification_token', token)
        .single()

      if (fetchError || !subscription) {
        return NextResponse.json(
          { error: 'Nevažeći token ili email' },
          { status: 400 }
        )
      }
    }

    // Ažuriraj subscription
    let query = supabase
      .from('newsletter_subscriptions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase())

    if (token) {
      query = query.eq('verification_token', token)
    }

    const { error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Uspešno ste odjavljeni sa newslettera',
    })
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri odjavi sa newslettera' },
      { status: 500 }
    )
  }
}

