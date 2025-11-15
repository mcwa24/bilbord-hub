import { NextResponse } from 'next/server'

interface RSSItem {
  title: string
  link: string
  pubDate: string
  description?: string
  imageUrl?: string
  excerpt?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    const rssUrl = 'https://bilbord.rs/rss/'
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store' // Bez keširanja - uvek fresh podaci
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`)
    }

    const xmlText = await response.text()
    
    // Parsiranje RSS feed-a
    const items: RSSItem[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1]
      
      // Pokušaj da parsiraš title sa CDATA ili bez
      const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/i)
      // Pokušaj da parsiraš link (može biti u <link> tagu ili <guid>)
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>|<guid[^>]*>([\s\S]*?)<\/guid>/i)
      // Pokušaj da parsiraš datum (može biti pubDate ili date)
      const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>|<date>([\s\S]*?)<\/date>/i)
      const descriptionMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/i)
      
      // Parsiraj kategoriju/tag
      const categoryMatch = itemContent.match(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>|<category>([\s\S]*?)<\/category>/i)
      const itemCategory = categoryMatch ? (categoryMatch[1] || categoryMatch[2] || '').trim() : ''
      
      // Ako je tražena kategorija i item nema tu kategoriju, preskoči ga
      if (category && itemCategory.toLowerCase() !== category.toLowerCase()) {
        continue
      }
      
      // Pokušaj da parsiraš sliku iz media:content ili content:encoded
      const mediaContentMatch = itemContent.match(/<media:content[^>]*url=["']([^"']+)["']/i)
      const contentEncodedMatch = itemContent.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i)
      
      let imageUrl = ''
      if (mediaContentMatch) {
        imageUrl = mediaContentMatch[1].trim()
      } else if (contentEncodedMatch) {
        const contentEncoded = contentEncodedMatch[1]
        const imgMatch = contentEncoded.match(/<img[^>]*src=["']([^"']+)["']/i)
        if (imgMatch) {
          imageUrl = imgMatch[1].trim()
        }
      }
      
      // Parsiraj excerpt iz description (prvih ~150 karaktera)
      let excerpt = ''
      if (descriptionMatch) {
        const desc = (descriptionMatch[1] || descriptionMatch[2] || '').replace(/<[^>]*>/g, '').trim()
        excerpt = desc.length > 150 ? desc.substring(0, 150) + '...' : desc
      }

      if (titleMatch && linkMatch) {
        const title = (titleMatch[1] || titleMatch[2] || '').replace(/<[^>]*>/g, '').trim()
        const link = (linkMatch[1] || linkMatch[2] || '').trim()
        const pubDate = pubDateMatch ? (pubDateMatch[1] || pubDateMatch[2] || '').trim() : new Date().toISOString()
        const description = descriptionMatch ? (descriptionMatch[1] || descriptionMatch[2] || '').replace(/<[^>]*>/g, '').trim() : ''

        if (title && link) {
          items.push({
            title,
            link,
            pubDate,
            description,
            imageUrl: imageUrl || undefined,
            excerpt: excerpt || undefined
          })
        }
      }
    }

    // Sortiraj po datumu (najnovije prvo)
    items.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime()
      const dateB = new Date(b.pubDate).getTime()
      return dateB - dateA
    })

    // Vrati sve vesti (bez limita) sa no-cache headers
    const response = NextResponse.json({ items })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: any) {
    console.error('Error fetching RSS feed:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch RSS feed', message: error.message },
      { status: 500 }
    )
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    return errorResponse
  }
}

