import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API endpoint za automatsko brisanje PR saopštenja starijih od 60 dana
 * Poziva se automatski putem Vercel cron job-a svakodnevno
 * 
 * Podržava i GET i POST metode:
 * - GET/POST sa Authorization header-om za Vercel cron job
 * - GET bez autorizacije za testiranje (samo u development modu)
 */
export async function GET(request: NextRequest) {
  return handleCleanup(request)
}

export async function POST(request: NextRequest) {
  return handleCleanup(request)
}

async function handleCleanup(request: NextRequest) {
  try {
    // Proveri autorizaciju samo ako je CRON_SECRET podešen
    // U development modu dozvoli testiranje bez autorizacije
    if (process.env.CRON_SECRET) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    } else if (process.env.NODE_ENV === 'production') {
      // U production modu, CRON_SECRET je obavezan
      return NextResponse.json(
        { error: 'CRON_SECRET nije podešen' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    
    // Izračunaj datum pre 60 dana
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const cutoffDate = sixtyDaysAgo.toISOString()

    // Učitaj sva saopštenja koja imaju published_at ili created_at
    // Filtriranje ćemo uraditi u kodu jer Supabase ne podržava kompleksne OR uslove
    const { data: allReleases, error: fetchError } = await supabase
      .from('pr_releases')
      .select('id, material_links, published_at, created_at')

    if (fetchError) {
      throw fetchError
    }

    if (!allReleases || allReleases.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nema saopštenja za brisanje',
        deleted: 0
      })
    }

    // Filtriraj saopštenja koja su starija od 60 dana
    // Koristimo published_at ako postoji, inače created_at
    const oldReleases = allReleases.filter((release) => {
      const dateToCheck = release.published_at || release.created_at
      if (!dateToCheck) return false
      
      const releaseDate = new Date(dateToCheck)
      const cutoff = new Date(cutoffDate)
      return releaseDate < cutoff
    })

    if (oldReleases.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nema saopštenja za brisanje',
        deleted: 0
      })
    }

    let deletedCount = 0
    const errors: string[] = []

    // Obriši svako saopštenje i njegove fajlove
    for (const release of oldReleases) {
      try {
        // Obriši fajlove iz storage-a
        if (release.material_links && Array.isArray(release.material_links)) {
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
                // Ignoriši greške pri parsiranju URL-a
              }
            }
          }
        }

        // Obriši saopštenje iz baze
        const { error: deleteError } = await supabase
          .from('pr_releases')
          .delete()
          .eq('id', release.id)

        if (deleteError) {
          errors.push(`Saopštenje ${release.id}: ${deleteError.message}`)
        } else {
          deletedCount++
        }
      } catch (error: any) {
        errors.push(`Saopštenje ${release.id}: ${error.message || 'Nepoznata greška'}`)
      }
    }

    const result = {
      success: true,
      message: `Obrisano ${deletedCount} od ${oldReleases.length} saopštenja`,
      deleted: deletedCount,
      total: oldReleases.length,
      errors: errors.length > 0 ? errors : undefined
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Greška pri automatskom brisanju saopštenja',
        success: false
      },
      { status: 500 }
    )
  }
}
