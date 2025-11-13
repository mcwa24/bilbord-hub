'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Copy, Download, ExternalLink } from 'lucide-react'
import { PRRelease } from '@/types'
import { formatDate, generateReadyToPublishHTML } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import toast from 'react-hot-toast'

export default function SaopstenjePage() {
  const params = useParams()
  const [release, setRelease] = useState<PRRelease | null>(null)
  const [loading, setLoading] = useState(true)
  const [htmlCode, setHtmlCode] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchRelease()
    }
  }, [params.id])

  useEffect(() => {
    if (release) {
      setHtmlCode(generateReadyToPublishHTML(release))
      trackView()
    }
  }, [release])

  const fetchRelease = async () => {
    try {
      const res = await fetch(`/api/releases/${params.id}`)
      const data = await res.json()
      setRelease(data.release)
    } catch (error) {
      console.error('Error fetching release:', error)
      toast.error('Greška pri učitavanju saopštenja')
    } finally {
      setLoading(false)
    }
  }

  const trackView = async () => {
    try {
      await fetch(`/api/releases/${params.id}/view`, { method: 'POST' })
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }

  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode)
      toast.success('HTML kod kopiran!')
    } catch (error) {
      toast.error('Greška pri kopiranju')
    }
  }

  const handleDownload = async () => {
    try {
      await fetch(`/api/releases/${params.id}/download`, { method: 'POST' })
      toast.success('Preuzimanje zabeleženo')
    } catch (error) {
      console.error('Error tracking download:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16">
        <div className="container-custom">
          <p className="text-gray-600">Učitavanje...</p>
        </div>
      </div>
    )
  }

  if (!release) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16">
        <div className="container-custom">
          <p className="text-gray-600">Saopštenje nije pronađeno.</p>
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
            <span><strong>Kompanija:</strong> {release.company_name}</span>
            <span><strong>Industrija:</strong> {release.industry}</span>
            <span><strong>Datum:</strong> {formatDate(release.published_at || release.created_at)}</span>
          </div>
          {release.tags.length > 0 && (
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

        {release.material_links.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">
              Materijali za preuzimanje
            </h2>
            <div className="space-y-3">
              {release.material_links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDownload}
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

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#1d1d1f]">
              Ready-to-publish HTML kod
            </h2>
            <Button onClick={handleCopyHTML} className="flex items-center gap-2">
              <Copy size={18} />
              Kopiraj HTML
            </Button>
          </div>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{htmlCode}</code>
          </pre>
        </Card>
      </div>
    </div>
  )
}

