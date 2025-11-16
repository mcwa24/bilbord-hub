'use client'

import Link from 'next/link'

export default function NewsletterSubscribe() {
  return (
    <Link 
      href="/newsletter/prijava"
      className="inline-block px-8 md:px-10 py-3 md:py-4 bg-[#f9c344] text-[#1d1d1f] font-semibold rounded-full hover:bg-[#f0b830] transition-colors whitespace-nowrap text-base md:text-lg shadow-md"
    >
      Prijavi se na email obaveštenja
    </Link>
  )
}

