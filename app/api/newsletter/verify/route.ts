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
    } catch (decodeError: any) {
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
      if (parts.length < 2) {
        throw new Error('Invalid token format - expected format: base64payload.randomhex')
      }
      const encodedPayload = parts[0]
      
      // Konvertuj URL-safe base64 nazad u standardni base64
      const standardBase64 = encodedPayload
        .replace(/-/g, '+')
        .replace(/_/g, '/')
      
      // Dodaj padding ako je potrebno
      const padding = (4 - standardBase64.length % 4) % 4
      const paddedPayload = standardBase64 + '='.repeat(padding)
      
      const decodedPayload = Buffer.from(paddedPayload, 'base64').toString('utf-8')
      
      subscriptionData = JSON.parse(decodedPayload)
    } catch (decodeError: any) {
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
        if (tokenEmail !== urlEmail) {
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
      // Ne baci grešku - admin email nije kritičan
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

