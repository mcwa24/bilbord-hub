'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function NewsletterUnsubscribePage() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email')
  const tokenParam = searchParams.get('token')
  
  const [email, setEmail] = useState(emailParam || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (emailParam && tokenParam) {
      // Automatska odjava sa tokenom
      handleUnsubscribe()
    }
  }, [emailParam, tokenParam])

  const handleUnsubscribe = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Validan email je obavezan')
      return
    }

    if (!tokenParam) {
      toast.error('Token je obavezan za odjavu. Koristite link iz emaila.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          token: tokenParam,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        toast.success('Uspešno ste odjavljeni sa email obaveštenja')
      } else {
        throw new Error(data.error || 'Greška pri odjavi')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri odjavi sa email obaveštenja')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16">
        <div className="container-custom max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-4">
            Odjavljeni ste sa email obaveštenja
          </h1>
          <p className="text-gray-600 mb-8">
            Uspešno ste odjavljeni sa email obaveštenja Bilbord Hub platforme.
          </p>
          <a href="/" className="text-[#f9c344] hover:underline">
            Vrati se na početnu stranicu
          </a>
        </div>
      </div>
    )
  }

  // Ako nema tokena, prikaži poruku
  if (!tokenParam && !emailParam) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16">
        <div className="container-custom max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
            Odjava sa email obaveštenja
          </h1>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8">
            <p className="text-gray-600 mb-6">
              Za odjavu sa email obaveštenja, koristite link iz emaila koji ste primili. Link sadrži sigurnosni token koji je potreban za odjavu.
            </p>
            <p className="text-gray-600 mb-6">
              Ako nemate link, možete zatražiti novi link za upravljanje pretplatom na{' '}
              <a href="/newsletter/upravljanje" className="text-[#f9c344] hover:underline font-medium">
                stranici za upravljanje
              </a>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
          Odjava sa email obaveštenja
        </h1>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f9c344] mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Odjavljivanje...</p>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">
              Odjavljivanje u toku...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

