import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendManagementLinkEmail } from '@/lib/email-management'
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

    // Proveri da li postoji subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (fetchError || !subscription) {
      // Ne otkrivaj da li email postoji ili ne (security best practice)
      return NextResponse.json({
        success: true,
        message: 'Ako email postoji, poslat će vam se link za upravljanje.',
      })
    }

    // Generiši management token
    const managementToken = crypto.randomBytes(32).toString('hex')

    // Sačuvaj token u bazi (koristimo verification_token polje za management token)
    const { error: updateError } = await supabase
      .from('newsletter_subscriptions')
      .update({
        verification_token: managementToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    if (updateError) throw updateError

    // Pošalji email sa linkom
    const emailResult = await sendManagementLinkEmail(
      email.toLowerCase(),
      managementToken
    )

    if (emailResult.error) {
      // Ne baci grešku - ne otkrivaj da li email postoji
    }

    return NextResponse.json({
      success: true,
      message: 'Ako email postoji, poslat će vam se link za upravljanje.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Greška pri slanju linka za upravljanje' },
      { status: 500 }
    )
  }
}

