'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email')
  
  const [email, setEmail] = useState(emailParam || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('Unesite validan email')
      return
    }

    if (!password) {
      toast.error('Unesite lozinku')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        toast.success('Uspešno ste se prijavili!')
        router.push('/moj-panel')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri prijavi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-md">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-4 text-center">
          Prijava
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Prijavite se da biste upravljali email obaveštenjima
        </p>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email adresa
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lozinka
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Unesite lozinku"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Prijava...' : 'Prijavi se'}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-gray-600">
              Nemate nalog?{' '}
              <a href="/registracija" className="text-[#f9c344] hover:underline font-medium">
                Registrujte se
              </a>
            </p>
            <p className="text-sm text-gray-600">
              <a href="/zaboravljena-lozinka" className="text-[#f9c344] hover:underline">
                Zaboravili ste lozinku?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

