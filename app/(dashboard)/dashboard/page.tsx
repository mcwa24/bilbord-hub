'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { PRRelease } from '@/types'
import ReleaseCard from '@/components/ReleaseCard'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [releases, setReleases] = useState<PRRelease[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyReleases()
  }, [])

  const fetchMyReleases = async () => {
    try {
      const res = await fetch('/api/releases/my')
      if (!res.ok) {
        throw new Error('Failed to fetch')
      }
      const data = await res.json()
      setReleases(data.releases || [])
    } catch (error) {
      toast.error('Greška pri učitavanju saopštenja')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovo saopštenje?')) {
      return
    }

    try {
      const res = await fetch(`/api/releases/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Saopštenje obrisano')
        fetchMyReleases()
      } else {
        throw new Error('Greška pri brisanju')
      }
    } catch (error) {
      toast.error('Greška pri brisanju saopštenja')
    }
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f]">
            Moja saopštenja
          </h1>
          <Link href="/dashboard/novo">
            <Button className="flex items-center gap-2">
              <Plus size={20} />
              Novo saopštenje
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Učitavanje...</p>
          </div>
        ) : releases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Nemate još nijedno saopštenje.</p>
            <Link href="/dashboard/novo">
              <Button>Kreiraj prvo saopštenje</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {releases.map((release) => (
              <div key={release.id} className="relative group">
                <ReleaseCard release={release} />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/dashboard/edit/${release.id}`}>
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition">
                      <Edit size={16} className="text-[#1d1d1f]" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(release.id)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
