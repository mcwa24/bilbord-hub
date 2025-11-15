'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Card from '@/components/ui/Card'
import toast from 'react-hot-toast'

interface Release {
  id: string
  title: string
  published_at: string | null
  created_at: string
  thumbnail_url: string | null
  content: string
  material_links: Array<{
    type: string
    url: string
    label: string
  }>
  tags: string[]
}

export default function DownloadPage() {
  const params = useParams()
  const [downloading, setDownloading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [release, setRelease] = useState<Release | null>(null)
  const hasDownloaded = useRef(false)

  useEffect(() => {
    // Spreči dupli download
    if (hasDownloaded.current) {
      return
    }

    const downloadFiles = async () => {
      // Označi da je download započet
      hasDownloaded.current = true
      try {
        // Učitaj saopštenje
        const res = await fetch(`/api/releases/${params.id}`)
        if (!res.ok) {
          throw new Error('Saopštenje nije pronađeno')
        }

        const data = await res.json()
        const releaseData = data.release

        if (!releaseData) {
          throw new Error('Saopštenje nije pronađeno')
        }

        setRelease(releaseData)

        // Funkcija za download fajla
        const downloadFile = async (url: string, filename: string) => {
          try {
            console.log(`Starting download: ${filename} from ${url}`)
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Cache-Control': 'no-cache',
              },
            })
            if (!response.ok) {
              throw new Error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`)
            }
            
            const blob = await response.blob()
            console.log(`Blob created for ${filename}, size: ${blob.size} bytes`)
            
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = filename
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            
            // Sačekaj malo pre nego što uklonimo link
            await new Promise(resolve => setTimeout(resolve, 100))
            
            document.body.removeChild(link)
            window.URL.revokeObjectURL(downloadUrl)
            
            console.log(`Successfully downloaded: ${filename}`)
          } catch (err: any) {
            console.error(`Error downloading ${filename}:`, err)
            toast.error(`Greška pri preuzimanju ${filename}: ${err.message}`)
            throw err
          }
        }

        // Pronađi ZIP fajlove (slike) i dokumente
        const zipFiles = releaseData.material_links?.filter(
          (link: any) => link.url?.toLowerCase().endsWith('.zip') || link.label === 'Slike'
        ) || []
        const documents = releaseData.material_links?.filter(
          (link: any) => !link.url?.toLowerCase().endsWith('.zip') && link.label !== 'Slike'
        ) || []

        console.log('Material links:', releaseData.material_links)
        console.log('ZIP files found:', zipFiles)
        console.log('Documents found:', documents)

        // Download ZIP fajla sa slikama PRVO (ako postoji)
        if (zipFiles.length > 0) {
          const zip = zipFiles[0]
          const zipFilename = zip.label === 'Slike' 
            ? `slike-${releaseData.id}.zip` 
            : zip.label || `slike-${releaseData.id}.zip`
          console.log('Downloading ZIP:', zip.url, zipFilename)
          await downloadFile(zip.url, zipFilename)
        }

        // Pauza između download-a
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Download dokumenta ako postoji
        if (documents.length > 0) {
          const doc = documents[0]
          const docFilename = doc.label || `${releaseData.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
          console.log('Downloading document:', doc.url, docFilename)
          await downloadFile(doc.url, docFilename)
        }

        // Track download
        try {
          await fetch(`/api/releases/${params.id}/download`, { method: 'POST' })
        } catch (err) {
          console.error('Error tracking download:', err)
        }

        setDownloading(false)

      } catch (err: any) {
        console.error('Download error:', err)
        setError(err.message || 'Greška pri preuzimanju fajlova')
        setDownloading(false)
      }
    }

    if (params.id) {
      downloadFiles()
    }
  }, [params.id])

  if (downloading && !error) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center">
        <div className="container-custom text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f9c344] mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Preuzimanje fajlova...</p>
          <p className="text-gray-500 text-sm mt-2">Molimo sačekajte dok se fajlovi preuzimaju.</p>
        </div>
      </div>
    )
  }

  if (error || !release) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center">
        <div className="container-custom text-center">
          <p className="text-red-600 text-lg font-medium mb-4">{error || 'Saopštenje nije pronađeno'}</p>
          <a
            href="/"
            className="text-[#f9c344] hover:underline"
          >
            Idi na početnu stranicu
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-4">
            {release.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <span><strong>Datum:</strong> {formatDate(release.published_at || release.created_at)}</span>
          </div>
          {release.tags && release.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {release.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {release.thumbnail_url && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={release.thumbnail_url}
              alt={release.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <Card className="mb-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: release.content }}
          />
        </Card>

        {release.material_links && release.material_links.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">
              Materijali koji su preuzeti
            </h2>
            <div className="space-y-3">
              {release.material_links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <ExternalLink size={20} className="text-gray-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#1d1d1f]">{link.label}</p>
                    <p className="text-sm text-gray-500">{link.url}</p>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

