'use client'

import Link from 'next/link'
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
                        <span className="text-xl font-bold text-[#1d1d1f]">Bilbord Hub</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-[auto_auto_auto] justify-between gap-x-12 gap-y-10 text-left text-[#1d1d1f] text-sm">
                    <div>
                        <h4 className="font-semibold mb-3 text-[#1d1d1f]">Info</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-gray-600 hover:text-gray-800">Početna</Link></li>
                            <li><Link href="/pretraga" className="text-gray-600 hover:text-gray-800">Pretraga</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-[#1d1d1f]">PR Portal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/dashboard" className="text-gray-600 hover:text-gray-800">Dashboard</Link></li>
                            <li><Link href="/dashboard/novo" className="text-gray-600 hover:text-gray-800">Novo saopštenje</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-end text-right">
                        <button
                            aria-label="Nazad na vrh"
                            onClick={handleScrollTop}
                            className="mt-4 p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition shadow-sm flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="mt-10 text-center text-xs text-gray-500 px-8 flex items-center justify-center gap-2 flex-wrap">
                    <span>© {new Date().getFullYear()} Bilbord Hub – Centralizovana PR platforma. Sva prava zadržana.</span>
                </div>
            </div>
        </footer>
    )
}

