import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendNewsletterEmail } from '@/lib/email'

// Funkcija za validaciju email adrese
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmed)
}

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

    // Filtriraj i validiraj email adrese
    const validEmails = additional_emails
      .map((email: string) => (typeof email === 'string' ? email.trim().toLowerCase() : ''))
      .filter((email: string) => email && isValidEmail(email))
    
    // Ukloni duplikate
    const uniqueEmails = [...new Set(validEmails)]

    if (uniqueEmails.length === 0) {
      return NextResponse.json(
        { error: 'Nema validnih email adresa za slanje' },
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

    // Pošalji emailove dodatnim primaocima sa malim delay-om između slanja da se izbegne rate limiting
    const results = []
    for (let i = 0; i < uniqueEmails.length; i++) {
      const email = uniqueEmails[i]
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
        
        if (result.error) {
          results.push({ email, success: false, error: result.error })
        } else {
          results.push({ email, success: true, error: undefined })
        }
      } catch (err: any) {
        results.push({ email, success: false, error: err.message || 'Nepoznata greška' })
      }
      
      // Dodaj mali delay između slanja emailova (100ms) da se izbegne rate limiting
      if (i < uniqueEmails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    const successCount = results.filter(r => r.success).length
    const failedResults = results.filter(r => !r.success)
    const errors = failedResults.map(r => `${r.email}: ${r.error || 'Nepoznata greška'}`)

    return NextResponse.json({
      success: true,
      message: `Emailovi poslati: ${successCount}/${uniqueEmails.length}`,
      sent: successCount,
      total: uniqueEmails.length,
      errors: errors.length > 0 ? errors : undefined,
      invalidEmails: additional_emails.length - validEmails.length > 0 
        ? additional_emails.filter((e: string) => !isValidEmail(e || ''))
        : undefined,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Greška pri slanju dodatnih emailova' },
      { status: 500 }
    )
  }
}

