import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FilterParams } from '@/types'

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

    let query = supabase
      .from('pr_releases')
      .select('*')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
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

    if (error) throw error

    // Filter by tags if provided
    let releases = data || []
    if (filters.tags && filters.tags.length > 0) {
      releases = releases.filter((release: any) =>
        filters.tags!.some((tag) => release.tags?.includes(tag))
      )
    }

    return NextResponse.json({ releases })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
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

