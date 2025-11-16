import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Automatski poveži subscription sa user_id kada se korisnik prijavi
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || !user.email) {
      return NextResponse.json(
        { error: 'Morate biti prijavljeni' },
        { status: 401 }
      )
    }

    // Pronađi subscription po email-u i poveži sa user_id
    const { data: subscription, error: findError } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', user.email.toLowerCase())
      .single()

    if (findError && findError.code !== 'PGRST116') {
      throw findError
    }

    if (subscription && !subscription.user_id) {
      // Ažuriraj subscription sa user_id
      const { error: updateError } = await supabase
        .from('newsletter_subscriptions')
        .update({
          user_id: user.id,
          is_verified: true, // Automatski verifikovano ako je ulogovan
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id)

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        message: 'Subscription je povezan sa nalogom',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription već postoji ili nije pronađen',
    })
  } catch (error: any) {
    console.error('Link user subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri povezivanju subscriptiona' },
      { status: 500 }
    )
  }
}

