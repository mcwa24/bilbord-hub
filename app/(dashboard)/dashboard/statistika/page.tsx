'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Download, TrendingUp, HardDrive, Search, Users } from 'lucide-react'
import { PRRelease } from '@/types'
import { isAdmin } from '@/lib/admin'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) {
    return `${gb.toFixed(2)} GB`
  }
  
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`
  }
  
  const kb = bytes / 1024
  return `${kb.toFixed(2)} KB`
}

export default function StatistikaPage() {
  const router = useRouter()
  const [stats, setStats] = useState<{
    totalReleases: number
    totalDownloads: number
    totalStorageBytes: number
    totalUsers: number
  }>({
    totalReleases: 0,
    totalDownloads: 0,
    totalStorageBytes: 0,
    totalUsers: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<PRRelease & { view_count: number; download_count: number }>>([])
  const [selectedRelease, setSelectedRelease] = useState<PRRelease & { view_count: number; download_count: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSelectedRelease(null)
      return
    }

    setSearchLoading(true)
    try {
      const res = await fetch(`/api/releases?search=${encodeURIComponent(searchQuery.trim())}`)
      const data = await res.json()
      setSearchResults(data.releases || [])
      setSelectedRelease(null)
    } catch (error) {
      console.error('Error searching releases:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [searchQuery])

  // Automatska pretraga dok korisnik kuca (kao na naslovnoj stranici) sa debounce-om
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSelectedRelease(null)
      return
    }

    // Debounce pretrage - sačeka 300ms pre nego što pretraži
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, handleSearch])

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/dashboard/login')
    } else {
      fetchStats()
    }
  }, [router])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/releases/stats')
      const data = await res.json()
      setStats({
        totalReleases: data.totalReleases || 0,
        totalDownloads: data.totalDownloads || 0,
        totalStorageBytes: data.totalStorageBytes || 0,
        totalUsers: data.totalUsers || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReleaseClick = (release: PRRelease & { view_count: number; download_count: number }) => {
    setSelectedRelease(release)
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

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
          Statistika
        </h1>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f9c344] rounded-full flex items-center justify-center">
                <TrendingUp size={24} className="text-[#1d1d1f]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ukupno saopštenja</p>
                <p className="text-2xl font-bold text-[#1d1d1f]">{stats.totalReleases}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f9c344] rounded-full flex items-center justify-center">
                <Download size={24} className="text-[#1d1d1f]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ukupno preuzimanja</p>
                <p className="text-2xl font-bold text-[#1d1d1f]">{stats.totalDownloads}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f9c344] rounded-full flex items-center justify-center">
                <HardDrive size={24} className="text-[#1d1d1f]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ukupno zauzeto mesta</p>
                <p className="text-2xl font-bold text-[#1d1d1f]">{formatStorageSize(stats.totalStorageBytes)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f9c344] rounded-full flex items-center justify-center">
                <Users size={24} className="text-[#1d1d1f]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Registrovanih korisnika</p>
                <p className="text-2xl font-bold text-[#1d1d1f]">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search za saopštenja */}
        <Card className="mb-8">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Pretraži saopštenja
            </label>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Pretraži naslove..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Rezultati pretrage */}
          {searchLoading && (
            <p className="text-gray-600">Pretraga...</p>
          )}
          
          {!searchLoading && searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-2">Rezultati pretrage:</p>
              {searchResults.map((release) => (
                <button
                  key={release.id}
                  onClick={() => handleReleaseClick(release)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedRelease?.id === release.id
                      ? 'border-[#f9c344] bg-[#f9c344]/10'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-semibold text-[#1d1d1f]">{release.title}</h3>
                  <p className="text-sm text-gray-600">{release.company_name}</p>
                </button>
              ))}
            </div>
          )}

          {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
            <p className="text-gray-600">Nema rezultata za pretragu.</p>
          )}
        </Card>

        {/* Detaljna statistika za izabrano saopštenje */}
        {selectedRelease && (
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">
              Statistika za: {selectedRelease.title}
            </h2>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-[#f9c344] rounded-full flex items-center justify-center">
                <Download size={24} className="text-[#1d1d1f]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ukupno preuzimanja</p>
                <p className="text-2xl font-bold text-[#1d1d1f]">{selectedRelease.download_count || 0}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-3">Informacije o saopštenju</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Kompanija:</span> {selectedRelease.company_name}</p>
                <p><span className="font-semibold">Industrija:</span> {selectedRelease.industry}</p>
                {selectedRelease.tags && selectedRelease.tags.length > 0 && (
                  <div>
                    <span className="font-semibold">Tagovi: </span>
                    <span className="flex flex-wrap gap-1 mt-1">
                      {selectedRelease.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-[#f9c344] text-[#1d1d1f] rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

