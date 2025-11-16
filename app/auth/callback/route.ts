import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
    
    // Poveži subscription sa user_id ako postoji ili kreiraj novu ako ne postoji
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const { data: subscription } = await supabase
          .from('newsletter_subscriptions')
          .select('*')
          .eq('email', user.email.toLowerCase())
          .single()

        if (subscription) {
          // Ako subscription postoji ali nema user_id, ažuriraj ga
          if (!subscription.user_id) {
            await supabase
              .from('newsletter_subscriptions')
              .update({
                user_id: user.id,
                is_verified: true,
                updated_at: new Date().toISOString(),
              })
              .eq('id', subscription.id)
          }
        } else {
          // Ako subscription ne postoji, kreiraj ga
          await supabase
            .from('newsletter_subscriptions')
            .insert({
              email: user.email.toLowerCase(),
              is_active: true,
              receive_all: true,
              subscribed_tags: [],
              is_verified: true,
              user_id: user.id,
            })
        }
      }
    } catch (err) {
      // Ignoriši grešku - nije kritično
      console.error('Error linking/creating subscription:', err)
    }
  }

  // Redirect to user panel
  return NextResponse.redirect(`${origin}/moj-panel`)
}

