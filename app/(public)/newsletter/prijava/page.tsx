'use client'

import { useState, useEffect } from 'react'
import { Mail, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function NewsletterSubscribePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [receiveAll, setReceiveAll] = useState(true)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      if (data.tags) {
        setAllTags(data.tags)
      }
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error('Unesite validan email')
      return
    }

    if (!receiveAll && selectedTags.length === 0) {
      toast.error('Izaberite barem jedan tag ili odaberite "Sva saopštenja"')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tags: receiveAll ? [] : selectedTags,
          receiveAll,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Proverite vaš email za potvrdu prijave!')
        router.push(`/newsletter/potvrda?email=${encodeURIComponent(email)}&pending=true`)
      } else {
        throw new Error(data.error || 'Greška pri prijavi')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri prijavi na email obaveštenja')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-4">
          Prijava na email obaveštenja
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Primate email obaveštenja kada se objavi novo PR saopštenje. Možete izabrati da primate sva saopštenja ili samo ona sa određenim tagovima.
        </p>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8">
          <form onSubmit={handleSubscribe}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email adresa *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="unesite@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Koja saopštenja želite da primate? *
              </label>
              <div className="space-y-3 mb-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    checked={receiveAll}
                    onChange={() => {
                      setReceiveAll(true)
                      setSelectedTags([])
                    }}
                    className="w-4 h-4 text-[#f9c344]"
                  />
                  <div>
                    <span className="text-[#1d1d1f] font-medium">Sva saopštenja</span>
                    <p className="text-sm text-gray-600">Primaćete email za svako novo PR saopštenje</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    checked={!receiveAll}
                    onChange={() => setReceiveAll(false)}
                    className="w-4 h-4 text-[#f9c344]"
                  />
                  <div>
                    <span className="text-[#1d1d1f] font-medium">Samo saopštenja sa određenim tagovima</span>
                    <p className="text-sm text-gray-600">Izaberite tagove ispod</p>
                  </div>
                </label>
              </div>

              {!receiveAll && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Izaberite tagove:
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {allTags.length === 0 ? (
                      <p className="text-gray-500 text-sm">Učitavanje tagova...</p>
                    ) : (
                      allTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                            selectedTags.includes(tag)
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-black hover:bg-gray-200'
                          }`}
                        >
                          {selectedTags.includes(tag) && <CheckCircle size={14} className="inline mr-1" />}
                          {tag}
                        </button>
                      ))
                    )}
                  </div>
                  {selectedTags.length === 0 && !receiveAll && (
                    <p className="text-sm text-red-500 mt-2">
                      Izaberite barem jedan tag
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || (!receiveAll && selectedTags.length === 0)}
              className="w-full"
            >
              {loading ? 'Prijava...' : 'Prijavi se'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Nakon prijave, dobićete email za potvrdu. Kliknite na link u email-u da aktivirate pretplatu.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Možete se odjaviti ili promeniti filtere u bilo kom trenutku preko{' '}
              <a href="/newsletter/upravljanje" className="text-[#f9c344] hover:underline">
                stranice za upravljanje
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

