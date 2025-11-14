'use client'

import { useState, useEffect } from 'react'
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PRReleaseList from "@/components/PRReleaseList";
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

export default function Home() {
  const [releases, setReleases] = useState<PRRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setAdminLoggedIn(isAdmin())
  }, [])

  useEffect(() => {
    setCurrentPage(1) // Resetuj stranicu kada se promeni filter ili pretraga
  }, [selectedTag, searchQuery])

  useEffect(() => {
    fetchReleases()
  }, [selectedTag, searchQuery, currentPage])

  const fetchReleases = async () => {
    setLoading(true)
    try {
      let url = `/api/releases?limit=10&page=${currentPage}`
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        className="relative w-full bg-white pb-16 overflow-hidden pt-32 md:pt-40"
        style={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          marginLeft: '-50vw',
        }}
      >
        <div className="absolute top-20 right-20 w-40 h-40 bg-[#1d1d1f] rounded-full opacity-5"></div>
        <div className="absolute bottom-10 left-10 w-1 h-32 bg-[#1d1d1f] opacity-10"></div>
        
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start justify-between gap-12 relative z-10">
          <div className="flex-1 basis-1/2 min-w-0 text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#1d1d1f] leading-tight mb-2">
              Bilbord Hub
            </h1>
            <p className="text-gray-500 text-base mb-6">
              Centralizovani hub za najnovija PR saopštenja.
            </p>
            <p className="text-base md:text-lg text-[#4a4a4a] max-w-xl mb-6">
              Preuzmite poslednja PR saopštenja sa jednog mesta. Pretraga, filtriranje 
              i organizovano listanje svih PR objava na jednom mestu.
            </p>
            <Link href="#najnovija-saopstenja">
              <Button>
                Saopštenja
              </Button>
            </Link>
          </div>
          
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 basis-1/2 flex items-center justify-center md:justify-end"
          >
            <div className="relative w-full max-w-md">
              <Image
                src="/vanilla-bear-films-JEwNQerg3Hs-unsplash_Bilbord_Portal.jpg"
                alt="Bilbord Hub"
                width={600}
                height={600}
                className="w-full h-auto object-contain rounded-2xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="najnovija-saopstenja" className="section-padding bg-white scroll-mt-32">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f]">
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
                  className="pl-10 w-full"
                />
              </div>
              {(selectedTag || searchQuery) && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-[#1d1d1f] rounded-lg hover:bg-gray-300 transition font-medium whitespace-nowrap w-full"
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
                  className="pl-10"
                />
              </div>
              {(selectedTag || searchQuery) && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-[#1d1d1f] rounded-lg hover:bg-gray-300 transition font-medium whitespace-nowrap"
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
              ) : (
                <>
                  <PRReleaseList releases={releases} showAll={false} onTagClick={handleTagClick} showEdit={adminLoggedIn} onDelete={handleDelete} searchQuery={searchQuery} />
                  
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
                          className={`px-4 py-2 rounded-lg transition font-medium ${
                            currentPage === pageNum
                              ? 'bg-[#f9c344] text-[#1d1d1f] font-bold'
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
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] mb-8 text-center">
            Kako funkcioniše?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#f9c344] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#1d1d1f]">1</span>
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">
                Pregledaj najnovija saopštenja
              </h3>
              <p className="text-gray-600">
                Pronađite poslednja PR saopštenja sa naslovom, opisom, tagovima i materijalima.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#f9c344] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#1d1d1f]">2</span>
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">
                Pretražuj i filtriraj
              </h3>
              <p className="text-gray-600">
                Pretražujte po naslovu, tagovima ili datumu. Pronađite relevantna saopštenja brzo i lako.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#f9c344] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#1d1d1f]">3</span>
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">
                Preuzmi i koristi
              </h3>
              <p className="text-gray-600">
                Preuzmite dokumente i slike direktno sa platforme. Sve što vam treba na jednom mestu.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

