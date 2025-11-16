'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('Unesite validan email')
      return
    }

    if (password.length < 6) {
      toast.error('Lozinka mora imati najmanje 6 karaktera')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Lozinke se ne poklapaju')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      
      // Koristi produkcijski URL za email redirect, ne localhost
      const siteUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'https://hub.bilbord.rs'
        : (process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.bilbord.rs')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl.replace(/\/$/, '')}/auth/callback`,
        },
      })

      if (error) throw error

      if (data.user) {
        // Poveži subscription sa user_id ako postoji
        try {
          await fetch('/api/newsletter/link-user-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          // Ignoriši grešku - nije kritično
          console.error('Error linking subscription:', err)
        }
        
        setRegistrationSuccess(true)
        toast.success('Registracija uspešna!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri registraciji')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Leva strana - Slika */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/vanilla-bear-films-JEwNQerg3Hs-unsplash_Bilbord_Portal.jpg"
          alt="Bilbord"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Desna strana - Forma */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-[#1d1d1f] mb-2">
              Klijent
            </h1>
            <h2 className="text-3xl font-bold text-[#1d1d1f]">
              Registracija
            </h2>
          </div>

          {registrationSuccess ? (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#1d1d1f] mb-3">
                  Registracija uspešna!
                </h3>
                <p className="text-gray-700 mb-4 text-lg">
                  Verifikacioni email je poslat na adresu:
                </p>
                <p className="text-[#1d1d1f] font-semibold mb-6 text-lg">
                  {email}
                </p>
                <p className="text-gray-700 mb-6">
                  Molimo proverite vašu email poštu i kliknite na link za verifikaciju naloga.
                </p>
                <Button
                  onClick={() => router.push('/prijava?email=' + encodeURIComponent(email))}
                  className="w-full bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f] font-medium rounded-lg py-3"
                >
                  Idi na prijavu
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                Email adresa
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="unesite@email.com"
                className="w-full bg-gray-100 rounded-lg border-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                Lozinka
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Najmanje 6 karaktera"
                className="w-full bg-gray-100 rounded-lg border-none"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                Potvrdite lozinku
              </label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ponovite lozinku"
                className="w-full bg-gray-100 rounded-lg border-none"
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f] font-medium rounded-lg py-3" 
              disabled={loading}
            >
              {loading ? 'Učitavanje...' : 'Nastavak'}
            </Button>
          </form>
          )}

          {!registrationSuccess && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Već imate nalog?{' '}
                <a href="/prijava" className="text-[#f9c344] hover:underline font-medium">
                  Prijavite se
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
