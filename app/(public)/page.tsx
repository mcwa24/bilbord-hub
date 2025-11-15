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
import RSSBlogPosts from "@/components/RSSBlogPosts";
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
  alt_texts?: Array<{
    image_url: string
    alt_text: string
  }>
}

interface RSSItem {
  title: string
  link: string
  pubDate: string
  description?: string
  imageUrl?: string
  excerpt?: string
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
  const [heroItems, setHeroItems] = useState<RSSItem[]>([])

  const fetchRSSFeed = async () => {
    setRssLoading(true)
    try {
      const res = await fetch('/api/rss')
      const data = await res.json()
      if (data.items && Array.isArray(data.items)) {
        setRssItems(data.items)
        // Hero sekcija uzima random 6 postova
        const shuffled = [...data.items].sort(() => Math.random() - 0.5)
        setHeroItems(shuffled.slice(0, 6))
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

    // Automatsko osvežavanje RSS feed-a svakih 5 minuta
    const rssInterval = setInterval(() => {
      fetchRSSFeed()
    }, 5 * 60 * 1000) // 5 minuta

    // Osvežavanje kada korisnik vrati fokus na tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchRSSFeed()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      clearInterval(rssInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
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

  const fetchHeroPRReleases = async () => {
    try {
      const res = await fetch('/api/releases?limit=6&page=1')
      const data = await res.json()
      if (data.releases && Array.isArray(data.releases)) {
        setHeroPRReleases(data.releases)
      }
    } catch (error) {
      console.error('Error fetching hero PR releases:', error)
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
        className="relative w-full pb-16 overflow-hidden pt-32 md:pt-40 bg-white"
        style={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          marginLeft: '-50vw',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
            PR Hub platforma
          </h1>
          <p className="text-gray-700 text-base mb-6 font-medium">
            Centralizovani hub za najnovija PR saopštenja.
          </p>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Preuzmite poslednja PR saopštenja sa jednog mesta. Pretraga, filtriranje 
            i organizovano listanje svih PR objava na jednom mestu.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button 
              className="shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={(e) => {
                e.preventDefault()
                const section = document.getElementById('najnovija-saopstenja')
                if (section) {
                  const offset = 80 // Offset u pikselima
                  const elementPosition = section.getBoundingClientRect().top
                  const offsetPosition = elementPosition + window.pageYOffset - offset
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  })
                }
              }}
            >
              Saopštenja
            </Button>
          </motion.div>
          
          {/* Hero blog postovi - random 6 RSS postova */}
          {!rssLoading && heroItems.length > 0 && (
            <div className="mt-12">
              <RSSBlogPosts items={heroItems} showTitle={false} />
            </div>
          )}
        </div>
      </section>

      <section id="najnovija-saopstenja" className="section-padding bg-white scroll-mt-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
              {selectedTag ? `Saopštenja sa tagom: ${selectedTag}` : searchQuery ? `Rezultati pretrage: "${searchQuery}"` : 'Poslednja saopštenja'}
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
                    <div className="mt-8 flex items-center justify-center gap-2 flex-wrap text-sm">
                      {getVisiblePages().map((pageNum, index) => (
                        <button
                          key={index}
                          onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                          className={`transition-all duration-300 ${
                            currentPage === pageNum
                              ? 'text-[#1d1d1f] font-bold'
                              : 'text-gray-600 hover:text-[#1d1d1f]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                      
                      {currentPage < totalPages && (
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="text-sm text-gray-600 hover:text-[#1d1d1f] transition ml-2"
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

      <section className="section-padding bg-white pt-8 md:pt-12">
        <div className="container-custom">
          {/* Promo baner */}
          <div className="bg-[#f9c344] rounded-lg p-8 md:p-10 mb-12 text-[#1d1d1f]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-bold mb-3">
                  Postanite naš korisnik
                </h3>
                <p className="text-lg md:text-xl mb-2 font-medium">
                  Distribuirajte vaša PR saopštenja na jednom mestu
                </p>
                <p className="text-base md:text-lg opacity-90">
                  Povećajte vidljivost vaših saopštenja i dostignite širu publiku. 
                  Naša platforma vam omogućava jednostavno deljenje i distribuciju PR materijala.
                </p>
              </div>
              <Link
                href="/o-pr-platformi"
                className="px-8 py-4 bg-white text-[#1d1d1f] font-semibold rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap shadow-lg text-lg"
              >
                Saznajte više
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-8">
              Poslednje na{' '}
              <Link 
                href="https://bilbord.rs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                Bilbord
              </Link>{' '}
              Portalu
            </h2>
            
            {/* Blog postovi - poslednja 3 (najnovija) */}
            {!rssLoading && rssItems.length > 0 && (
              <RSSBlogPosts items={rssItems.slice(0, 3)} />
            )}
            
          <div className="mt-8">
            {rssLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                <p className="text-gray-600 mt-4">Učitavanje vesti...</p>
              </div>
            ) : (
              <RSSFeedList items={rssItems.slice(3, 23)} />
            )}
          </div>
          </div>
        </div>
      </section>

    </>
  );
}

