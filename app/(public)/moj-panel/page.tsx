'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Settings, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function MyPanelPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [creatingSubscription, setCreatingSubscription] = useState(false)

  useEffect(() => {
    checkUser()
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

  const loadSubscription = async (email: string) => {
    if (!email) return

    try {
      const res = await fetch(`/api/newsletter/subscription-by-user?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (res.ok && data.subscription) {
        setSubscription(data.subscription)
      } else {
        // Ako nema subscription, ne kreiraj ga automatski - korisnik će kliknuti dugme
        setSubscription(null)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
      setSubscription(null)
    }
  }

  const createSubscription = async (email: string) => {
    if (!email) {
      toast.error('Email adresa nije dostupna')
      return
    }

    setCreatingSubscription(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      
      if (res.ok && data.subscription) {
        setSubscription(data.subscription)
        toast.success('Email obaveštenja su aktivirana!')
        // Ponovo učitaj subscription da osveži podatke
        await loadSubscription(email)
      } else {
        throw new Error(data.error || 'Greška pri aktivaciji email obaveštenja')
      }
    } catch (error: any) {
      console.error('Error creating subscription:', error)
      toast.error(error.message || 'Greška pri aktivaciji email obaveštenja')
    } finally {
      setCreatingSubscription(false)
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
                  <p className="text-sm text-gray-600 mt-2">
                    Primate <strong>sva PR saopštenja</strong> kada se objave nova saopštenja.
                  </p>
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

              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={handleUnsubscribe}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                >
                  Odjavi se sa email obaveštenja
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Nema aktivne pretplate za email obaveštenja.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Aktivirajte email obaveštenja da biste primali sva nova PR saopštenja.
              </p>
              <Button 
                onClick={() => {
                  if (user?.email) {
                    createSubscription(user.email)
                  } else {
                    toast.error('Email adresa nije dostupna')
                  }
                }}
                disabled={creatingSubscription || !user?.email}
              >
                {creatingSubscription ? 'Aktiviranje...' : 'Aktiviraj email obaveštenja'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
