'use client'

import { useState, useEffect, useCallback } from 'react'
import { PRRelease } from '@/types'
import PRReleaseList from '@/components/PRReleaseList'
import { isAdmin } from '@/lib/admin'
import toast from 'react-hot-toast'

export default function SvaSaopstenjaPage() {
  const [releases, setReleases] = useState<PRRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const fetchReleases = useCallback(async () => {
    setLoading(true)
    try {
      let url = `/api/releases?limit=${itemsPerPage}&page=${currentPage}`
      if (selectedTag) {
        url += `&tags=${encodeURIComponent(selectedTag)}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setReleases(data.releases || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching releases:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedTag, currentPage, itemsPerPage])

  useEffect(() => {
    setAdminLoggedIn(isAdmin())
  }, [])

  useEffect(() => {
    setCurrentPage(1) // Resetuj stranicu kada se promeni filter ili itemsPerPage
  }, [selectedTag, itemsPerPage])

  useEffect(() => {
    fetchReleases()
  }, [fetchReleases])

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag)
  }

  const handleReset = () => {
    setSelectedTag(null)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
  }

  const getVisiblePages = () => {
    const maxVisible = 10
    const pages: (number | string)[] = []
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 5) {
        for (let i = 1; i <= 7; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 4) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 6; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/releases/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        toast.success('Saopštenje obrisano!')
        // Ukloni iz liste bez refresh-a
        setReleases(releases.filter(r => r.id !== id))
      } else {
        const error = await res.json()
        throw new Error(error.error || 'Greška pri brisanju')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri brisanju saopštenja')
    }
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f]">
            {selectedTag ? `Saopštenja sa tagom: ${selectedTag}` : 'Sva saopštenja'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="items-per-page" className="text-sm text-gray-600 whitespace-nowrap">
                Po stranici:
              </label>
              <select
                id="items-per-page"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9c344] focus:border-transparent text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            {selectedTag && (
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 text-[#1d1d1f] rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Resetuj
              </button>
            )}
          </div>
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
          <>
            <PRReleaseList releases={releases} showAll={false} onTagClick={handleTagClick} showEdit={adminLoggedIn} onDelete={handleDelete} />
            
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2 bg-gray-200 text-[#1d1d1f] rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Prethodna
                  </button>
                )}
                
                {getVisiblePages().map((pageNum, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                    disabled={pageNum === '...'}
                    className={`px-4 py-2 rounded-lg transition font-medium ${
                      currentPage === pageNum
                        ? 'bg-[#f9c344] text-[#1d1d1f] font-bold'
                        : pageNum === '...'
                        ? 'bg-transparent text-gray-400 cursor-default'
                        : 'bg-gray-200 text-[#1d1d1f] hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2 bg-gray-200 text-[#1d1d1f] rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Sledeća
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

