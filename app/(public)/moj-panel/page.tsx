'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Settings, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function MyPanelPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [receiveAll, setReceiveAll] = useState(true)

  useEffect(() => {
    checkUser()
    loadTags()
  }, [])

  const checkUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/prijava')
        return
      }

      setUser(user)
      if (user?.email) {
        loadSubscription(user.email)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/prijava')
    } finally {
      setLoading(false)
    }
  }

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

  const loadSubscription = async (email: string) => {
    if (!email) return

    try {
      const res = await fetch(`/api/newsletter/subscription-by-user?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (res.ok && data.subscription) {
        setSubscription(data.subscription)
        setReceiveAll(data.subscription.receive_all)
        setSelectedTags(data.subscription.subscribed_tags || [])
      } else {
        // Ako nema subscription, kreiraj ga
        await createSubscription(email)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  const createSubscription = async (email: string) => {
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tags: [], receiveAll: true }),
      })

      const data = await res.json()
      if (res.ok && data.subscription) {
        setSubscription(data.subscription)
        setReceiveAll(true)
        setSelectedTags([])
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
    }
  }

  const handleUpdateFilters = async () => {
    if (!user?.email) return

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/update-filters-by-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          tags: receiveAll ? [] : selectedTags,
          receiveAll,
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

    if (!user?.email) return

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/unsubscribe-by-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Uspešno ste odjavljeni sa email obaveštenja')
        setSubscription(null)
      } else {
        throw new Error(data.error || 'Greška pri odjavi')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri odjavi sa email obaveštenja')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Uspešno ste se odjavili')
      router.push('/')
    } catch (error: any) {
      toast.error('Greška pri odjavi')
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16">
        <div className="container-custom max-w-4xl text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f9c344] mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Učitavanje...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-2">
            Moj Panel
          </h1>
          <p className="text-gray-600">
            Email: <strong>{user?.email}</strong>
          </p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-[#f9c344]" size={24} />
            <h2 className="text-2xl md:text-3xl font-bold text-[#1d1d1f]">
              Email Obaveštenja
            </h2>
          </div>

          {subscription ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {subscription.is_verified ? (
                      <>
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-sm font-semibold text-green-600">Aktivna pretplata</span>
                      </>
                    ) : (
                      <>
                        <Mail className="text-yellow-600" size={20} />
                        <span className="text-sm font-semibold text-yellow-600">Čeka verifikaciju</span>
                      </>
                    )}
                  </div>
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
                                ? 'bg-[#f9c344] text-[#1d1d1f]'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Nema aktivne pretplate za email obaveštenja.
              </p>
              <Button onClick={() => createSubscription(user?.email)}>
                Aktiviraj email obaveštenja
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

