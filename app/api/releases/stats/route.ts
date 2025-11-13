import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: releases, error } = await supabase
      .from('pr_releases')
      .select('id, title, company_name, view_count, download_count')
      .eq('created_by', user.id)

    if (error) throw error

    const totalReleases = releases?.length || 0
    const totalViews = releases?.reduce((sum, r) => sum + (r.view_count || 0), 0) || 0
    const totalDownloads = releases?.reduce((sum, r) => sum + (r.download_count || 0), 0) || 0

    return NextResponse.json({
      totalReleases,
      totalViews,
      totalDownloads,
      releases: releases || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

