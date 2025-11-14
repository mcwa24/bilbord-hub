import { NextResponse } from 'next/server'

interface RSSItem {
  title: string
  link: string
  pubDate: string
  description?: string
}

export async function GET() {
  try {
    const rssUrl = 'https://bilbord.rs/rss/'
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 300 } // Cache za 5 minuta
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
            description
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

    // Vrati prvih 20 vesti
    return NextResponse.json({ items: items.slice(0, 20) })
  } catch (error: any) {
    console.error('Error fetching RSS feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch RSS feed', message: error.message },
      { status: 500 }
    )
  }
}

