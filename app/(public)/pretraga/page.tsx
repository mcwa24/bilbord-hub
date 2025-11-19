'use client'

import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import { PRRelease, FilterParams } from '@/types'
import PRReleaseList from '@/components/PRReleaseList'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function PretragaPage() {
  const [releases, setReleases] = useState<PRRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterParams>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    fetchReleases()
  }, [filters, selectedTag])

  const fetchReleases = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.company) params.append('company', filters.company)
      if (filters.industry) params.append('industry', filters.industry)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)
      if (selectedTag) {
        params.append('tags', selectedTag)
      } else if (filters.tags?.length) {
        params.append('tags', filters.tags.join(','))
      }

      const res = await fetch(`/api/releases?${params.toString()}`)
      const data = await res.json()
      setReleases(data.releases || [])
    } catch (error) {
      console.error('Error fetching releases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, search: searchQuery })
  }

  const handleFilterChange = (key: keyof FilterParams, value: any) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag)
  }

  const handleReset = () => {
    setSelectedTag(null)
    setFilters({})
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f]">
            {selectedTag ? `Saopštenja sa tagom: ${selectedTag}` : 'Pretraga saopštenja'}
          </h1>
          {selectedTag && (
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-gray-200 text-[#1d1d1f] rounded-lg hover:bg-gray-300 transition font-medium text-base"
            >
              Resetuj
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Pretraži po naslovu, opisu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
            <Button type="submit">Pretraži</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} className="mr-2" />
              Filteri
            </Button>
          </div>
        </form>

        {showFilters && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
                  Kompanija
                </label>
                <Input
                  type="text"
                  placeholder="Naziv kompanije"
                  value={filters.company || ''}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
                  Industrija
                </label>
                <Input
                  type="text"
                  placeholder="Tip industrije"
                  value={filters.industry || ''}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
                  Od datuma
                </label>
                <Input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
                  Do datuma
                </label>
                <Input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  setFilters({})
                  setSearchQuery('')
                }}
                variant="outline"
              >
                Resetuj filtere
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Učitavanje...</p>
          </div>
        ) : releases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nema pronađenih saopštenja.</p>
          </div>
        ) : (
          <PRReleaseList releases={releases} showAll={true} onTagClick={handleTagClick} />
        )}
      </div>
    </div>
  )
}

