'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Download, Share2 } from 'lucide-react'
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
  
  // Lista različitih boja za tagove
  const colors = [
    'text-purple-600',
    'text-blue-600',
    'text-green-600',
    'text-red-600',
    'text-orange-600',
    'text-pink-600',
    'text-indigo-600',
    'text-teal-600',
    'text-cyan-600',
    'text-amber-600',
    'text-emerald-600',
    'text-violet-600',
    'text-rose-600',
    'text-fuchsia-600',
    'text-sky-600',
  ]
  
  // Koristi hash da odabere boju
  const index = Math.abs(hash) % colors.length
  return colors[index]
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

        const handleShare = async () => {
          const shareUrl = `${window.location.origin}/download/${release.id}`
          try {
            await navigator.clipboard.writeText(shareUrl)
            toast.success('Link kopiran u clipboard!')
          } catch (error) {
            toast.error('Greška pri kopiranju linka')
          }
        }

        return (
          <div
            key={release.id}
            className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0"
          >
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex-1 min-w-0 w-full">
                {/* Desktop: Excel-like tabela | Mobile: Više redova */}
                <div className="hidden md:grid grid-cols-[auto_60px_1fr_120px_auto] gap-x-0 gap-y-2 items-center text-xs">
                  {/* Datum */}
                  <div className="text-gray-600 whitespace-nowrap pr-3">
                    {formatDate(release.published_at || release.created_at)}
                  </div>
                  
                  {/* Tagovi */}
                  <div className="overflow-hidden px-0">
                    {release.tags && release.tags.length > 0 ? (
                      release.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => onTagClick?.(tag)}
                          className={`text-xs font-medium hover:opacity-80 hover:underline transition text-left w-full overflow-hidden text-ellipsis whitespace-nowrap p-0 ${getTagColor(tag)}`}
                          title={tag}
                        >
                          {tag}
                        </button>
                      ))
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  
                  {/* Naslov (KB) */}
                  <div className="min-w-0 overflow-hidden">
                    {documents.length > 0 ? (
                      <a
                        href={documents[0].url}
                        download={documents[0].label || release.title}
                        className="text-[#1d1d1f] hover:underline inline-flex items-center gap-1 min-w-0 flex-1 overflow-hidden"
                      >
                        <Download size={14} className="flex-shrink-0" />
                        <span className="font-semibold truncate">
                          {highlightSearchTerm(release.title, searchQuery)}
                        </span>
                        <span className="text-gray-500 font-normal whitespace-nowrap flex-shrink-0">
                          {sizes.doc > 0 ? `(${formatFileSize(sizes.doc, 'KB')})` : '(---)'}
                        </span>
                      </a>
                    ) : (
                      <span className="text-[#1d1d1f] font-semibold truncate block" title={release.title}>
                        {highlightSearchTerm(release.title, searchQuery)}
                      </span>
                    )}
                  </div>
                  
                  {/* Slike (MB) */}
                  <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {zipFiles.length > 0 ? (
                      <a
                        href={zipFiles[0].url}
                        download={zipFiles[0].label === 'Slike' ? `slike-${release.id}.zip` : zipFiles[0].label}
                        className="text-[#1d1d1f] hover:underline inline-flex items-center gap-1"
                      >
                        <Download size={14} className="flex-shrink-0" />
                        <span>Slike</span>
                        <span className="text-gray-500">
                          {sizes.zip > 0 ? `(${formatFileSize(sizes.zip, 'MB')})` : '(---)'}
                        </span>
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  
                  {/* Share, Edit i Delete ikone - Desktop */}
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleShare()
                      }}
                      className="inline hover:opacity-80 transition cursor-pointer bg-[#f9c344] rounded-full p-2 border-none no-underline flex-shrink-0 flex items-center justify-center"
                      title="Kopiraj link za deljenje"
                    >
                      <Share2 size={16} className="text-[#1d1d1f]" />
                    </button>
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
                
                {/* Mobile: Više redova */}
                <div className="md:hidden flex flex-col gap-2 text-xs">
                  {/* Prvi red: Datum i Tag */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 whitespace-nowrap">
                      {formatDate(release.published_at || release.created_at)}
                    </span>
                    {release.tags && release.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {release.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => onTagClick?.(tag)}
                            className={`text-xs font-medium hover:opacity-80 hover:underline transition ${getTagColor(tag)}`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Drugi red: Naslov (KB) */}
                  <div className="min-w-0 w-full">
                    {documents.length > 0 ? (
                      <a
                        href={documents[0].url}
                        download={documents[0].label || release.title}
                        className="text-[#1d1d1f] hover:underline inline-flex items-start gap-1 min-w-0 flex-1 break-words"
                      >
                        <Download size={14} className="flex-shrink-0 mt-0.5" />
                        <span className="font-semibold">
                          {highlightSearchTerm(release.title, searchQuery)}
                        </span>
                        <span className="text-gray-500 font-normal whitespace-nowrap flex-shrink-0">
                          {sizes.doc > 0 ? `(${formatFileSize(sizes.doc, 'KB')})` : '(---)'}
                        </span>
                      </a>
                    ) : (
                      <span className="text-[#1d1d1f] font-semibold break-words block" title={release.title}>
                        {highlightSearchTerm(release.title, searchQuery)}
                      </span>
                    )}
                  </div>
                  
                  {/* Treći red: Slike (MB) */}
                  {zipFiles.length > 0 && (
                    <div className="whitespace-nowrap">
                      <a
                        href={zipFiles[0].url}
                        download={zipFiles[0].label === 'Slike' ? `slike-${release.id}.zip` : zipFiles[0].label}
                        className="text-[#1d1d1f] hover:underline inline-flex items-center gap-1"
                      >
                        <Download size={14} className="flex-shrink-0" />
                        <span>Slike</span>
                        <span className="text-gray-500">
                          {sizes.zip > 0 ? `(${formatFileSize(sizes.zip, 'MB')})` : '(---)'}
                        </span>
                      </a>
                    </div>
                  )}
                  
                  {/* Share, Edit i Delete ikone - Mobile */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleShare()
                      }}
                      className="inline hover:opacity-80 transition cursor-pointer bg-[#f9c344] rounded-full p-2 border-none no-underline flex-shrink-0 flex items-center justify-center"
                      title="Kopiraj link za deljenje"
                    >
                      <Share2 size={16} className="text-[#1d1d1f]" />
                    </button>
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
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
