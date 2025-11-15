'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DownloadPage() {
  const params = useParams()
  const [downloading, setDownloading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const downloadFiles = async () => {
      try {
        // Učitaj saopštenje
        const res = await fetch(`/api/releases/${params.id}`)
        if (!res.ok) {
          throw new Error('Saopštenje nije pronađeno')
        }

        const data = await res.json()
        const release = data.release

        if (!release) {
          throw new Error('Saopštenje nije pronađeno')
        }

        // Funkcija za download fajla
        const downloadFile = async (url: string, filename: string) => {
          try {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`Failed to fetch ${filename}`)
            
            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(downloadUrl)
            
            // Mala pauza između download-a
            await new Promise(resolve => setTimeout(resolve, 500))
          } catch (err) {
            console.error(`Error downloading ${filename}:`, err)
          }
        }

        // Pronađi ZIP fajlove (slike) i dokumente
        const zipFiles = release.material_links?.filter(
          (link: any) => link.url?.toLowerCase().endsWith('.zip') || link.label === 'Slike'
        ) || []
        const documents = release.material_links?.filter(
          (link: any) => !link.url?.toLowerCase().endsWith('.zip') && link.label !== 'Slike'
        ) || []

        // Download dokumenta ako postoji
        if (documents.length > 0) {
          const doc = documents[0]
          const docFilename = doc.label || `${release.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
          await downloadFile(doc.url, docFilename)
        }

        // Download ZIP fajla sa slikama ako postoji
        if (zipFiles.length > 0) {
          const zip = zipFiles[0]
          const zipFilename = zip.label === 'Slike' 
            ? `slike-${release.id}.zip` 
            : zip.label || `slike-${release.id}.zip`
          await downloadFile(zip.url, zipFilename)
        }

        // Track download
        try {
          await fetch(`/api/releases/${params.id}/download`, { method: 'POST' })
        } catch (err) {
          console.error('Error tracking download:', err)
        }

        // Redirect na stranicu saopštenja nakon download-a
        setTimeout(() => {
          window.location.href = `/saopstenje/${params.id}`
        }, 1000)

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

  return (
    <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center">
      <div className="container-custom text-center">
        {downloading && !error && (
          <>
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f9c344] mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Preuzimanje fajlova...</p>
            <p className="text-gray-500 text-sm mt-2">Molimo sačekajte dok se fajlovi preuzimaju.</p>
          </>
        )}
        {error && (
          <>
            <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
            <a
              href={`/saopstenje/${params.id}`}
              className="text-[#f9c344] hover:underline"
            >
              Idi na stranicu saopštenja
            </a>
          </>
        )}
      </div>
    </div>
  )
}

