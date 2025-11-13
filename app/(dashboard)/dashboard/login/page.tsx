'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { loginAdmin } from '@/lib/admin'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (loginAdmin(username, password)) {
        toast.success('Uspešno prijavljeni kao admin')
        router.push('/sva-saopstenja')
        router.refresh()
      } else {
        toast.error('Pogrešno korisničko ime ili lozinka')
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
          Admin Prijava
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Prijavite se da biste upravljali saopštenjima
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Korisničko ime
            </label>
            <Input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Korisničko ime"
            />
          </div>

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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Učitavanje...' : 'Prijavi se'}
          </Button>
        </form>
      </div>
    </div>
  )
}

