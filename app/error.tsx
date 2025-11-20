'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center">
      <div className="container-custom text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-[#1d1d1f] mb-4">Greška</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Nešto je pošlo po zlu
        </h2>
        <p className="text-gray-600 mb-8">
          Došlo je do greške pri učitavanju stranice. Molimo pokušajte ponovo.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>
            Pokušaj ponovo
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            Idi na početnu
          </Button>
        </div>
      </div>
    </div>
  )
}

