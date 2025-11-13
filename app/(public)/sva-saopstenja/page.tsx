'use client'

import { useState, useEffect } from 'react'
import { PRRelease } from '@/types'
import PRReleaseList from '@/components/PRReleaseList'

export default function SvaSaopstenjaPage() {
  const [releases, setReleases] = useState<PRRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    fetchReleases()
  }, [selectedTag])

  const fetchReleases = async () => {
    setLoading(true)
    try {
      let url = '/api/releases'
      if (selectedTag) {
        url += `?tags=${encodeURIComponent(selectedTag)}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setReleases(data.releases || [])
    } catch (error) {
      console.error('Error fetching releases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag)
  }

  const handleReset = () => {
    setSelectedTag(null)
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f]">
            {selectedTag ? `Saopštenja sa tagom: ${selectedTag}` : 'Sva saopštenja'}
          </h1>
          {selectedTag && (
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-[#1d1d1f] rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Resetuj
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Učitavanje...</p>
          </div>
        ) : releases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nema saopštenja za prikaz.</p>
          </div>
        ) : (
          <PRReleaseList releases={releases} showAll={true} onTagClick={handleTagClick} showEdit={true} />
        )}
      </div>
    </div>
  )
}

