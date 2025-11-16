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

    // Token je obavezan za unsubscribe sa stranice upravljanja
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
          { status: 403 }
        )
      }

      // Ažuriraj subscription sa tokenom
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('email', email.toLowerCase())
        .eq('verification_token', token)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'Uspešno ste odjavljeni sa email obaveštenja',
      })
    } else {
      // Ako nema tokena, dozvoli unsubscribe samo ako je direktno iz email linka (za stari sistem)
      // Ali za sigurnost, bolje je zahtevati token
      return NextResponse.json(
        { error: 'Token je obavezan za odjavu' },
        { status: 403 }
      )
    }
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri odjavi sa newslettera' },
      { status: 500 }
    )
  }
}

