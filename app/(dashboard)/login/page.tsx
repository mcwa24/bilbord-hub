'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMagicLink, setIsMagicLink] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        })
        if (error) throw error
        toast.success('Proverite email za magic link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri prijavljivanju')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <h1 className="text-4xl font-bold text-[#1d1d1f] mb-2 text-center">
          PR Portal
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Prijavite se da biste upravljali saopštenjima
        </p>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Email
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.com"
            />
          </div>

          {!isMagicLink && (
            <div>
              <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
                Lozinka
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Učitavanje...' : isMagicLink ? 'Pošalji magic link' : 'Prijavi se'}
          </Button>

          <button
            type="button"
            onClick={() => setIsMagicLink(!isMagicLink)}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
          >
            {isMagicLink ? 'Ili se prijavi sa lozinkom' : 'Ili koristi magic link'}
          </button>
        </form>
      </div>
    </div>
  )
}

