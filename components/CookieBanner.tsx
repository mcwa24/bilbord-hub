'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const COOKIE_CONSENT_KEY = 'bilbord_cookie_consent'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Proveri da li korisnik već ima sačuvan izbor (prihvaćeno ili odbijeno)
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    // Prikaži banner samo ako korisnik nije prihvatio ili odbio (X ne sprečava ponovno prikazivanje)
    if (consent !== 'accepted' && consent !== 'rejected') {
      // Prikaži banner nakon kratke pauze
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    setShowBanner(false)
  }

  const handleClose = () => {
    // Samo zatvori banner bez čuvanja izbora - banner će se ponovo prikazati sledeći put
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40 pointer-events-none"
          />
          
          {/* Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl"
          >
            <div className="container-custom py-6 relative">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Cookie Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#f9c344] rounded-full flex items-center justify-center">
                    <Cookie size={24} className="text-[#1d1d1f]" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">
                    Koristimo kolačiće (cookies)
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Ovaj sajt koristi kolačiće kako bismo vam obezbedili najbolje iskustvo. 
                    Nastavkom korišćenja sajta, slažete se sa našom{' '}
                    <Link 
                      href="/cookie-policy" 
                      className="text-[#1d1d1f] hover:underline font-semibold"
                    >
                      politikom kolačića
                    </Link>
                    .
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
                  <button
                    onClick={handleReject}
                    className="px-6 py-2 text-sm font-medium text-[#1d1d1f] bg-gray-100 hover:bg-gray-200 rounded-lg transition whitespace-nowrap"
                  >
                    Odbij
                  </button>
                  <button
                    onClick={handleAccept}
                    className="px-6 py-2 text-sm font-medium text-white bg-[#1d1d1f] hover:bg-[#333] rounded-lg transition whitespace-nowrap"
                  >
                    Prihvati sve
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
                  aria-label="Zatvori"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

