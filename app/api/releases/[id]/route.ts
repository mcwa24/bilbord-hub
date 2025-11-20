import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('pr_releases')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    const response = NextResponse.json({ release: data })
    // Kratak cache sa stale-while-revalidate za pojedinačna saopštenja
    // Ako se ne menjaju, koristi cache; ako se menjaju, uvek fresh
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Za sada ne proveravamo autentikaciju - samo testno
    const body = await request.json()

    const { data, error } = await supabase
      .from('pr_releases')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ release: data })
  } catch (error: any) {
    console.error('PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri ažuriranju saopštenja' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Za sada ne proveravamo autentikaciju - samo testno
    
    // Prvo učitaj saopštenje da dobijemo material_links za brisanje fajlova
    const { data: release, error: fetchError } = await supabase
      .from('pr_releases')
      .select('material_links')
      .eq('id', params.id)
      .single()

    if (fetchError) throw fetchError

    // Obriši fajlove iz storage-a
    if (release?.material_links && Array.isArray(release.material_links)) {
      for (const link of release.material_links) {
        if (link.url) {
          try {
            // Ekstraktuj path iz Supabase Storage URL-a
            // Format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
            const url = new URL(link.url)
            const pathParts = url.pathname.split('/').filter(Boolean)
            
            // Pronađi indeks 'public' jer je format: /storage/v1/object/public/{bucket}/{path}
            const publicIndex = pathParts.findIndex(part => part === 'public')
            
            if (publicIndex !== -1 && pathParts.length > publicIndex + 1) {
              const bucket = pathParts[publicIndex + 1]
              const filePath = pathParts.slice(publicIndex + 2).join('/')
              
              if (bucket && filePath) {
                const { error: deleteError } = await supabase.storage
                  .from(bucket)
                  .remove([filePath])
                
                if (deleteError) {
                  // Ignoriši greške pri brisanju fajlova
                }
              }
            }
          } catch (error) {
            console.error('Error parsing URL for deletion:', error)
          }
        }
      }
    }

    // Obriši saopštenje iz baze
    const { error } = await supabase
      .from('pr_releases')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri brisanju saopštenja' },
      { status: 500 }
    )
  }
}

