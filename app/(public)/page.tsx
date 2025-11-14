'use client'

import { useState, useEffect } from 'react'
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PRReleaseList from "@/components/PRReleaseList";
import RSSFeedList from "@/components/RSSFeedList";
import { isAdmin } from '@/lib/admin';
import toast from 'react-hot-toast';

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

interface RSSItem {
  title: string
  link: string
  pubDate: string
  description?: string
}

const CACHE_KEY = 'pr_releases_cache'
const CACHE_TIMESTAMP_KEY = 'pr_releases_cache_timestamp'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minuta

export default function Home() {
  const [releases, setReleases] = useState<PRRelease[]>([])
  const [loading, setLoading] = useState(false) // Počinjemo sa false jer učitavamo iz cache-a
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [rssItems, setRssItems] = useState<RSSItem[]>([])
  const [rssLoading, setRssLoading] = useState(false)

  const fetchRSSFeed = async () => {
    setRssLoading(true)
    try {
      const res = await fetch('/api/rss')
      const data = await res.json()
      if (data.items && Array.isArray(data.items)) {
        setRssItems(data.items)
      }
    } catch (error) {
      console.error('Error fetching RSS feed:', error)
    } finally {
      setRssLoading(false)
    }
  }

  // Učitaj podatke iz cache-a odmah pri inicijalizaciji
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY)
        const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
        
        if (cachedData && cacheTimestamp) {
          const timestamp = parseInt(cacheTimestamp)
          const now = Date.now()
          
          // Ako je cache stariji od 5 minuta, ignoriši ga
          if (now - timestamp < CACHE_DURATION) {
            const parsed = JSON.parse(cachedData)
            // Cache je uvek za osnovnu stranicu bez filtera
            if (parsed.releases && Array.isArray(parsed.releases)) {
              setReleases(parsed.releases)
              setTotalPages(parsed.totalPages || 1)
              return true
            }
          }
        }
      } catch (error) {
        console.error('Error loading cache:', error)
      }
      return false
    }

    // Pokušaj da učitamo iz cache-a odmah
    loadCachedData()
    setAdminLoggedIn(isAdmin())
    fetchRSSFeed()
  }, [])

  useEffect(() => {
    setCurrentPage(1) // Resetuj stranicu kada se promeni filter ili pretraga
  }, [selectedTag, searchQuery])

  useEffect(() => {
    fetchReleases()
  }, [selectedTag, searchQuery, currentPage])

  const fetchReleases = async () => {
    // Ne prikazuj loading ako već imamo podatke (stale-while-revalidate)
    const hasData = releases.length > 0
    if (!hasData) {
      setLoading(true)
    }
    
    try {
      let url = `/api/releases?limit=20&page=${currentPage}`
      if (selectedTag) {
        url += `&tags=${encodeURIComponent(selectedTag)}`
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setReleases(data.releases || [])
      setTotalPages(data.pagination?.totalPages || 1)
      
      // Sačuvaj u cache samo ako nema filtera ili pretrage
      if (!selectedTag && !searchQuery.trim() && currentPage === 1) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            releases: data.releases || [],
            totalPages: data.pagination?.totalPages || 1
          }))
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
        } catch (error) {
          console.error('Error saving cache:', error)
        }
      }
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
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scrolluj na vrh sekcije sa saopštenjima umesto na vrh stranice
    const section = document.getElementById('najnovija-saopstenja')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getVisiblePages = () => {
    const maxVisible = 10
    const pages: (number | string)[] = []
    
    if (totalPages <= maxVisible) {
      // Ako ima 10 ili manje stranica, prikaži sve
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Ako ima više od 10 stranica
      if (currentPage <= 5) {
        // Početak: prikaži prve 10 stranica
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i)
        }
      } else if (currentPage >= totalPages - 4) {
        // Kraj: prikaži poslednjih 10 stranica
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Sredina: prikaži 5 pre i 5 posle trenutne stranice
        for (let i = currentPage - 5; i <= currentPage + 4; i++) {
          pages.push(i)
        }
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
    <>
      <section
        className="relative w-full pb-16 overflow-hidden pt-32 md:pt-40"
        style={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          marginLeft: '-50vw',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      >
        <style jsx>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-400 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start justify-between gap-12 relative z-10">
          <div className="flex-1 basis-1/2 min-w-0 text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-pink-100 drop-shadow-2xl">
              PR Hub
            </h1>
            <p className="text-white/90 text-base mb-6 font-medium drop-shadow-lg">
              Centralizovani hub za najnovija PR saopštenja.
            </p>
            <p className="text-base md:text-lg text-white/80 max-w-xl mb-6 leading-relaxed drop-shadow-md">
              Preuzmite poslednja PR saopštenja sa jednog mesta. Pretraga, filtriranje 
              i organizovano listanje svih PR objava na jednom mestu.
            </p>
            <Link href="#najnovija-saopstenja">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="shadow-xl hover:shadow-2xl transition-all duration-300">
                  Saopštenja
                </Button>
              </motion.div>
            </Link>
          </div>
          
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 basis-1/2 flex items-center justify-center md:justify-end"
          >
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl transform rotate-3"></div>
              <div className="relative">
                <Image
                  src="/vanilla-bear-films-JEwNQerg3Hs-unsplash_Bilbord_Portal.jpg"
                  alt="Bilbord Hub"
                  width={800}
                  height={800}
                  className="w-full h-auto object-contain rounded-3xl shadow-2xl border-4 border-white/30"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="najnovija-saopstenja" className="section-padding bg-gradient-to-b from-gray-50 via-white to-gray-50 scroll-mt-32">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
              {selectedTag ? `Saopštenja sa tagom: ${selectedTag}` : searchQuery ? `Rezultati pretrage: "${searchQuery}"` : 'Najnovija saopštenja'}
            </h2>
            {/* Mobile: Search ispod naslova */}
            <div className="md:hidden flex flex-col gap-2 w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Pretraži naslove..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400 text-[#1d1d1f] placeholder:text-gray-500 shadow-md rounded-full"
                />
              </div>
              {(selectedTag || searchQuery) && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f] rounded-full transition font-medium whitespace-nowrap w-full h-10 shadow-md"
                >
                  Resetuj
                </button>
              )}
            </div>
            {/* Desktop: Search pored naslova */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md justify-end">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Pretraži naslove..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400 text-[#1d1d1f] placeholder:text-gray-500 shadow-md rounded-full h-10"
                />
              </div>
              {(selectedTag || searchQuery) && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f] rounded-full transition font-medium whitespace-nowrap h-10 shadow-md"
                >
                  Resetuj
                </button>
              )}
            </div>
          </div>
              {loading && releases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                  <p className="text-gray-600 mt-4">Učitavanje...</p>
                </div>
              ) : releases.length > 0 ? (
                <>
                  <PRReleaseList releases={releases} showAll={false} onTagClick={handleTagClick} showEdit={adminLoggedIn} onDelete={handleDelete} searchQuery={searchQuery} />
                  
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                      {currentPage > 1 && (
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="px-4 py-2 rounded-lg text-base font-medium transition bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f]"
                        >
                          Prethodna
                        </button>
                      )}
                      
                      {getVisiblePages().map((pageNum, index) => (
                        <button
                          key={index}
                          onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                            currentPage === pageNum
                              ? 'bg-[#1d1d1f] hover:bg-[#000] text-white font-bold'
                              : 'bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                      
                      {currentPage < totalPages && (
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="px-4 py-2 rounded-lg text-base font-medium transition bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f]"
                        >
                          Sledeća
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Nema saopštenja za prikaz.</p>
                </div>
              )}
        </div>
      </section>

      <section className="section-padding bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-8 md:pt-12">
        <div className="container-custom">
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-8">
              Aktuelno na portalu
            </h2>
          {rssLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-4">Učitavanje vesti...</p>
            </div>
          ) : (
            <RSSFeedList items={rssItems} />
          )}
          </div>
        </div>
      </section>

    </>
  );
}

