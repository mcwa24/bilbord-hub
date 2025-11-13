'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, FileText, Image as ImageIcon, Download } from 'lucide-react'
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
}

interface PRReleaseListProps {
  releases: PRRelease[]
  showAll?: boolean
  onTagClick?: (tag: string) => void
  showEdit?: boolean
  onDelete?: (id: string) => void
}

function formatFileSize(bytes: number, unit: 'KB' | 'MB' = 'KB'): string {
  if (unit === 'MB') {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
  return (bytes / 1024).toFixed(2) + ' KB'
}

async function getFileSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentLength = response.headers.get('content-length')
    return contentLength ? parseInt(contentLength) : 0
  } catch {
    return 0
  }
}

export default function PRReleaseList({ releases, showAll = false, onTagClick, showEdit = false, onDelete }: PRReleaseListProps) {
  const [fileSizes, setFileSizes] = useState<Record<string, { doc: number; zip: number }>>({})

  useEffect(() => {
    const fetchSizes = async () => {
      const sizes: Record<string, { doc: number; zip: number }> = {}
      
      for (const release of releases) {
        const zipFiles = release.material_links.filter(
          (link) => link.url.toLowerCase().endsWith('.zip') || link.label === 'Slike'
        )
        const documents = release.material_links.filter(
          (link) => !link.url.toLowerCase().endsWith('.zip') && link.label !== 'Slike'
        )

        let docSize = 0
        let zipSize = 0

        if (documents.length > 0) {
          docSize = await getFileSize(documents[0].url)
        }
        if (zipFiles.length > 0) {
          zipSize = await getFileSize(zipFiles[0].url)
        }

        sizes[release.id] = { doc: docSize, zip: zipSize }
      }

      setFileSizes(sizes)
    }

    if (releases.length > 0) {
      fetchSizes()
    }
  }, [releases])

  if (releases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nema saopštenja za prikaz.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-6 text-sm">
                  {/* Fiksno mesto za datum */}
                  <div className="flex flex-col gap-2 flex-shrink-0 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="whitespace-nowrap">
                        {formatDate(release.published_at || release.created_at)}
                      </span>
                    </div>
                    
                    {/* Tagovi odmah ispod datuma */}
                    {release.tags && release.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {release.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => onTagClick?.(tag)}
                            className="px-3 py-1 bg-[#f9c344] text-[#1d1d1f] rounded-full text-xs font-medium hover:bg-[#f0b830] transition"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ime fajla - može da se prelama */}
                  <div className="flex-1 min-w-0">
                    {documents.length > 0 ? (
                      <span className="text-[#1d1d1f] font-semibold break-words">
                        <a
                          href={documents[0].url}
                          download={documents[0].label || release.title}
                          className="hover:underline"
                        >
                          {release.title}
                          {sizes.doc > 0 && (
                            <span className="text-gray-500 font-normal">
                              {' '}({formatFileSize(sizes.doc, 'KB')})
                            </span>
                          )}
                        </a>
                        {/* Edit i Delete ikone odmah posle zagrade */}
                        {showEdit && (
                          <>
                            {' '}
                            <Link
                              href={`/dashboard/edit/${release.id}`}
                              className="inline hover:opacity-70 transition cursor-pointer no-underline"
                              title="Izmeni saopštenje"
                            >
                              📝
                            </Link>
                            {' '}
                            <button
                              onClick={handleDelete}
                              className="inline hover:opacity-70 transition cursor-pointer bg-transparent border-none p-0 no-underline"
                              title="Obriši saopštenje"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-[#1d1d1f] font-semibold break-words">
                        {release.title}
                        {/* Edit i Delete ikone odmah posle imena */}
                        {showEdit && (
                          <>
                            {' '}
                            <Link
                              href={`/dashboard/edit/${release.id}`}
                              className="inline hover:opacity-70 transition cursor-pointer"
                              title="Izmeni saopštenje"
                            >
                              📝
                            </Link>
                            {' '}
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                              }}
                              className="inline hover:opacity-70 transition cursor-pointer bg-transparent border-none p-0"
                              title="Obriši saopštenje"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Fiksno mesto za Foto */}
                  {zipFiles.length > 0 && (
                    <div className="flex items-center gap-2 flex-shrink-0 text-gray-600">
                      <ImageIcon size={16} className="text-gray-500" />
                      <a
                        href={zipFiles[0].url}
                        download={zipFiles[0].label === 'Slike' ? `slike-${release.id}.zip` : zipFiles[0].label}
                        className="text-[#1d1d1f] hover:underline flex items-center gap-1 whitespace-nowrap"
                      >
                        <Download size={14} />
                        Foto
                        {sizes.zip > 0 && (
                          <span className="text-gray-500">
                            {' '}({formatFileSize(sizes.zip, 'MB')})
                          </span>
                        )}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {release.thumbnail_url && (
                <div className="flex-shrink-0">
                  <img
                    src={release.thumbnail_url}
                    alt={release.title}
                    className="w-24 h-24 object-cover rounded-lg"
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
