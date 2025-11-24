import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FilterParams } from '@/types'
import { sendNewsletterEmail } from '@/lib/email'

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
    const searchParams = request.nextUrl.searchParams

    const filters: FilterParams = {
      search: searchParams.get('search') || undefined,
      company: searchParams.get('company') || undefined,
      industry: searchParams.get('industry') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
    }


    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const itemsPerPage = limit || 20 // Default 20 po stranici
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    // Prvo dobijamo ukupan broj za paginaciju
    let countQuery = supabase
      .from('pr_releases')
      .select('*', { count: 'exact', head: true })
      .not('published_at', 'is', null)

    if (filters.search) {
      countQuery = countQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
    }

    if (filters.company) {
      countQuery = countQuery.ilike('company_name', `%${filters.company}%`)
    }

    if (filters.industry) {
      countQuery = countQuery.ilike('industry', `%${filters.industry}%`)
    }

    if (filters.date_from) {
      countQuery = countQuery.gte('published_at', filters.date_from)
    }

    if (filters.date_to) {
      countQuery = countQuery.lte('published_at', filters.date_to)
    }

    // Ako ima tag filter, koristimo Supabase contains direktno sa paginacijom
    if (filters.tags && filters.tags.length > 0) {
      
      // Prvo dobijamo ukupan broj za paginaciju
      let countQuery = supabase
        .from('pr_releases')
        .select('*', { count: 'exact', head: true })
        .not('published_at', 'is', null)

      // Za svaki tag koristimo contains - filter za TEXT[] polje
      // Ako ima više tagova, koristimo OR logiku
      // Koristimo PostgREST sintaksu `cs` (contains) za array polje
      if (filters.tags.length === 1) {
        const tag = filters.tags[0].trim()
        countQuery = countQuery.or(`tags.cs.{${tag}}`)
      } else {
        // Za više tagova, koristimo OR logiku sa PostgREST sintaksom
        const orConditions = filters.tags.map(tag => `tags.cs.{${tag.trim()}}`).join(',')
        countQuery = countQuery.or(orConditions)
      }

      if (filters.search) {
        countQuery = countQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }

      if (filters.company) {
        countQuery = countQuery.ilike('company_name', `%${filters.company}%`)
      }

      if (filters.industry) {
        countQuery = countQuery.ilike('industry', `%${filters.industry}%`)
      }

      if (filters.date_from) {
        countQuery = countQuery.gte('published_at', filters.date_from)
      }

      if (filters.date_to) {
        countQuery = countQuery.lte('published_at', filters.date_to)
      }

      const { count } = await countQuery

      // Sada uzimamo saopštenja sa paginacijom
      let query = supabase
        .from('pr_releases')
        .select('*')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .range(from, to)

      // Za svaki tag koristimo contains
      // Ako ima više tagova, koristimo OR logiku
      // Koristimo PostgREST sintaksu `cs` (contains) za array polje
      if (filters.tags.length === 1) {
        const tag = filters.tags[0].trim()
        query = query.or(`tags.cs.{${tag}}`)
      } else {
        // Za više tagova, koristimo OR logiku sa PostgREST sintaksom
        const orConditions = filters.tags.map(tag => `tags.cs.{${tag.trim()}}`).join(',')
        query = query.or(orConditions)
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }

      if (filters.company) {
        query = query.ilike('company_name', `%${filters.company}%`)
      }

      if (filters.industry) {
        query = query.ilike('industry', `%${filters.industry}%`)
      }

      if (filters.date_from) {
        query = query.gte('published_at', filters.date_from)
      }

      if (filters.date_to) {
        query = query.lte('published_at', filters.date_to)
      }

      const { data, error } = await query
      
      if (error) {
        throw error
      }

      const filteredCount = count || 0
      const releases = data || []
      const totalPages = Math.ceil(filteredCount / itemsPerPage)

      // Optimizovano: koristimo veličine fajlova iz material_links (sačuvane prilikom upload-a)
      // Ne blokiramo odgovor HEAD zahtevima - koristimo samo sačuvane veličine za brže učitavanje
      const releasesWithSizes = releases.map((release: any) => {
        const zipFiles = release.material_links?.filter(
          (link: any) => link.url?.toLowerCase().endsWith('.zip') || link.label === 'Slike'
        ) || []
        const documents = release.material_links?.filter(
          (link: any) => !link.url?.toLowerCase().endsWith('.zip') && link.label !== 'Slike'
        ) || []

        // Koristi samo sačuvane veličine - ne čekaj HEAD zahteve (brže učitavanje)
        const docSize = documents.length > 0 && documents[0].size 
          ? documents[0].size 
          : 0
        
        const zipSize = zipFiles.length > 0 && zipFiles[0].size 
          ? zipFiles[0].size 
          : 0

        return {
          ...release,
          fileSizes: {
            doc: docSize,
            zip: zipSize
          }
        }
      })

      const response = NextResponse.json({ 
        releases: releasesWithSizes,
        pagination: {
          page,
          totalPages,
          totalItems: filteredCount,
          itemsPerPage
        }
      })
      // Dodaj cache headere za brže učitavanje - cache 30 sekundi
      response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
      return response
    }

    // Ako nema tag filtera, koristimo standardnu paginaciju u bazi
    const { count } = await countQuery

    let query = supabase
      .from('pr_releases')
      .select('*')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .range(from, to)

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
    }

    if (filters.company) {
      query = query.ilike('company_name', `%${filters.company}%`)
    }

    if (filters.industry) {
      query = query.ilike('industry', `%${filters.industry}%`)
    }

    if (filters.date_from) {
      query = query.gte('published_at', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('published_at', filters.date_to)
    }

    const { data, error } = await query

    if (error) throw error

    let releases = data || []
    let filteredCount = count || 0

    const totalPages = Math.ceil((filteredCount || 0) / itemsPerPage)

    // Optimizovano: koristimo veličine fajlova iz material_links (sačuvane prilikom upload-a)
    // Ne blokiramo odgovor HEAD zahtevima - koristimo samo sačuvane veličine za brže učitavanje
    const releasesWithSizes = releases.map((release: any) => {
      const zipFiles = release.material_links?.filter(
        (link: any) => link.url?.toLowerCase().endsWith('.zip') || link.label === 'Slike'
      ) || []
      const documents = release.material_links?.filter(
        (link: any) => !link.url?.toLowerCase().endsWith('.zip') && link.label !== 'Slike'
      ) || []

      // Koristi samo sačuvane veličine - ne čekaj HEAD zahteve (brže učitavanje)
      const docSize = documents.length > 0 && documents[0].size 
        ? documents[0].size 
        : 0
      
      const zipSize = zipFiles.length > 0 && zipFiles[0].size 
        ? zipFiles[0].size 
        : 0

      return {
        ...release,
        fileSizes: {
          doc: docSize,
          zip: zipSize
        }
      }
    })

    const response = NextResponse.json({ 
      releases: releasesWithSizes,
      pagination: {
        page,
        totalPages,
        totalItems: filteredCount || 0,
        itemsPerPage
      }
    })
    // Dodaj cache headere za brže učitavanje - cache 30 sekundi
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    return response
  } catch (error: any) {
    const errorResponse = NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    return errorResponse
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Za sada ne proveravamo autentikaciju - samo testno
    const body = await request.json()

    // Proveri da li tabela postoji, ako ne, kreiraj je
    const { error: tableError } = await supabase
      .from('pr_releases')
      .select('id')
      .limit(1)

    if (tableError && tableError.message.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Tabela pr_releases ne postoji. Pokreni SQL schema iz supabase-schema.sql u Supabase SQL Editor-u.' },
        { status: 500 }
      )
    }

    // Izdvoji additional_emails iz body objekta jer ne treba da se čuva u bazi
    const { additional_emails, ...releaseData } = body

    const { data, error } = await supabase
      .from('pr_releases')
      .insert({
        ...releaseData,
        created_by: '00000000-0000-0000-0000-000000000000', // Placeholder user ID
        view_count: 0,
        download_count: 0,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Pošalji newsletter emailove u pozadini (ne čekaj)
    if (data && data.published_at) {
      // Pozovi newsletter send endpoint u pozadini (za sve pretplatnike)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/newsletter/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseId: data.id }),
      }).catch(() => {
        // Ne baci grešku - newsletter slanje ne sme da blokira kreiranje saopštenja
      })

      // Pošalji emailove dodatnim primaocima ako su navedeni
      const additionalEmails = additional_emails || []
      if (additionalEmails.length > 0) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs'
        const downloadUrl = `${siteUrl}/download/${data.id}`

        // Pošalji emailove u pozadini (ne čekaj)
        Promise.all(
          additionalEmails.map((email: string) =>
            sendNewsletterEmail(email, {
              id: data.id,
              title: data.title,
              description: data.description,
              content: data.content,
              tags: data.tags || [],
              published_at: data.published_at,
              downloadUrl,
            }, undefined, true).catch(() => {
              // Ignoriši greške pri slanju dodatnih emailova
            })
          )
        ).catch(() => {
          // Ignoriši greške pri slanju dodatnih emailova
        })
      }
    }

    return NextResponse.json({ release: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Greška pri kreiranju saopštenja' },
      { status: 500 }
    )
  }
}

