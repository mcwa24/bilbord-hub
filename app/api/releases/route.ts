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

    let query = supabase
      .from('pr_releases')
      .select('*')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })

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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('pr_releases')
      .insert({
        ...body,
        created_by: user.id,
        view_count: 0,
        download_count: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ release: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

