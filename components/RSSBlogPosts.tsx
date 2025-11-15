'use client'

import Image from 'next/image'
import Link from 'next/link'

interface RSSItem {
  title: string
  link: string
  pubDate: string
  description?: string
  imageUrl?: string
  excerpt?: string
}

interface RSSBlogPostsProps {
  items: RSSItem[]
  showTitle?: boolean
}

export default function RSSBlogPosts({ items, showTitle = true }: RSSBlogPostsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            {/* Slika */}
            {item.imageUrl ? (
              <div className="relative w-full h-48 overflow-hidden rounded-t-3xl">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-3xl"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={index < 6}
                  loading={index < 6 ? "eager" : "lazy"}
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-3xl">
                <span className="text-gray-400 text-sm">Nema slike</span>
              </div>
            )}
            
            {/* Naslov */}
            {showTitle && (
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2 line-clamp-2 group-hover:text-[#f9c344] transition-colors text-left">
                  {item.title}
                </h3>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

