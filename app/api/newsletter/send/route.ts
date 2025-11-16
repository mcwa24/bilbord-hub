import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendNewsletterEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { releaseId } = await request.json()

    if (!releaseId) {
      return NextResponse.json(
        { error: 'releaseId je obavezan' },
        { status: 400 }
      )
    }

    // Učitaj saopštenje
    const { data: release, error: releaseError } = await supabase
      .from('pr_releases')
      .select('*')
      .eq('id', releaseId)
      .single()

    if (releaseError || !release) {
      return NextResponse.json(
        { error: 'Saopštenje nije pronađeno' },
        { status: 404 }
      )
    }

    // Učitaj sve aktivne i verifikovane subscriptions (bez filtriranja po tagovima)
    const { data: subscriptions, error: subsError } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)

    if (subsError) throw subsError

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nema aktivnih subscriptions',
        sent: 0,
      })
    }

    // Pošalji emailove svima (bez filtriranja po tagovima)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
    const downloadUrl = `${siteUrl}/download/${release.id}`

    let sentCount = 0
    const errors: string[] = []

    for (const subscription of subscriptions) {
      // Generiši unsubscribe token ako ne postoji
      let unsubscribeToken = subscription.verification_token
      if (!unsubscribeToken) {
        // Ako nema token, generiši novi za unsubscribe
        const crypto = await import('crypto')
        unsubscribeToken = crypto.randomBytes(32).toString('hex')
        await supabase
          .from('newsletter_subscriptions')
          .update({ verification_token: unsubscribeToken })
          .eq('id', subscription.id)
      }

      const result = await sendNewsletterEmail(
        subscription.email,
        {
          id: release.id,
          title: release.title,
          description: release.description || release.title,
          tags: release.tags || [],
          published_at: release.published_at,
          downloadUrl,
        },
        unsubscribeToken
      )

      if (result.error) {
        errors.push(`${subscription.email}: ${result.error}`)
      } else {
        sentCount++
        // Ažuriraj last_email_sent_at
        await supabase
          .from('newsletter_subscriptions')
          .update({ last_email_sent_at: new Date().toISOString() })
          .eq('id', subscription.id)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Emailovi poslati: ${sentCount}/${subscriptions.length}`,
      sent: sentCount,
      total: subscriptions.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri slanju newslettera' },
      { status: 500 }
    )
  }
}
