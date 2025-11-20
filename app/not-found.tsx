import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center">
      <div className="container-custom text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-[#1d1d1f] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Stranica nije pronađena
        </h2>
        <p className="text-gray-600 mb-8">
          Stranica koju tražite ne postoji ili je uklonjena.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button>
              Idi na početnu stranicu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

