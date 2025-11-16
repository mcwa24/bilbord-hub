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
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
        
        toast.success('Registracija uspešna! Proverite vaš email za potvrdu.')
        router.push('/prijava?email=' + encodeURIComponent(email))
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Već imate nalog?{' '}
              <a href="/prijava" className="text-[#f9c344] hover:underline font-medium">
                Prijavite se
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
