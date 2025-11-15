import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FilterParams } from '@/types'

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
    const itemsPerPage = limit || 10
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

    // Filter by tags if provided (tags se filtriraju nakon što dobijemo podatke jer su u JSON polju)
    let releases = data || []
    let filteredCount = count || 0
    
    if (filters.tags && filters.tags.length > 0) {
      // Prvo filtriramo podatke
      releases = releases.filter((release: any) =>
        filters.tags!.some((tag) => release.tags?.includes(tag))
      )
      
      // Zatim dobijamo tačan count za tag filtrirane rezultate
      const allReleasesQuery = supabase
        .from('pr_releases')
        .select('*')
        .not('published_at', 'is', null)
      
      if (filters.search) {
        allReleasesQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }
      if (filters.company) {
        allReleasesQuery.ilike('company_name', `%${filters.company}%`)
      }
      if (filters.industry) {
        allReleasesQuery.ilike('industry', `%${filters.industry}%`)
      }
      if (filters.date_from) {
        allReleasesQuery.gte('published_at', filters.date_from)
      }
      if (filters.date_to) {
        allReleasesQuery.lte('published_at', filters.date_to)
      }
      
      const { data: allData } = await allReleasesQuery
      filteredCount = (allData || []).filter((release: any) =>
        filters.tags!.some((tag) => release.tags?.includes(tag))
      ).length
    }

    const totalPages = Math.ceil((filteredCount || 0) / itemsPerPage)

    // Optimizovano: vraćamo podatke odmah bez učitavanja veličina fajlova
    // Veličine fajlova se mogu učitati na klijentu po potrebi
    const response = NextResponse.json({ 
      releases: releases.map((release: any) => ({
        ...release,
        fileSizes: {
          doc: 0, // Učitava se na klijentu po potrebi
          zip: 0  // Učitava se na klijentu po potrebi
        }
      })),
      pagination: {
        page,
        totalPages,
        totalItems: filteredCount || 0,
        itemsPerPage
      }
    })
    // Dodaj no-cache headere za live podatke
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
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

    const { data, error } = await supabase
      .from('pr_releases')
      .insert({
        ...body,
        created_by: '00000000-0000-0000-0000-000000000000', // Placeholder user ID
        view_count: 0,
        download_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ release: data })
  } catch (error: any) {
    console.error('POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Greška pri kreiranju saopštenja' },
      { status: 500 }
    )
  }
}

