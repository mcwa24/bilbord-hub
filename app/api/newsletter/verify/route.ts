import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token i email su obavezni' },
        { status: 400 }
      )
    }

    // Pronađi subscription po email-u i token-u
    const { data: subscription, error } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('verification_token', token)
      .single()

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'Nevažeći token ili email' },
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

