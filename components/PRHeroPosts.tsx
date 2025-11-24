'use client'

import Image from 'next/image'
import { useState } from 'react'

interface PRRelease {
  id: string
  title: string
  thumbnail_url: string | null
  material_links: Array<{
    type: string
    url: string
    label: string
  }>
  alt_texts?: Array<{
    image_url: string
    alt_text: string
  }>
}

interface PRHeroPostsProps {
  items: PRRelease[]
}

export default function PRHeroPosts({ items }: PRHeroPostsProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      // Mala pauza između download-ovanja
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      throw error
    }
  }

  const handleDownload = async (release: PRRelease) => {
    if (downloading === release.id) return
    
    setDownloading(release.id)
    
    try {
      // Pronađi PDF dokument
      const pdfLink = release.material_links?.find(
        (link) => link.url.toLowerCase().endsWith('.pdf') && link.label !== 'Slike'
      )
      
      // Download thumbnail slike ako postoji
      const imageUrl = release.thumbnail_url || (release.alt_texts && release.alt_texts.length > 0 ? release.alt_texts[0].image_url : null)
      if (imageUrl) {
        const imageExt = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1] || 'jpg'
        await downloadFile(
          imageUrl,
          `${release.title.replace(/[^a-z0-9]/gi, '_')}_thumbnail.${imageExt}`
        )
      }
      
      // Download PDF dokumenta ako postoji
      if (pdfLink?.url) {
        const pdfFilename = pdfLink.label || `${release.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
        await downloadFile(pdfLink.url, pdfFilename)
      }
      
      // Track download
      try {
        await fetch(`/api/releases/${release.id}/download`, { method: 'POST' })
      } catch (error) {
        // Error tracking download
      }
    } catch (error) {
      // Error downloading files
    } finally {
      setDownloading(null)
    }
  }

  if (items.length === 0) {
    return null
  }

  const getImageUrl = (item: PRRelease): string | null => {
    // Prvo proveri thumbnail_url
    if (item.thumbnail_url) {
      return item.thumbnail_url
    }
    // Ako nema thumbnail_url, koristi prvu sliku iz alt_texts
    if (item.alt_texts && item.alt_texts.length > 0 && item.alt_texts[0].image_url) {
      return item.alt_texts[0].image_url
    }
    return null
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {items.slice(0, 6).map((item) => {
        const imageUrl = getImageUrl(item)
        return (
          <div
            key={item.id}
            onClick={() => handleDownload(item)}
            className="group cursor-pointer"
          >
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              {/* Slika */}
              {imageUrl ? (
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  {downloading === item.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-sm">Preuzimanje...</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Nema slike</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

