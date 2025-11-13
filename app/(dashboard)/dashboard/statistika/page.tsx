'use client'

import { useState, useEffect } from 'react'
import { Eye, Download, TrendingUp } from 'lucide-react'
import { PRRelease } from '@/types'
import Card from '@/components/ui/Card'

export default function StatistikaPage() {
  const [stats, setStats] = useState<{
    totalReleases: number
    totalViews: number
    totalDownloads: number
    releases: Array<PRRelease & { view_count: number; download_count: number }>
  }>({
    totalReleases: 0,
    totalViews: 0,
    totalDownloads: 0,
    releases: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/releases/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
          Statistika
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                <Eye size={24} className="text-[#1d1d1f]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ukupno pregleda</p>
                <p className="text-2xl font-bold text-[#1d1d1f]">{stats.totalViews}</p>
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
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">
            Statistika po saopštenjima
          </h2>
          <div className="space-y-4">
            {stats.releases.map((release) => (
              <Card key={release.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">
                      {release.title}
                    </h3>
                    <p className="text-sm text-gray-600">{release.company_name}</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Pregleda</p>
                      <p className="text-xl font-bold text-[#1d1d1f]">{release.view_count}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Preuzimanja</p>
                      <p className="text-xl font-bold text-[#1d1d1f]">{release.download_count}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

