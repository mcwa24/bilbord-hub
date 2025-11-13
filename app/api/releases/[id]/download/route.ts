import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Increment download count
    const { data: release } = await supabase
      .from('pr_releases')
      .select('download_count')
      .eq('id', params.id)
      .single()

    if (release) {
      await supabase
        .from('pr_releases')
        .update({ download_count: (release.download_count || 0) + 1 })
        .eq('id', params.id)

      // Log download
      const body = await request.json().catch(() => ({}))
      await supabase
        .from('download_stats')
        .insert({
          release_id: params.id,
          media_name: body.media_name || null,
          media_email: body.media_email || null,
        })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

