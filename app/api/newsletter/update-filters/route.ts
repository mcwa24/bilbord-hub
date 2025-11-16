import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .update({
        receive_all: receiveAll === true,
        subscribed_tags: receiveAll ? [] : (tags || []),
        updated_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase())
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Subscription nije pronađen' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Filteri su ažurirani',
      subscription: data,
    })
  } catch (error: any) {
    console.error('Newsletter update filters error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri ažuriranju filtera' },
      { status: 500 }
    )
  }
}

