'use client'

import { formatDate } from '@/lib/utils'
import { Rss } from 'lucide-react'

interface RSSItem {
  title: string
  link: string
  pubDate: string
  description?: string
  imageUrl?: string
  excerpt?: string
}

interface RSSFeedListProps {
  items: RSSItem[]
}

export default function RSSFeedList({ items }: RSSFeedListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nema vesti za prikaz.</p>
      </div>
    )
  }

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={index}
          className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0"
        >
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex-1 min-w-0 w-full">
              {/* Desktop: Excel-like tabela */}
              <div className="hidden md:grid grid-cols-[auto_1fr] gap-x-0 gap-y-2 items-center text-xs">
                {/* Datum */}
                <div className="text-gray-600 whitespace-nowrap pr-3">
                  {formatDate(item.pubDate)}
                </div>
                
                {/* Naslov sa linkom */}
                <div className="min-w-0 overflow-hidden">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1d1d1f] hover:underline font-semibold truncate block flex items-center gap-1"
                    title={item.title}
                  >
                    <Rss size={14} className="flex-shrink-0 text-orange-500" />
                    {item.title}
                  </a>
                </div>
              </div>
              
              {/* Mobile: Više redova */}
              <div className="md:hidden flex flex-col gap-2 text-xs">
                {/* Prvi red: Datum */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 whitespace-nowrap">
                    {formatDate(item.pubDate)}
                  </span>
                </div>
                
                {/* Drugi red: Naslov sa linkom */}
                <div className="min-w-0 w-full">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1d1d1f] hover:underline font-semibold break-words block flex items-start gap-1"
                    title={item.title}
                  >
                    <Rss size={14} className="flex-shrink-0 text-orange-500 mt-0.5" />
                    {item.title}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

