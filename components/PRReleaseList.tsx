'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface PRRelease {
  id: string
  title: string
  company_name: string
  published_at: string | null
  created_at: string
  tags?: string[]
  material_links: Array<{
    type: string
    url: string
    label: string
  }>
  thumbnail_url: string | null
  fileSizes?: {
    doc: number
    zip: number
  }
}

interface PRReleaseListProps {
  releases: PRRelease[]
  showAll?: boolean
  onTagClick?: (tag: string) => void
  showEdit?: boolean
  onDelete?: (id: string) => void
  searchQuery?: string
}

function highlightSearchTerm(text: string, searchQuery: string): React.ReactNode {
  if (!searchQuery || !searchQuery.trim()) {
    return text
  }

  const query = searchQuery.trim()
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, index) => 
    regex.test(part) ? (
      <strong key={index} className="font-bold bg-[#f9c344]/30">{part}</strong>
    ) : (
      part
    )
  )
}

function getTagColor(tag: string): string {
  // Generiši hash od taga za konzistentnu boju
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Generiši boju na osnovu hash-a
  const hue = Math.abs(hash % 360)
  const saturation = 60 + (Math.abs(hash) % 20) // 60-80%
  const lightness = 50 + (Math.abs(hash) % 15) // 50-65%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

function formatFileSize(bytes: number, unit: 'KB' | 'MB' = 'KB'): string {
  if (unit === 'MB') {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
  return (bytes / 1024).toFixed(2) + ' KB'
}

export default function PRReleaseList({ releases, showAll = false, onTagClick, showEdit = false, onDelete, searchQuery = '' }: PRReleaseListProps) {
  // Koristi fileSizes iz API-ja ako postoje, inače prazan objekat
  const fileSizes: Record<string, { doc: number; zip: number }> = {}
  releases.forEach((release) => {
    if (release.fileSizes) {
      fileSizes[release.id] = release.fileSizes
    }
  })

  if (releases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nema saopštenja za prikaz.</p>
      </div>
    )
  }

  return (
    <div>
      {releases.map((release) => {
        // Pronađi ZIP fajlove (slike) i dokumente
        const zipFiles = release.material_links.filter(
          (link) => link.url.toLowerCase().endsWith('.zip') || link.label === 'Slike'
        )
        const documents = release.material_links.filter(
          (link) => !link.url.toLowerCase().endsWith('.zip') && link.label !== 'Slike'
        )

        const sizes = fileSizes[release.id] || { doc: 0, zip: 0 }

        const handleDelete = async () => {
          if (!confirm('Da li ste sigurni da želite da obrišete ovo saopštenje? Ova akcija je nepovratna.')) {
            return
          }
          
          if (onDelete) {
            onDelete(release.id)
          } else {
            try {
              const res = await fetch(`/api/releases/${release.id}`, {
                method: 'DELETE',
              })
              
              if (res.ok) {
                toast.success('Saopštenje obrisano!')
                window.location.reload()
              } else {
                const error = await res.json()
                throw new Error(error.error || 'Greška pri brisanju')
              }
            } catch (error: any) {
              toast.error(error.message || 'Greška pri brisanju saopštenja')
            }
          }
        }

        return (
          <div
            key={release.id}
            className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0"
          >
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex-1 min-w-0 w-full">
                {/* Sve u jednom redu: Datum / Tag / Naslov (KB) / Slike (MB) */}
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  {/* Datum */}
                  <span className="text-gray-600 whitespace-nowrap flex-shrink-0">
                    {formatDate(release.published_at || release.created_at)}
                  </span>
                  
                  {/* Tagovi */}
                  {release.tags && release.tags.length > 0 && (
                    <>
                      <span className="text-gray-500 flex-shrink-0">/</span>
                      <div className="flex flex-wrap">
                        {release.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => onTagClick?.(tag)}
                            className="text-xs font-medium hover:opacity-80 hover:underline transition"
                            style={{ color: getTagColor(tag) }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Naslov (KB) */}
                  <span className="text-gray-500 flex-shrink-0">/</span>
                  {documents.length > 0 ? (
                    <div className="inline-flex items-start gap-1 flex-wrap">
                      <a
                        href={documents[0].url}
                        download={documents[0].label || release.title}
                        className="text-[#1d1d1f] hover:underline relative inline-block"
                      >
                        <Download size={14} className="absolute left-0 top-0.5" />
                        <span className="font-semibold break-words block pl-5">
                          {highlightSearchTerm(release.title, searchQuery)}
                        </span>
                      </a>
                      <span className="text-gray-500 font-normal whitespace-nowrap flex-shrink-0">
                        {sizes.doc > 0 ? `(${formatFileSize(sizes.doc, 'KB')})` : '(---)'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#1d1d1f] font-semibold break-words inline-block">
                      {highlightSearchTerm(release.title, searchQuery)}
                    </span>
                  )}
                  
                  {/* Slike (MB) */}
                  {zipFiles.length > 0 && (
                    <>
                      <span className="text-gray-500 flex-shrink-0">/</span>
                      <a
                        href={zipFiles[0].url}
                        download={zipFiles[0].label === 'Slike' ? `slike-${release.id}.zip` : zipFiles[0].label}
                        className="text-[#1d1d1f] hover:underline flex items-center gap-1 whitespace-nowrap flex-shrink-0"
                      >
                        <Download size={14} className="flex-shrink-0" />
                        <span>Slike</span>
                        <span className="text-gray-500 whitespace-nowrap">
                          {sizes.zip > 0 ? `(${formatFileSize(sizes.zip, 'MB')})` : '(---)'}
                        </span>
                      </a>
                    </>
                  )}
                  
                  {/* Edit i Delete ikone */}
                  {showEdit && (
                    <>
                      <Link
                        href={`/dashboard/edit/${release.id}`}
                        className="inline hover:opacity-70 transition cursor-pointer no-underline flex-shrink-0"
                        title="Izmeni saopštenje"
                      >
                        📝
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDelete()
                        }}
                        className="inline hover:opacity-70 transition cursor-pointer bg-transparent border-none p-0 no-underline flex-shrink-0"
                        title="Obriši saopštenje"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>

              {release.thumbnail_url && (
                <div className="flex-shrink-0 w-full md:w-auto">
                  <img
                    src={release.thumbnail_url}
                    alt={release.title}
                    className="w-24 h-24 object-cover rounded-lg mx-auto md:mx-0"
                  />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
