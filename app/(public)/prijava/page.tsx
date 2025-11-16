'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { setAdminSession } from '@/lib/admin'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email')
  
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [email, setEmail] = useState(emailParam || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (locked) {
      toast.error('Previše neuspešnih pokušaja. Pokušajte ponovo kasnije.')
      return
    }
    
    setLoading(true)
    setRemainingAttempts(null)

    try {
      // Prvo pokušaj admin login
      const adminRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      })
      
      const adminData = await adminRes.json()
      
      if (adminRes.ok && adminData.success) {
        // Admin login uspešan
        setAdminSession(true)
        toast.success('Uspešno prijavljeni kao admin')
        router.push('/dashboard/admin')
        router.refresh()
        return
      }

      // Ako nije admin, pokušaj user login (Supabase)
      if (email.includes('@')) {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          // Ako je admin lockout, prikaži to
          if (adminData.locked) {
            setLocked(true)
            const timeMatch = adminData.error.match(/(\d+)\s+minuta/)
            if (timeMatch) {
              setLockoutTime(parseInt(timeMatch[1]))
            }
            toast.error(adminData.error)
          } else {
            toast.error(error.message || 'Pogrešno korisničko ime ili lozinka')
          }
        } else if (data.user) {
          // User login uspešan - poveži subscription sa user_id ako postoji
          try {
            await fetch('/api/newsletter/link-user-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            })
          } catch (err) {
            // Ignoriši grešku - nije kritično
            console.error('Error linking subscription:', err)
          }
          
          toast.success('Uspešno ste se prijavili!')
          router.push('/moj-panel')
        }
      } else {
        // Ako nije email format i admin login nije uspeo
        if (adminData.locked) {
          setLocked(true)
          const timeMatch = adminData.error.match(/(\d+)\s+minuta/)
          if (timeMatch) {
            setLockoutTime(parseInt(timeMatch[1]))
          }
          toast.error(adminData.error)
        } else if (adminData.remainingAttempts !== undefined) {
          setRemainingAttempts(adminData.remainingAttempts)
          if (adminData.remainingAttempts > 0) {
            toast.error(`${adminData.error}. Preostalo pokušaja: ${adminData.remainingAttempts}`)
          } else {
            toast.error(adminData.error)
          }
        } else {
          toast.error('Unesite validan email za korisnički nalog ili admin credentials')
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri prijavljivanju')
    } finally {
      setLoading(false)
    }
  }

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
        setIsRegisterMode(false)
        setPassword('')
        setConfirmPassword('')
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
              {isRegisterMode ? 'Registracija' : 'Prijava na sistem'}
            </h2>
          </div>

          {/* Tabovi za prebacivanje između prijave i registracije */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false)
                setPassword('')
                setConfirmPassword('')
                setRemainingAttempts(null)
                setLocked(false)
              }}
              className={`pb-3 px-2 font-medium transition ${
                !isRegisterMode
                  ? 'text-[#1d1d1f] border-b-2 border-[#f9c344]'
                  : 'text-gray-500 hover:text-[#1d1d1f]'
              }`}
            >
              Prijava
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true)
                setPassword('')
                setConfirmPassword('')
                setRemainingAttempts(null)
                setLocked(false)
              }}
              className={`pb-3 px-2 font-medium transition ${
                isRegisterMode
                  ? 'text-[#1d1d1f] border-b-2 border-[#f9c344]'
                  : 'text-gray-500 hover:text-[#1d1d1f]'
              }`}
            >
              Registracija
            </button>
          </div>

          {isRegisterMode ? (
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
                {loading ? 'Učitavanje...' : 'Registruj se'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                  Email ili korisničko ime
                </label>
                <Input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email ili korisničko ime"
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
                  placeholder="Lozinka"
                  className="w-full bg-gray-100 rounded-lg border-none"
                />
              </div>

              {locked && lockoutTime && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  Previše neuspešnih pokušaja. Pokušajte ponovo za {lockoutTime} minuta.
                </div>
              )}
              
              {remainingAttempts !== null && remainingAttempts > 0 && !locked && (
                <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                  Preostalo pokušaja: {remainingAttempts}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f] font-medium rounded-lg py-3" 
                disabled={loading || locked}
              >
                {loading ? 'Učitavanje...' : locked ? 'Zaključano' : 'Nastavak'}
              </Button>
            </form>
          )}

          <div className="mt-6 space-y-3 text-center">
            {!isRegisterMode && (
              <>
                <p className="text-sm text-gray-600">
                  Nemate nalog?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="text-[#f9c344] hover:underline font-medium"
                  >
                    Registrujte se
                  </button>
                </p>
                <p className="text-sm text-gray-600">
                  <a href="/zaboravljena-lozinka" className="text-[#f9c344] hover:underline">
                    Zaboravili ste lozinku?
                  </a>
                </p>
              </>
            )}
            {isRegisterMode && (
              <p className="text-sm text-gray-600">
                Već imate nalog?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-[#f9c344] hover:underline font-medium"
                >
                  Prijavite se
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f9c344] mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Učitavanje...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
