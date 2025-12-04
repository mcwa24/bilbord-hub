'use client'

// Keširanje je uklonjeno - sajt je potpuno dinamičan
// Force dynamic rendering (client components ne podržavaju sve opcije)

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from "next/link";
import Image from "next/image";
import { Search, Upload, Eye, Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PRReleaseList from "@/components/PRReleaseList";
import RSSFeedList from "@/components/RSSFeedList";
import LogoGrid from "@/components/LogoGrid";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";
import { isAdmin } from '@/lib/admin';
import toast from 'react-hot-toast';

interface PRRelease {
  id: string
  title: string
  company_name: string
  published_at: string | null
  valid_until: string | null
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

// Keširanje je uklonjeno - sajt je potpuno dinamičan

export default function Home() {
  const [releases, setReleases] = useState<PRRelease[]>([])
  const [loading, setLoading] = useState(false) // Loading samo za listu saopštenja
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [rssItems, setRssItems] = useState<RSSItem[]>([])
  const [heroItems, setHeroItems] = useState<RSSItem[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  const fetchRSSFeed = async () => {
    try {
      // Dodaj timestamp query parametar da sprečimo keširanje
      const timestamp = Date.now()
      const res = await fetch(`/api/rss?_t=${timestamp}`, { 
        cache: 'no-store', // Bez keširanja - uvek fresh podaci
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      const data = await res.json()
      if (data.items && Array.isArray(data.items)) {
        setRssItems(data.items)
        // Hero sekcija uzima random 6 postova
        const shuffled = [...data.items].sort(() => Math.random() - 0.5)
        setHeroItems(shuffled.slice(0, 6))
      }
    } catch (error) {
      // Error fetching RSS feed
    }
  }

  // Učitaj sve tagove iz baze
  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const res = await fetch('/api/tags')
        const data = await res.json()
        if (data.tags) {
          setAvailableTags(data.tags)
        }
      } catch (error) {
        // Error fetching tags
      }
    }
    fetchAllTags()
  }, [])

  const fetchReleases = useCallback(async (pageNum?: number) => {
    const pageToFetch = pageNum ?? currentPage
    setLoading(true) // Loading samo za listu saopštenja
    
    try {
      // Kada ima tag filter, ne koristimo paginaciju - uzimamo sva saopštenja sa tim tagom
      let url = selectedTag 
        ? `/api/releases?tags=${encodeURIComponent(selectedTag)}`
        : `/api/releases?limit=20&page=${pageToFetch}`
      
      if (!selectedTag && searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`
      }
      
      // Koristi browser cache za brže učitavanje (API ima cache headere)
      const res = await fetch(url)
      const data = await res.json()
      setReleases(data.releases || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalItems(data.pagination?.totalItems || 0)
    } catch (error) {
      // Error fetching releases
    } finally {
      setLoading(false)
    }
  }, [currentPage, selectedTag, searchQuery])
  
  // Ref za čuvanje trenutne stranice u intervalu i visibility handler-u
  const currentPageRef = useRef(currentPage)
  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  // Prefetch sledeću stranicu tek kada korisnik promeni stranicu (ne odmah pri učitavanju)
  useEffect(() => {
    // Prefetch samo ako nije prva stranica (znači korisnik je već promenio stranicu)
    if (currentPage > 1 && currentPage < totalPages && !selectedTag && !searchQuery.trim()) {
      // Prefetch sledeću stranicu u pozadini (koristi browser cache)
      fetch(`/api/releases?limit=20&page=${currentPage + 1}`).catch(() => {})
    }
  }, [currentPage, totalPages, selectedTag, searchQuery])


  // Učitaj podatke odmah pri inicijalizaciji
  useEffect(() => {
    let mounted = true
    
    if (mounted) {
      setAdminLoggedIn(isAdmin())
    }
    
    // Učitaj RSS feed i PR releases paralelno
    Promise.allSettled([
      fetchRSSFeed(),
      fetchReleases()
    ])

    // Automatsko osvežavanje RSS feed-a i releases svakih 30 sekundi
    const refreshInterval = setInterval(() => {
      if (mounted) {
        fetchRSSFeed()
        // Koristi trenutnu stranicu iz ref-a da ne resetuje paginaciju
        fetchReleases(currentPageRef.current)
      }
    }, 30 * 1000) // 30 sekundi

    // Osvežavanje kada korisnik vrati fokus na tab
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) {
        fetchRSSFeed()
        // Koristi trenutnu stranicu iz ref-a da ne resetuje paginaciju
        fetchReleases(currentPageRef.current)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      mounted = false
      clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setCurrentPage(1) // Resetuj stranicu kada se promeni filter ili pretraga
  }, [selectedTag, searchQuery])

  // Fetch releases kada se promeni currentPage, selectedTag ili searchQuery
  useEffect(() => {
    fetchReleases(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedTag, searchQuery])

  // Prefetch sledeću stranicu tek kada se sekcija sa saopštenjima učita (vidljiva je)
  useEffect(() => {
    const section = document.getElementById('najnovija-saopstenja')
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Tek kada je sekcija vidljiva, prefetchuj sledeću stranicu
          if (entry.isIntersecting && currentPage < totalPages && !selectedTag && !searchQuery.trim()) {
            fetch(`/api/releases?limit=20&page=${currentPage + 1}`).catch(() => {})
            observer.disconnect() // Prefetch samo jednom
          }
        })
      },
      { threshold: 0.1 } // Prefetch kada je 10% sekcije vidljivo
    )

    observer.observe(section)

    return () => {
      observer.disconnect()
    }
  }, [currentPage, totalPages, selectedTag, searchQuery])


  const handleTagClick = (tag: string) => {
    setCurrentPage(1) // Resetuj stranicu na 1 kada se klikne na tag
    setSelectedTag(tag)
  }

  const handleReset = () => {
    setSelectedTag(null)
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    // Optimistic UI update - postavi stranicu odmah
    setCurrentPage(page)
    // Scrolluj na vrh sekcije sa saopštenjima umesto na vrh stranice
    const section = document.getElementById('najnovija-saopstenja')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // Fetch podatke za novu stranicu
    fetchReleases(page)
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
        <div className="max-w-6xl mx-auto px-6 text-left md:text-center relative z-10">
          <p className="text-base md:text-lg text-gray-600 mb-2 font-medium">
            Bilbord Hub platforma
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
            Centralizovani hub <br className="hidden md:block" />
            za najnovija PR saopštenja
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl md:mx-auto mb-8 leading-relaxed">
            Preuzmite poslednja PR saopštenja sa jednog mesta. Pretraga, filtriranje 
            i organizovano listanje svih PR objava na jednom mestu.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button 
              className="transition-all duration-300"
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
          
          {/* Hero logoi */}
          <div className="mt-12 hidden md:block">
            <LogoGrid />
          </div>
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
                  className="pl-10 w-full bg-white border border-gray-300 focus:border-[#f9c344] focus:ring-[#f9c344] text-[#1d1d1f] placeholder:text-gray-500 rounded-full"
                />
              </div>
              {(selectedTag || searchQuery) && (
                <button
                  onClick={handleReset}
                  className="px-5 py-3 bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f] rounded-full transition font-medium whitespace-nowrap w-full h-12 text-base"
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
                  className="pl-10 bg-white border border-gray-300 focus:border-[#f9c344] focus:ring-[#f9c344] text-[#1d1d1f] placeholder:text-gray-500 rounded-full h-10"
                />
              </div>
              {(selectedTag || searchQuery) && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f] rounded-full transition font-medium whitespace-nowrap h-10"
                >
                  Resetuj
                </button>
              )}
            </div>
          </div>
          
              {loading && releases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f9c344]"></div>
                  <p className="text-gray-600 mt-4">Učitavanje...</p>
                </div>
              ) : releases.length > 0 ? (
                <>
                  <PRReleaseList releases={releases} showAll={false} onTagClick={handleTagClick} showEdit={adminLoggedIn} onDelete={handleDelete} searchQuery={searchQuery} />
                  
                  {totalPages > 1 && totalItems > 20 && (
                    <div className="mt-8 flex items-center justify-center gap-2 flex-wrap text-sm">
                      {currentPage > 1 && (
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="text-sm text-gray-600 hover:text-[#1d1d1f] transition"
                        >
                          Prethodna
                        </button>
                      )}
                      
                      {getVisiblePages().map((pageNum, index) => {
                        const pageNumber = typeof pageNum === 'number' ? pageNum : null
                        return (
                          <button
                            key={index}
                            onClick={() => pageNumber && handlePageChange(pageNumber)}
                            onMouseEnter={() => {
                              // Prefetch stranicu kada korisnik hover-uje preko dugmeta (koristi browser cache)
                              if (pageNumber && pageNumber !== currentPage && !selectedTag && !searchQuery.trim()) {
                                fetch(`/api/releases?limit=20&page=${pageNumber}`).catch(() => {})
                              }
                            }}
                            className={`transition-all duration-300 ${
                              currentPage === pageNum
                                ? 'text-[#1d1d1f] font-bold'
                                : 'text-gray-600 hover:text-[#1d1d1f]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      
                      {currentPage < totalPages ? (
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="text-sm text-gray-600 hover:text-[#1d1d1f] transition"
                        >
                          Sledeća
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePageChange(1)}
                          className="text-sm text-gray-600 hover:text-[#1d1d1f] transition"
                        >
                          Na početak
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
          <div className="mb-12">
            {/* Mobile: Tekst ispod slike */}
            <div className="block md:hidden">
              <div className="relative h-40 rounded-xl overflow-hidden">
                <Image
                  src="/vanilla-bear-films-JEwNQerg3Hs-unsplash_Bilbord_Portal.jpg"
                  alt="Bilbord Portal"
                  fill
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="text-3xl font-bold text-[#1d1d1f] leading-tight">
                  Postanite naš korisnik
                </h3>
              </div>
            </div>
            
            {/* Desktop: Tekst preko slike */}
            <div className="hidden md:block">
              <div className="relative h-80 rounded-3xl overflow-hidden">
                <Image
                  src="/vanilla-bear-films-JEwNQerg3Hs-unsplash_Bilbord_Portal.jpg"
                  alt="Bilbord Portal"
                  fill
                  className="object-cover rounded-3xl"
                  priority
                />
                {/* Overlay za bolji kontrast */}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 flex items-end justify-start p-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-7 max-w-2xl text-left">
                    <h3 className="text-4xl lg:text-5xl font-bold text-[#1d1d1f] leading-tight">
                      Postanite naš korisnik
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl py-6 md:py-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="grid md:grid-cols-2 gap-2 md:gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#1d1d1f] font-bold text-lg">✓</span>
                    <span className="text-[#1d1d1f] text-sm md:text-base">Povećajte vidljivost vaših saopštenja</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1d1d1f] font-bold text-lg">✓</span>
                    <span className="text-[#1d1d1f] text-sm md:text-base">Dosegnite širu publiku</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1d1d1f] font-bold text-lg">✓</span>
                    <span className="text-[#1d1d1f] text-sm md:text-base">Pretraga i filtriranje po kategorijama</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1d1d1f] font-bold text-lg">✓</span>
                    <span className="text-[#1d1d1f] text-sm md:text-base">Centralizovani pristup svim PR materijalima</span>
                  </div>
                </div>
                <Link
                  href="/o-pr-platformi"
                  className="px-8 md:px-10 py-3 md:py-4 bg-[#f9c344] text-[#1d1d1f] font-medium rounded-full hover:bg-[#f0b830] transition-colors whitespace-nowrap text-base md:text-lg"
                >
                  Saznajte više
                </Link>
              </div>
            </div>
          </div>

          {/* Kako funkcioniše PR Hub platforma */}
          <div className="pt-12 mt-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] mb-8 text-center">
              Kako funkcioniše PR Hub platforma
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Upload size={20} className="text-[#1d1d1f]" />
                  <h3 className="text-xl font-bold text-[#1d1d1f]">
                    Upload saopštenja
                  </h3>
                </div>
                <p className="text-[#1d1d1f] text-gray-700">
                  Hub team ili firme upload-uju PR saopštenja na platformu sa naslovom, tagovima, slikama i dokumentima.
                </p>
              </div>
              <div className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Eye size={20} className="text-[#1d1d1f]" />
                  <h3 className="text-xl font-bold text-[#1d1d1f]">
                    Pregled saopštenja
                  </h3>
                </div>
                <p className="text-[#1d1d1f] text-gray-700">
                  Sva saopštenja su vidljiva direktno u listi sa naslovom, datumom, tagovima i linkovima za preuzimanje materijala.
                </p>
              </div>
              <div className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Download size={20} className="text-[#1d1d1f]" />
                  <h3 className="text-xl font-bold text-[#1d1d1f]">
                    Preuzimanje materijala
                  </h3>
                </div>
                <p className="text-[#1d1d1f] text-gray-700">
                  Preuzmite dokumente i ZIP arhive sa slikama direktno sa platforme ili koristite funkciju deljenja.
                </p>
              </div>
              <div className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Share2 size={20} className="text-[#1d1d1f]" />
                  <h3 className="text-xl font-bold text-[#1d1d1f]">
                    Deljenje linkova
                  </h3>
                </div>
                <p className="text-[#1d1d1f] text-gray-700">
                  Koristite ikonu deljenja da kopirate jedinstveni link. Svako ko klikne na link automatski dobija download svih materijala.
                </p>
              </div>
            </div>
          </div>

          {/* Email obaveštenja prijava */}
          <div className="pt-12 mt-12">
            {/* Mobile: Tekst ispod slike */}
            <div className="block md:hidden">
              <div className="relative h-40 rounded-xl overflow-hidden">
                <Image
                  src="/maxim-ilyahov-0aRycsfH57A-unsplash_Bilbord_Portal.jpg"
                  alt="Bilbord Portal"
                  fill
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="text-3xl font-bold text-[#1d1d1f] leading-tight">
                  Prijavite se na email obaveštenja
                </h3>
              </div>
            </div>
            
            {/* Desktop: Tekst preko slike */}
            <div className="hidden md:block">
              <div className="relative h-80 rounded-3xl overflow-hidden">
                <Image
                  src="/maxim-ilyahov-0aRycsfH57A-unsplash_Bilbord_Portal.jpg"
                  alt="Bilbord Portal"
                  fill
                  className="object-cover rounded-3xl"
                  priority
                />
                {/* Overlay za bolji kontrast */}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 flex items-end justify-start p-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-7 max-w-2xl text-left">
                    <h3 className="text-4xl lg:text-5xl font-bold text-[#1d1d1f] leading-tight">
                      Prijavite se na email obaveštenja
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features i dugme */}
            <div className="bg-white rounded-3xl py-6 md:py-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="grid md:grid-cols-2 gap-2 md:gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#1d1d1f] font-bold text-lg">✓</span>
                    <span className="text-[#1d1d1f] text-sm md:text-base">Obaveštenja u realnom vremenu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1d1d1f] font-bold text-lg">✓</span>
                    <span className="text-[#1d1d1f] text-sm md:text-base">Filtriranje po tagovima</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1d1d1f] font-bold text-lg">✓</span>
                    <span className="text-[#1d1d1f] text-sm md:text-base">Prilagođene pretplate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1d1d1f] font-bold text-lg">✓</span>
                    <span className="text-[#1d1d1f] text-sm md:text-base">Lako upravljanje pretplatom</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Link
                    href="/newsletter/prijava"
                    className="px-8 md:px-10 py-3 md:py-4 bg-[#f9c344] text-[#1d1d1f] font-medium rounded-full hover:bg-[#f0b830] transition-colors whitespace-nowrap text-base md:text-lg"
                  >
                    Prijavi se
                  </Link>
                  <p className="text-xs text-gray-500 text-center">Prijava je besplatna</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

