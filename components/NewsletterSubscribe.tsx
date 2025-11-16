'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NewsletterSubscribe() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    } catch (error) {
      setIsLoggedIn(false)
    }
  }

  if (isLoggedIn) {
    return (
      <Link 
        href="/moj-panel"
        className="inline-block px-8 md:px-10 py-3 md:py-4 bg-[#f9c344] text-[#1d1d1f] font-semibold rounded-full hover:bg-[#f0b830] transition-colors whitespace-nowrap text-base md:text-lg shadow-md"
      >
        Moj Panel
      </Link>
    )
  }

  return (
    <Link 
      href="/registracija"
      className="inline-block px-8 md:px-10 py-3 md:py-4 bg-[#f9c344] text-[#1d1d1f] font-semibold rounded-full hover:bg-[#f0b830] transition-colors whitespace-nowrap text-base md:text-lg shadow-md"
    >
      Prijavi se na email obaveštenja
    </Link>
  )
}

