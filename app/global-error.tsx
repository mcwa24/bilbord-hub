'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  return (
    <html lang="sr">
      <body>
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center max-w-2xl">
            <h1 className="text-6xl font-bold text-[#1d1d1f] mb-4">Greška</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Došlo je do kritične greške
            </h2>
            <p className="text-gray-600 mb-8">
              Došlo je do greške pri učitavanju aplikacije. Molimo osvežite stranicu.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-[#111827] text-white rounded-lg hover:bg-[#1f2937] transition"
            >
              Pokušaj ponovo
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

