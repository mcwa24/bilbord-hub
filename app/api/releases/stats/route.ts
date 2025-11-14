import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Vrati sva saopštenja (frontend je već zaštićen admin proverom)
    const { data: releases, error } = await supabase
      .from('pr_releases')
      .select('id, title, company_name, view_count, download_count')
      .order('download_count', { ascending: false })

    if (error) throw error

    const totalReleases = releases?.length || 0
    const totalViews = releases?.reduce((sum, r) => sum + (r.view_count || 0), 0) || 0
    const totalDownloads = releases?.reduce((sum, r) => sum + (r.download_count || 0), 0) || 0

    // Najpopularnija saopštenja (top 10 po download count-u)
    const topDownloads = releases
      ?.filter((r) => (r.download_count || 0) > 0)
      .slice(0, 10) || []

    // Najpopularnija saopštenja po pregledima (top 10)
    const topViews = releases
      ?.filter((r) => (r.view_count || 0) > 0)
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 10) || []

    return NextResponse.json({
      totalReleases,
      totalViews,
      totalDownloads,
      releases: releases || [],
      topDownloads,
      topViews,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

