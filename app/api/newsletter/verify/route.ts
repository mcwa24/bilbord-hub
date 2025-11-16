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
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
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

    // PRVO proveri da li već postoji i već je verifikovan
    const { data: existingSubscription } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (existingSubscription && existingSubscription.is_verified && existingSubscription.is_active) {
      // Već je registrovan i verifikovan
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
      const redirectUrl = `${siteUrl}/newsletter/potvrda?alreadyVerified=true&email=${encodeURIComponent(email)}`
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

    // Pronađi subscription po email-u i token-u
    const { data: subscription, error } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('verification_token', token)
      .single()

    if (error || !subscription) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
      const redirectUrl = `${siteUrl}/newsletter/potvrda?error=${encodeURIComponent('Nevažeći token ili email')}`
      return NextResponse.json(
        { 
          error: 'Nevažeći token ili email',
          redirectUrl
        },
        { status: 400 }
      )
    }

    // Verifikuj subscription
    const { error: updateError } = await supabase
      .from('newsletter_subscriptions')
      .update({
        is_verified: true,
        verification_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    if (updateError) throw updateError

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

