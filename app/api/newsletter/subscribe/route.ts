import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendConfirmationEmail } from '@/lib/email-confirmation'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Validan email je obavezan' },
        { status: 400 }
      )
    }

    // Proveri da li Supabase environment varijable postoje
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Newsletter servis trenutno nije dostupan' },
        { status: 503 }
      )
    }

    const supabase = await createClient()

    // Generiši verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Proveri da li već postoji subscription
    let existing = null
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()
      
      if (!error && data) {
        existing = data
      }
    } catch (error) {
      // Ignore error - subscription might not exist
      console.error('Error checking existing subscription:', error)
    }

    let subscription

    try {
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

        if (error) {
          console.error('Error updating subscription:', error)
          throw error
        }
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

        if (error) {
          console.error('Error creating subscription:', error)
          throw error
        }
        subscription = data
      }
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: dbError.message || 'Greška pri čuvanju pretplate. Molimo pokušajte ponovo.' },
        { status: 500 }
      )
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
