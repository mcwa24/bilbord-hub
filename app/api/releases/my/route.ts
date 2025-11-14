import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('pr_releases')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const releases = data || []

    // Učitaj veličine fajlova paralelno za sve releases
    const releasesWithSizes = await Promise.all(
      releases.map(async (release: any) => {
        const zipFiles = release.material_links?.filter(
          (link: any) => link.url?.toLowerCase().endsWith('.zip') || link.label === 'Slike'
        ) || []
        const documents = release.material_links?.filter(
          (link: any) => !link.url?.toLowerCase().endsWith('.zip') && link.label !== 'Slike'
        ) || []

        const [docSize, zipSize] = await Promise.all([
          documents.length > 0 ? getFileSize(documents[0].url) : Promise.resolve(0),
          zipFiles.length > 0 ? getFileSize(zipFiles[0].url) : Promise.resolve(0),
        ])

        return {
          ...release,
          fileSizes: {
            doc: docSize,
            zip: zipSize
          }
        }
      })
    )

    return NextResponse.json({ releases: releasesWithSizes })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

