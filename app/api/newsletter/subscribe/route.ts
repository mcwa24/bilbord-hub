import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendConfirmationEmail } from '@/lib/email-confirmation'
import crypto from 'crypto'

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

    // Proveri da li je korisnik ulogovan
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null

    // Generiši verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const finalTags = receiveAll ? [] : (tags || [])
    const receiveAllFlag = receiveAll === true || finalTags.length === 0

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
          receive_all: receiveAllFlag,
          subscribed_tags: finalTags,
          verification_token: verificationToken,
          is_verified: userId ? true : false, // Ako je ulogovan, automatski verifikovano
          user_id: userId || existing.user_id, // Ažuriraj user_id ako je ulogovan
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
          receive_all: receiveAllFlag,
          subscribed_tags: finalTags,
          verification_token: verificationToken,
          is_verified: userId ? true : false, // Ako je ulogovan, automatski verifikovano
          user_id: userId,
        })
        .select()
        .single()

      if (error) throw error
      subscription = data
    }

    // Pošalji confirmation email samo ako korisnik nije ulogovan
    let emailSent = false
    if (!userId) {
      const emailResult = await sendConfirmationEmail(
        email.toLowerCase(),
        verificationToken,
        finalTags
      )

      if (emailResult.error) {
        console.error('Error sending confirmation email:', emailResult.error)
        // Ne baci grešku - subscription je kreiran, samo email nije poslat
      } else {
        emailSent = true
      }
    } else {
      // Ako je ulogovan, ne treba confirmation email
      emailSent = true
    }

    return NextResponse.json({
      success: true,
      message: userId ? 'Uspešno ste prijavljeni na email obaveštenja!' : 'Proverite vaš email za potvrdu prijave',
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

