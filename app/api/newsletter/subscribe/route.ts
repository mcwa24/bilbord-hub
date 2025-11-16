import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendConfirmationEmail } from '@/lib/email-confirmation'
import crypto from 'crypto'

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

    // Generiši verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Proveri da li već postoji subscription
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    let subscription

    if (existing) {
      // Ažuriraj postojeću subscription
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          is_active: true,
          receive_all: true, // Uvek prima sva obaveštenja
          subscribed_tags: [], // Bez tagova
          verification_token: verificationToken,
          is_verified: false, // Uvek treba verifikacija
          updated_at: new Date().toISOString(),
        })
        .eq('email', email.toLowerCase())
        .select()
        .single()

      if (error) throw error
      subscription = data
    } else {
      // Kreiraj novu subscription
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: email.toLowerCase(),
          is_active: true,
          receive_all: true, // Uvek prima sva obaveštenja
          subscribed_tags: [], // Bez tagova
          verification_token: verificationToken,
          is_verified: false, // Uvek treba verifikacija
          user_id: null, // Ne koristimo user_id više
        })
        .select()
        .single()

      if (error) throw error
      subscription = data
    }

    // Pošalji confirmation email
    let emailSent = false
    const emailResult = await sendConfirmationEmail(
      email.toLowerCase(),
      verificationToken
    )

    if (emailResult.error) {
      console.error('Error sending confirmation email:', emailResult.error)
      // Ne baci grešku - subscription je kreiran, samo email nije poslat
    } else {
      emailSent = true
    }

    return NextResponse.json({
      success: true,
      message: 'Proverite vaš email za potvrdu prijave',
      subscription: subscription,
      emailSent: emailSent,
    })
  } catch (error: any) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri prijavi na newsletter' },
      { status: 500 }
    )
  }
}
