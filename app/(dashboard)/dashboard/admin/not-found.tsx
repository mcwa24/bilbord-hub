export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#1d1d1f] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Stranica nije pronađena</h2>
        <p className="text-gray-600 mb-8">Stranica koju tražite ne postoji.</p>
        <a 
          href="/prijava" 
          className="inline-block px-8 py-3 bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f] font-semibold rounded-full transition"
        >
          Vrati se na prijavu
        </a>
      </div>
    </div>
  )
}

