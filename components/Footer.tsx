'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Instagram } from 'lucide-react'

export default function Footer() {
    const pathname = usePathname()
    const isPrijavaPage = pathname === '/prijava'

    // Sakrij footer na prijava stranici
    if (isPrijavaPage) {
        return null
    }

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
                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.instagram.com/bilbord.rs/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-black hover:opacity-70 transition"
                                aria-label="Instagram"
                            >
                                <Instagram size={24} />
                            </a>
                            <a
                                href="https://x.com/bilbordrs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-black hover:opacity-70 transition"
                                aria-label="X (Twitter)"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>
                            <a
                                href="https://www.threads.com/@bilbord.rs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-black hover:opacity-70 transition"
                                aria-label="Threads"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.001 0C5.373 0 0 5.373 0 12.001c0 6.628 5.373 12.001 12.001 12.001S24.002 18.629 24.002 12.001C24.002 5.373 18.629 0 12.001 0zm0 19.5c-4.136 0-7.5-3.364-7.5-7.5s3.364-7.5 7.5-7.5 7.5 3.364 7.5 7.5-3.364 7.5-7.5 7.5zm-1.5-7.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5zm4.5 0c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5z" transform="rotate(45 12 12)"/>
                                    <path d="M12.001 0C5.373 0 0 5.373 0 12.001c0 6.628 5.373 12.001 12.001 12.001S24.002 18.629 24.002 12.001C24.002 5.373 18.629 0 12.001 0zm0 19.5c-4.136 0-7.5-3.364-7.5-7.5s3.364-7.5 7.5-7.5 7.5 3.364 7.5 7.5-3.364 7.5-7.5 7.5zm-1.5-7.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5zm4.5 0c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5z" transform="rotate(-45 12 12)"/>
                                </svg>
                            </a>
                            <a
                                href="https://www.facebook.com/bilbordportal"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-black hover:opacity-70 transition"
                                aria-label="Facebook"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                        <Link href="/o-pr-platformi" className="text-gray-600 hover:text-gray-800">
                            O PR Platformi
                        </Link>
                        <Link href="https://bilbord.rs/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                            Bilbord Portal
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

