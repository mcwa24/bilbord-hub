'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

function NewsletterConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const success = searchParams.get('success') === 'true'
  const error = searchParams.get('error')
  const email = searchParams.get('email')
  const pending = searchParams.get('pending') === 'true'
  const token = searchParams.get('token')
  const [verifying, setVerifying] = useState(false)

  // Ako ima token i email ali nema success/error, pozovi verify API
  useEffect(() => {
    if (token && email && !success && !error && !pending) {
      setVerifying(true)
      fetch(`/api/newsletter/verify?token=${token}&email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.redirectUrl) {
            // Redirect na success stranicu
            window.location.href = data.redirectUrl
          } else if (data.redirectUrl) {
            // Redirect na error stranicu
            window.location.href = data.redirectUrl
          } else {
            throw new Error(data.error || 'Greška pri verifikaciji')
          }
        })
        .catch((err) => {
          console.error('Verification error:', err)
          router.push(`/newsletter/potvrda?error=${encodeURIComponent(err.message || 'Greška pri verifikaciji')}`)
        })
        .finally(() => {
          setVerifying(false)
        })
    }
  }, [token, email, success, error, pending, router])

  if (verifying) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16">
        <div className="container-custom max-w-4xl text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f9c344] mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Verifikacija u toku...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        {pending && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 md:p-12 text-center">
            <Mail className="mx-auto mb-4 text-[#f9c344]" size={64} />
            <h1 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] mb-4">
              Proverite vaš email
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Poslali smo vam email na <strong>{email}</strong> sa linkom za potvrdu prijave.
            </p>
            <p className="text-gray-600 mb-8">
              Kliknite na link u email-u da aktivirate vašu pretplatu na newsletter.
            </p>
            <div className="space-y-4">
              <Link href="/">
                <Button>Vrati se na početnu</Button>
              </Link>
              <p className="text-sm text-gray-500">
                Niste dobili email?{' '}
                <a href="/newsletter/prijava" className="text-[#f9c344] hover:underline">
                  Pokušajte ponovo
                </a>
              </p>
            </div>
          </div>
        )}

        {success && !pending && (
          <div className="bg-white border-2 border-green-200 rounded-xl p-8 md:p-12 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
            <h1 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] mb-4">
              Uspešno ste prijavljeni!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Vaša email adresa <strong>{email}</strong> je potvrđena i aktivirana.
            </p>
            <p className="text-gray-600 mb-8">
              Sada ćete primati email obaveštenja za nova PR saopštenja.
            </p>
            <div className="space-y-4">
              <Link href="/newsletter/upravljanje">
                <Button>Upravljajte pretplatom</Button>
              </Link>
              <Link href="/">
                <Button className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                  Vrati se na početnu
                </Button>
              </Link>
            </div>
          </div>
        )}

        {error && !pending && (
          <div className="bg-white border-2 border-red-200 rounded-xl p-8 md:p-12 text-center">
            <XCircle className="mx-auto mb-4 text-red-600" size={64} />
            <h1 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] mb-4">
              Greška pri potvrdi
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {error || 'Došlo je do greške pri potvrdi vaše prijave.'}
            </p>
            <div className="space-y-4">
              <Link href="/newsletter/prijava">
                <Button>Pokušajte ponovo</Button>
              </Link>
              <Link href="/">
                <Button className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                  Vrati se na početnu
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NewsletterConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pt-32 pb-16">
        <div className="container-custom max-w-4xl text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f9c344] mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Učitavanje...</p>
        </div>
      </div>
    }>
      <NewsletterConfirmationContent />
    </Suspense>
  )
}

