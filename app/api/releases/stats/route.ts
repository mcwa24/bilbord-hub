import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getFileSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentLength = response.headers.get('content-length')
    return contentLength ? parseInt(contentLength) : 0
  } catch {
    return 0
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Vrati sva saopštenja sa material_links (frontend je već zaštićen admin proverom)
    const { data: releases, error } = await supabase
      .from('pr_releases')
      .select('id, title, company_name, view_count, download_count, material_links')
      .order('download_count', { ascending: false })

    if (error) throw error

    const totalReleases = releases?.length || 0
    const totalViews = releases?.reduce((sum: number, r: any) => sum + (r.view_count || 0), 0) || 0
    const totalDownloads = releases?.reduce((sum: number, r: any) => sum + (r.download_count || 0), 0) || 0

    // Izračunaj ukupnu veličinu svih fajlova
    let totalStorageBytes = 0
    if (releases && releases.length > 0) {
      const fileSizePromises = releases.map(async (release: any) => {
        const materialLinks = release.material_links || []
        let releaseSize = 0

        for (const link of materialLinks) {
          if (link.url) {
            try {
              const size = await getFileSize(link.url)
              releaseSize += size
            } catch {
              // Ignoriši greške
            }
          }
        }

        return releaseSize
      })

      const sizes = await Promise.all(fileSizePromises)
      totalStorageBytes = sizes.reduce((sum, size) => sum + size, 0)
    }

    // Najpopularnija saopštenja (top 10 po download count-u)
    const topDownloads = releases
      ?.filter((r: any) => (r.download_count || 0) > 0)
      .slice(0, 10) || []

    // Najpopularnija saopštenja po pregledima (top 10)
    const topViews = releases
      ?.filter((r: any) => (r.view_count || 0) > 0)
      .sort((a: any, b: any) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 10) || []

    // Učitaj broj registrovanih korisnika (newsletter subscriptions)
    // Koristimo admin client da bi zaobišli RLS policies
    let totalUsers = 0
    try {
      const adminSupabase = createAdminClient()
      // Uzmi sve subscriptions i filtriraj na frontendu
      const { data: allSubs, error: allSubsError } = await adminSupabase
        .from('newsletter_subscriptions')
        .select('*')
      
      if (allSubsError) {
      } else if (allSubs) {
        // Filtriraj verifikovane i aktivne subscriptions
        totalUsers = allSubs.filter((sub: any) => 
          sub.is_verified === true && sub.is_active === true
        ).length
      }
    } catch (error: any) {
      // Fallback: probaj sa običnim client-om
      try {
        const { data: fallbackSubs, error: fallbackError } = await supabase
          .from('newsletter_subscriptions')
          .select('*')
        
        if (!fallbackError && fallbackSubs) {
          totalUsers = fallbackSubs.filter((sub: any) => 
            sub.is_verified === true && sub.is_active === true
          ).length
        }
      } catch (fallbackErr) {
      }
    }

    return NextResponse.json({
      totalReleases,
      totalViews,
      totalDownloads,
      totalStorageBytes,
      totalUsers: totalUsers || 0,
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

