import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { email, tags, receiveAll, token } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Validan email je obavezan' },
        { status: 400 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Token je obavezan za ažuriranje pretplate' },
        { status: 403 }
      )
    }

    // Proveri token pre ažuriranja
    const { data: existing, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('verification_token', token)
      .single()

    if (checkError || !existing) {
      return NextResponse.json(
        { error: 'Nevažeći token ili email' },
        { status: 403 }
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
      .eq('verification_token', token)
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
    return NextResponse.json(
      { error: error.message || 'Greška pri ažuriranju filtera' },
      { status: 500 }
    )
  }
}

