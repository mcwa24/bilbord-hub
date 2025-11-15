'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback } from 'react'

export default function Footer() {
    const handleScrollTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    return (
        <footer className="w-full border-t border-gray-200 bg-white py-12">
            <div className="max-w-6xl mx-auto px-8">

                    <div className="mb-10 flex items-center justify-between">
                        <Link href="/">
                            <Image
                                src="/FINAL LOGO BILBORD-06.png"
                                alt="Bilbord Hub Logo"
                                width={160}
                                height={56}
                                className="object-contain h-[35px] md:h-[40px] w-auto"
                            />
                        </Link>
                    </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                        <Link href="/o-pr-platformi" className="text-gray-600 hover:text-gray-800">
                            O PR Platformi
                        </Link>
                        <Link href="/cookie-policy" className="text-gray-600 hover:text-gray-800">
                            Cookie Policy
                        </Link>
                        <Link href="/pravila-privatnosti" className="text-gray-600 hover:text-gray-800">
                            Privacy Policy
                        </Link>
                        <Link href="/uslovi" className="text-gray-600 hover:text-gray-800">
                            Uslovi Poslovanja
                        </Link>
                        <Link href="https://bilbord.rs/pretplate/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                            Cene
                        </Link>
                        <Link href="https://bilbord.rs/kontakt/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                            Kontakt
                        </Link>
                    </div>

                    <button
                        aria-label="Nazad na vrh"
                        onClick={handleScrollTop}
                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition shadow-sm flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                </div>

                <div className="mt-10 text-center text-xs text-gray-500 px-8 flex items-center justify-center gap-2 flex-wrap">
                    <span>© {new Date().getFullYear()} Bilbord Hub – Centralizovana PR platforma. Sva prava zadržana.</span>
                </div>
            </div>
        </footer>
    )
}

