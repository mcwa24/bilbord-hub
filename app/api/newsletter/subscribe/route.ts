import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Newsletter servis trenutno nije dostupan' },
        { status: 503 }
      )
    }

    // Koristi admin klijent za bypass RLS politika
    const supabase = createAdminClient()

    // PRVO proveri da li već postoji subscription PRE nego što se generiše token i pošalje email
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

    // Ako već postoji i već je verifikovan i aktivan, ne šalji email
    if (existing && existing.is_verified && existing.is_active) {
      return NextResponse.json({
        success: true,
        message: 'Već ste prijavljeni na email obaveštenja!',
        subscription: existing,
        emailSent: false,
      })
    }

    // Generiši verification token samo ako treba da se pošalje email
    const verificationToken = crypto.randomBytes(32).toString('hex')

    let subscription

    try {
      if (existing) {
        // Ako postoji ali nije verifikovan ili nije aktivan, ažuriraj
        const { data, error } = await supabase
          .from('newsletter_subscriptions')
          .update({
            is_active: true,
            receive_all: true,
            subscribed_tags: [],
            verification_token: verificationToken,
            is_verified: false,
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
            receive_all: true,
            subscribed_tags: [],
            verification_token: verificationToken,
            is_verified: false,
            user_id: null,
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
