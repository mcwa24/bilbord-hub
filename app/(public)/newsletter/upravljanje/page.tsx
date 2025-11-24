'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, CheckCircle, XCircle, Settings } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function NewsletterManagementPage() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email')
  const tokenParam = searchParams.get('token')
  
  const [email, setEmail] = useState(emailParam || '')
  const [token, setToken] = useState(tokenParam || '')
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [receiveAll, setReceiveAll] = useState(true)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    if (emailParam && tokenParam) {
      loadSubscription()
    }
    loadTags()
  }, [emailParam, tokenParam])

  const loadTags = async () => {
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      if (data.tags) {
        setAllTags(data.tags)
      }
    } catch (error) {
      // Error loading tags
    }
  }

  const loadSubscription = async () => {
    if (!email || !token) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/newsletter/subscription?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)
      const data = await res.json()
      
      if (res.ok && data.subscription) {
        setSubscription(data.subscription)
        setReceiveAll(data.subscription.receive_all)
        setSelectedTags(data.subscription.subscribed_tags || [])
      } else {
        setSubscription(null)
        toast.error(data.error || 'Nevažeći token ili email')
      }
    } catch (error) {
      toast.error('Greška pri učitavanju pretplate')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Unesite validan email')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/send-management-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Poslat vam je email sa linkom za upravljanje. Proverite vaš inbox.')
        setEmailSent(true)
      } else {
        throw new Error(data.error || 'Greška pri slanju emaila')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri slanju linka za upravljanje')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFilters = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Unesite validan email')
      return
    }

    if (!token) {
      toast.error('Token je obavezan za ažuriranje')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/update-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tags: receiveAll ? [] : selectedTags,
          receiveAll,
          token,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Filteri su ažurirani!')
        setSubscription(data.subscription)
      } else {
        throw new Error(data.error || 'Greška pri ažuriranju filtera')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri ažuriranju filtera')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!confirm('Da li ste sigurni da želite da se odjavite sa email obaveštenja?')) {
      return
    }

    if (!token) {
      toast.error('Token je obavezan za odjavu')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Uspešno ste odjavljeni sa email obaveštenja')
        setSubscription(null)
        setEmail('')
      } else {
        throw new Error(data.error || 'Greška pri odjavi')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri odjavi sa email obaveštenja')
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-4">
          Upravljanje pretplatom na email obaveštenja
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Za pristup upravljanju pretplatom, unesite vaš email i poslaćemo vam link sa sigurnosnim tokenom. Možete promeniti tagove, odjaviti se sa određenog taga ili potpuno odjaviti sa email obaveštenja.
        </p>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8 mb-8">
          {!token && !subscription && (
            <>
              <form onSubmit={handleRequestAccess} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email adresa
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
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
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Slanje...' : 'Pošalji link za upravljanje'}
                  </Button>
                </div>
              </form>
              {emailSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800">
                    ✓ Poslat vam je email sa linkom za upravljanje. Proverite vaš inbox i kliknite na link da pristupite upravljanju pretplatom.
                  </p>
                </div>
              )}
            </>
          )}

          {subscription && (
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {subscription.is_verified ? (
                      <>
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-sm font-semibold text-green-600">Verifikovana pretplata</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-yellow-600" size={20} />
                        <span className="text-sm font-semibold text-yellow-600">Čeka verifikaciju</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Email: <strong>{subscription.email}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Prijavljen: {new Date(subscription.created_at).toLocaleDateString('sr-RS')}
                  </p>
                  {subscription.last_email_sent_at && (
                    <p className="text-sm text-gray-600">
                      Poslednji email: {new Date(subscription.last_email_sent_at).toLocaleDateString('sr-RS')}
                    </p>
                  )}
                </div>
                {subscription.is_active ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Aktivna
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    Neaktivna
                  </span>
                )}
              </div>

              {!subscription.is_verified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Vaša pretplata još nije verifikovana. Proverite vaš email i kliknite na link za potvrdu.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Koja saopštenja želite da primate?
                </label>
                <div className="space-y-3 mb-4">
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      checked={receiveAll}
                      onChange={() => {
                        setReceiveAll(true)
                        setSelectedTags([])
                      }}
                      className="w-4 h-4 text-[#f9c344] mt-1"
                    />
                    <div>
                      <span className="text-[#1d1d1f] font-medium">Sva saopštenja</span>
                      <p className="text-sm text-gray-600">Primaćete email za svako novo PR saopštenje</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      checked={!receiveAll}
                      onChange={() => setReceiveAll(false)}
                      className="w-4 h-4 text-[#f9c344] mt-1"
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
                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {allTags.length === 0 ? (
                        <p className="text-gray-500 text-sm">Učitavanje tagova...</p>
                      ) : (
                        allTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                              selectedTags.includes(tag)
                                ? 'bg-black text-white'
                                : 'bg-white text-black hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            {selectedTags.includes(tag) && <CheckCircle size={14} />}
                            {tag}
                          </button>
                        ))
                      )}
                    </div>
                    {selectedTags.length === 0 && (
                      <p className="text-sm text-red-500 mt-2">
                        Izaberite barem jedan tag da biste primali emailove
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleUpdateFilters}
                  disabled={loading || (!receiveAll && selectedTags.length === 0)}
                  className="flex-1"
                >
                  {loading ? 'Čuvanje...' : 'Sačuvaj izmene'}
                </Button>
                <Button
                  onClick={handleUnsubscribe}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Potpuno odjavi se
                </Button>
              </div>
            </div>
          )}

          {!subscription && email && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Nema aktivne pretplate za ovaj email.
              </p>
              <a href="/newsletter/prijava" className="text-[#f9c344] hover:underline font-medium">
                Prijavite se na email obaveštenja
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

