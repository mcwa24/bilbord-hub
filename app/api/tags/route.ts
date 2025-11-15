import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Dobij sve jedinstvene tagove iz svih saopštenja
    const { data, error } = await supabase
      .from('pr_releases')
      .select('tags')

    if (error) throw error

    // Ekstraktuj sve tagove u jedan niz
    const allTags = new Set<string>()
    data?.forEach((release: any) => {
      if (release.tags && Array.isArray(release.tags)) {
        release.tags.forEach((tag: string) => {
          if (tag && tag.trim()) {
            allTags.add(tag.trim())
          }
        })
      }
    })

    const response = NextResponse.json({ tags: Array.from(allTags).sort() })
    // Kratak cache za tagove (5 minuta) - ne menjaju se često
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error: any) {
    const errorResponse = NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
    errorResponse.headers.set('Cache-Control', 'no-store')
    return errorResponse
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tag } = await request.json()

    if (!tag || !tag.trim()) {
      return NextResponse.json(
        { error: 'Tag je obavezan' },
        { status: 400 }
      )
    }

    // Tag se automatski čuva kada se koristi u saopštenju
    // Ova funkcija samo vraća success
    return NextResponse.json({ success: true, tag: tag.trim() })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

