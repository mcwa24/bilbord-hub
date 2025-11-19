import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Proveri da li Supabase environment varijable postoje
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
      const redirectUrl = `${siteUrl}/newsletter/potvrda?error=${encodeURIComponent('Newsletter servis trenutno nije dostupan')}`
      return NextResponse.json({ 
        success: false, 
        error: 'Newsletter servis trenutno nije dostupan',
        redirectUrl 
      }, {
        status: 503,
        headers: {
          'Location': redirectUrl
        }
      })
    }

    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams
    const encodedToken = searchParams.get('token')
    const email = searchParams.get('email')

    console.log('Verify request - encoded token:', encodedToken ? `${encodedToken.substring(0, 30)}...` : 'MISSING')
    console.log('Verify request - email:', email)

    if (!encodedToken || !email) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
      const redirectUrl = `${siteUrl}/newsletter/potvrda?error=${encodeURIComponent('Token i email su obavezni')}`
      return NextResponse.json(
        { 
          error: 'Token i email su obavezni',
          redirectUrl
        },
        { status: 400 }
      )
    }

    // Dekoduj token iz URL-a
    let token: string
    try {
      token = decodeURIComponent(encodedToken)
      console.log('Decoded token (first 50 chars):', token.substring(0, 50))
      console.log('Token length:', token.length)
    } catch (decodeError: any) {
      console.error('Error decoding URI component:', decodeError)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
      const redirectUrl = `${siteUrl}/newsletter/potvrda?error=${encodeURIComponent('Nevažeći token format')}`
      return NextResponse.json(
        { 
          error: 'Nevažeći token format',
          redirectUrl
        },
        { status: 400 }
      )
    }

    // Dekoduj podatke iz token-a
    let subscriptionData: { email: string; tags: string[]; receiveAll: boolean }
    try {
      // Token format: base64payload.randomhex
      const parts = token.split('.')
      console.log('Token parts count:', parts.length)
      if (parts.length < 2) {
        console.error('Invalid token format - parts:', parts)
        throw new Error('Invalid token format - expected format: base64payload.randomhex')
      }
      const encodedPayload = parts[0]
      console.log('Encoded payload (first 30 chars):', encodedPayload.substring(0, 30))
      console.log('Encoded payload length:', encodedPayload.length)
      
      // Konvertuj URL-safe base64 nazad u standardni base64
      const standardBase64 = encodedPayload
        .replace(/-/g, '+')
        .replace(/_/g, '/')
      
      // Dodaj padding ako je potrebno
      const padding = (4 - standardBase64.length % 4) % 4
      const paddedPayload = standardBase64 + '='.repeat(padding)
      console.log('Padded payload (first 30 chars):', paddedPayload.substring(0, 30))
      
      const decodedPayload = Buffer.from(paddedPayload, 'base64').toString('utf-8')
      console.log('Decoded payload:', decodedPayload)
      
      subscriptionData = JSON.parse(decodedPayload)
      console.log('Subscription data parsed:', subscriptionData)
    } catch (decodeError: any) {
      console.error('Error decoding token:', decodeError)
      console.error('Error name:', decodeError.name)
      console.error('Error message:', decodeError.message)
      console.error('Error stack:', decodeError.stack)
      console.error('Token that failed (first 100 chars):', token.substring(0, 100))
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
      const errorMessage = decodeError.message || 'Greška pri dekodovanju tokena'
      const redirectUrl = `${siteUrl}/newsletter/potvrda?error=${encodeURIComponent('Nevažeći token: ' + errorMessage)}`
      return NextResponse.json(
        { 
          error: 'Nevažeći token: ' + errorMessage,
          redirectUrl
        },
        { status: 400 }
      )
    }

        // Proveri da li email iz token-a odgovara email-u iz URL-a
        const tokenEmail = subscriptionData.email.toLowerCase().trim()
        const urlEmail = email.toLowerCase().trim()
        console.log('Comparing emails - token email:', tokenEmail, 'URL email:', urlEmail)
        if (tokenEmail !== urlEmail) {
          console.error('Email mismatch! Token email:', tokenEmail, 'URL email:', urlEmail)
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
          const redirectUrl = `${siteUrl}/newsletter/potvrda?error=${encodeURIComponent('Email se ne poklapa sa tokenom')}`
          return NextResponse.json(
            { 
              error: 'Email se ne poklapa sa tokenom',
              redirectUrl
            },
            { status: 400 }
          )
        }

    // Proveri da li već postoji verifikovana i aktivna subscription
    const { data: existingSubscription } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', subscriptionData.email.toLowerCase())
      .eq('is_verified', true)
      .eq('is_active', true)
      .maybeSingle()

    if (existingSubscription) {
      // Već je registrovan i verifikovan
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
      const redirectUrl = `${siteUrl}/newsletter/potvrda?alreadyVerified=true&email=${encodeURIComponent(subscriptionData.email)}`
      return NextResponse.json({ 
        success: true,
        alreadyVerified: true,
        redirectUrl 
      }, {
        status: 200,
        headers: {
          'Location': redirectUrl
        }
      })
    }

    // Proveri da li već postoji neverifikovana subscription (za slučaj da je neko pokušao ponovo)
    const { data: existingPending } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', subscriptionData.email.toLowerCase())
      .eq('is_verified', false)
      .maybeSingle()

    let subscription
    if (existingPending) {
      // Ažuriraj postojeću pending subscription
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          receive_all: subscriptionData.receiveAll,
          subscribed_tags: subscriptionData.receiveAll ? [] : subscriptionData.tags,
          is_verified: true,
          is_active: true,
          verification_token: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPending.id)
        .select()
        .single()

      if (error) throw error
      subscription = data
    } else {
      // Kreiraj novu subscription - TEK SADA se upisuje u bazu
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: subscriptionData.email.toLowerCase(),
          is_active: true,
          receive_all: subscriptionData.receiveAll,
          subscribed_tags: subscriptionData.receiveAll ? [] : subscriptionData.tags,
          verification_token: null,
          is_verified: true,
          user_id: null,
        })
        .select()
        .single()

      if (error) throw error
      subscription = data
    }

    // Pošalji admin notification email tek sada kada je subscription kreiran
    const { sendAdminNotificationEmail } = await import('@/lib/email-admin')
    const adminEmailResult = await sendAdminNotificationEmail(subscriptionData.email.toLowerCase())
    if (adminEmailResult.error) {
      console.error('Error sending admin notification email:', adminEmailResult.error)
      // Ne baci grešku - admin email nije kritičan
    } else {
      console.log('Admin notification email sent successfully')
    }

    // Vrati JSON response sa redirect URL-om
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
    const redirectUrl = `${siteUrl}/newsletter/potvrda?success=true&email=${encodeURIComponent(email)}`
    
    // Vrati JSON sa redirect URL-om - stranica će redirect-ovati
    return NextResponse.json({ 
      success: true, 
      redirectUrl 
    }, {
      status: 200,
      headers: {
        'Location': redirectUrl
      }
    })
  } catch (error: any) {
    console.error('Newsletter verify error:', error)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
    const redirectUrl = `${siteUrl}/newsletter/potvrda?error=${encodeURIComponent(error.message || 'Greška pri verifikaciji')}`
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Greška pri verifikaciji',
      redirectUrl 
    }, {
      status: 400,
      headers: {
        'Location': redirectUrl
      }
    })
  }
}

