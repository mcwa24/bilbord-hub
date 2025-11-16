'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('Unesite validan email')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        if (data.message && data.message.includes('Već ste prijavljeni')) {
          toast.success('Već ste prijavljeni na email obaveštenja!')
        } else {
          toast.success('Proverite vaš email za potvrdu prijave!')
        }
        setEmail('')
      } else {
        throw new Error(data.error || 'Greška pri prijavi')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri prijavi na email obaveštenja')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Unesite vašu email adresu"
        className="flex-1"
        required
        disabled={loading}
      />
      <Button
        type="submit"
        disabled={loading}
        className="px-8 py-3 bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f] font-semibold rounded-full whitespace-nowrap shadow-md"
      >
        {loading ? 'Prijava...' : 'Prijavi se'}
      </Button>
    </form>
  )
}
