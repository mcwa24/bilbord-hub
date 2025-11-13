import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Increment view count
    const { data: release } = await supabase
      .from('pr_releases')
      .select('view_count')
      .eq('id', params.id)
      .single()

    if (release) {
      await supabase
        .from('pr_releases')
        .update({ view_count: (release.view_count || 0) + 1 })
        .eq('id', params.id)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

