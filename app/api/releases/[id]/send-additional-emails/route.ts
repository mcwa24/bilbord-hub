import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendNewsletterEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { additional_emails } = await request.json()

    if (!additional_emails || !Array.isArray(additional_emails) || additional_emails.length === 0) {
      return NextResponse.json(
        { error: 'additional_emails je obavezan i mora biti niz' },
        { status: 400 }
      )
    }

    // Učitaj saopštenje
    const { data: release, error: releaseError } = await supabase
      .from('pr_releases')
      .select('*')
      .eq('id', params.id)
      .single()

    if (releaseError || !release) {
      return NextResponse.json(
        { error: 'Saopštenje nije pronađeno' },
        { status: 404 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
    const downloadUrl = `${siteUrl}/download/${release.id}`

    // Pošalji emailove dodatnim primaocima
    const results = await Promise.all(
      additional_emails.map(async (email: string) => {
        try {
          const result = await sendNewsletterEmail(
            email,
            {
              id: release.id,
              title: release.title,
              description: release.description || release.title,
              content: release.content || undefined,
              tags: release.tags || [],
              published_at: release.published_at,
              downloadUrl,
            },
            undefined,
            true
          )
          return { email, success: !result.error, error: result.error }
        } catch (err: any) {
          return { email, success: false, error: err.message }
        }
      })
    )

    const successCount = results.filter(r => r.success).length
    const errors = results.filter(r => !r.success).map(r => `${r.email}: ${r.error}`)

    return NextResponse.json({
      success: true,
      message: `Emailovi poslati: ${successCount}/${additional_emails.length}`,
      sent: successCount,
      total: additional_emails.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Greška pri slanju dodatnih emailova' },
      { status: 500 }
    )
  }
}

