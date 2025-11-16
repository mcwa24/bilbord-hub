'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
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
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-md">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-4 text-center">
          Registracija
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Kreirajte nalog da biste upravljali email obaveštenjima
        </p>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8">
          <form onSubmit={handleRegister} className="space-y-6">
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
                  placeholder="Najmanje 6 karaktera"
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potvrdite lozinku
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ponovite lozinku"
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Registracija...' : 'Registruj se'}
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

