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
    
    let user = null
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      if (!error && authUser) {
        user = authUser
      }
    } catch (error) {
      // Ignore auth errors - user might not be logged in
    }

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

    // Koristi veličine fajlova iz material_links (sačuvane prilikom upload-a)
    // Fallback na HEAD zahtev za stara saopštenja koja nemaju size
    const releasesWithSizes = await Promise.all(
      releases.map(async (release: any) => {
        const zipFiles = release.material_links?.filter(
          (link: any) => link.url?.toLowerCase().endsWith('.zip') || link.label === 'Slike'
        ) || []
        const documents = release.material_links?.filter(
          (link: any) => !link.url?.toLowerCase().endsWith('.zip') && link.label !== 'Slike'
        ) || []

        // Koristi veličine iz material_links ako postoje, inače HEAD zahtev (fallback za stara saopštenja)
        const docSize = documents.length > 0 && documents[0].size 
          ? documents[0].size 
          : documents.length > 0 ? await getFileSize(documents[0].url) : 0
        
        const zipSize = zipFiles.length > 0 && zipFiles[0].size 
          ? zipFiles[0].size 
          : zipFiles.length > 0 ? await getFileSize(zipFiles[0].url) : 0

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

