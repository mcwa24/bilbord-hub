import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendConfirmationEmail } from '@/lib/email-confirmation'
import { sendAdminNotificationEmail } from '@/lib/email-admin'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, tags = [], receiveAll = true } = await request.json()

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

    // Proveri da li već postoji verifikovana i aktivna subscription
    const { data: existingVerified } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_verified', true)
      .eq('is_active', true)
      .maybeSingle()
    
    if (existingVerified) {
      console.log('User already verified and active - skipping email', {
        email: existingVerified.email,
      })
      return NextResponse.json({
        success: true,
        message: 'Već ste prijavljeni na email obaveštenja!',
        subscription: existingVerified,
        emailSent: false,
      })
    }

    // Generiši verification token sa enkodovanim podacima
    // Token format: base64(email|tags|receiveAll) + random hex za sigurnost
    const payload = JSON.stringify({
      email: email.toLowerCase(),
      tags: receiveAll ? [] : tags,
      receiveAll: receiveAll,
    })
    // Koristi običan base64 i zameni karaktere koji nisu URL-safe
    const encodedPayload = Buffer.from(payload).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    const randomPart = crypto.randomBytes(16).toString('hex')
    const verificationToken = `${encodedPayload}.${randomPart}`
    console.log('Generated token:', verificationToken.substring(0, 50) + '...')
    console.log('Token payload:', payload)

    // Pošalji confirmation email korisniku
    let emailSent = false
    console.log('Attempting to send confirmation email to:', email.toLowerCase())
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    
    // Detektuj host iz request-a za localhost development
    const host = request.headers.get('host') || undefined
    console.log('Request host:', host)
    
    const emailResult = await sendConfirmationEmail(
      email.toLowerCase(),
      verificationToken,
      host
    )

    if (emailResult.error) {
      console.error('Error sending confirmation email:', emailResult.error)
      // Ne baci grešku - subscription je kreiran, samo email nije poslat
      // Ali vrati informaciju o grešci u response
    } else {
      emailSent = true
      console.log('Confirmation email sent successfully')
    }

    // Admin notification email će biti poslat tek kada korisnik klikne na link (u verify ruti)

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'Proverite vaš email za potvrdu prijave'
        : 'Email nije poslat. Molimo kontaktirajte administratora.',
      emailSent: emailSent,
      emailError: emailResult?.error || null,
    })
  } catch (error: any) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri prijavi na newsletter' },
      { status: 500 }
    )
  }
}
