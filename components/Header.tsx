"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <header className={`w-full ${isDashboard ? 'bg-white border-b border-gray-200' : 'bg-transparent absolute top-0 left-0 right-0'} z-50`}>
      <div className="w-full">
        <div className="w-full px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-2xl font-bold text-[#1d1d1f]">Bilbord Hub</span>
            </Link>
          </div>

          <nav className="hidden xl:flex items-center gap-6 text-sm md:text-base relative">
            {!isDashboard && (
              <>
                <Link
                  href="/"
                  className={`${pathname === "/" ? "underline font-semibold" : ""} text-[#1d1d1f] hover:underline transition`}
                >
                  Početna
                </Link>
                <Link
                  href="/pretraga"
                  className={`${pathname === "/pretraga" ? "underline font-semibold" : ""} text-[#1d1d1f] hover:underline transition`}
                >
                  Pretraga
                </Link>
                <Link
                  href="/sva-saopstenja"
                  className={`${pathname === "/sva-saopstenja" ? "underline font-semibold" : ""} text-[#1d1d1f] hover:underline transition`}
                >
                  PR Saopštenja
                </Link>
                <Link
                  href="/dashboard/admin"
                  className={`${pathname === "/dashboard/admin" ? "underline font-semibold" : ""} text-[#1d1d1f] hover:underline transition`}
                >
                  Upload fajlova
                </Link>
              </>
            )}
            
            {isDashboard ? (
              <>
                <Link
                  href="/dashboard"
                  className={`${pathname === "/dashboard" ? "underline font-semibold" : ""} text-[#1d1d1f] hover:underline transition`}
                >
                  Moja saopštenja
                </Link>
                <Link
                  href="/dashboard/novo"
                  className={`${pathname === "/dashboard/novo" ? "underline font-semibold" : ""} text-[#1d1d1f] hover:underline transition`}
                >
                  Novo saopštenje
                </Link>
                <Link
                  href="/dashboard/admin"
                  className={`${pathname === "/dashboard/admin" ? "underline font-semibold" : ""} text-[#1d1d1f] hover:underline transition`}
                >
                  Upload fajlova
                </Link>
                <Link
                  href="/dashboard/statistika"
                  className={`${pathname === "/dashboard/statistika" ? "underline font-semibold" : ""} text-[#1d1d1f] hover:underline transition`}
                >
                  Statistika
                </Link>
                <Link
                  href="/api/auth/logout"
                  className="ml-2 px-8 py-4 rounded-full text-base font-medium text-[#1d1d1f] bg-[#f9c344] hover:bg-[#f0b830] transition"
                >
                  Odjavi se
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="ml-2 px-8 py-4 rounded-full text-base font-medium text-[#1d1d1f] bg-[#f9c344] hover:bg-[#f0b830] transition"
              >
                PR Portal
              </Link>
            )}
          </nav>

          <div className="xl:hidden z-50">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} className="text-[#1d1d1f]" /> : <Menu size={24} className="text-[#1d1d1f]" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="xl:hidden fixed inset-0 bg-black/20 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                className="xl:hidden fixed top-4 right-4 w-80 bg-white shadow-2xl z-50 rounded-2xl"
              >
                <div className="p-6 pb-6">
                  <div className="flex justify-end mb-6">
                    <button 
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                      aria-label="Close menu"
                    >
                      <X size={24} className="text-[#1d1d1f]" />
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    {!isDashboard && (
                      <>
                        <Link
                          href="/"
                          onClick={() => setIsMenuOpen(false)}
                          className={`${pathname === "/" ? "underline font-semibold" : ""} block text-[#1d1d1f] py-2 px-2 text-base rounded-md hover:bg-gray-50 transition`}
                        >
                          Početna
                        </Link>
                        <Link
                          href="/pretraga"
                          onClick={() => setIsMenuOpen(false)}
                          className={`${pathname === "/pretraga" ? "underline font-semibold" : ""} block text-[#1d1d1f] py-2 px-2 text-base rounded-md hover:bg-gray-50 transition`}
                        >
                          Pretraga
                        </Link>
                        <Link
                          href="/sva-saopstenja"
                          onClick={() => setIsMenuOpen(false)}
                          className={`${pathname === "/sva-saopstenja" ? "underline font-semibold" : ""} block text-[#1d1d1f] py-2 px-2 text-base rounded-md hover:bg-gray-50 transition`}
                        >
                          PR Saopštenja
                        </Link>
                        <Link
                          href="/dashboard/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className={`${pathname === "/dashboard/admin" ? "underline font-semibold" : ""} block text-[#1d1d1f] py-2 px-2 text-base rounded-md hover:bg-gray-50 transition`}
                        >
                          Upload fajlova
                        </Link>
                      </>
                    )}
                    
                    {isDashboard ? (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className={`${pathname === "/dashboard" ? "underline font-semibold" : ""} block text-[#1d1d1f] py-2 px-2 text-base rounded-md hover:bg-gray-50 transition`}
                        >
                          Moja saopštenja
                        </Link>
                        <Link
                          href="/dashboard/novo"
                          onClick={() => setIsMenuOpen(false)}
                          className={`${pathname === "/dashboard/novo" ? "underline font-semibold" : ""} block text-[#1d1d1f] py-2 px-2 text-base rounded-md hover:bg-gray-50 transition`}
                        >
                          Novo saopštenje
                        </Link>
                        <Link
                          href="/dashboard/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className={`${pathname === "/dashboard/admin" ? "underline font-semibold" : ""} block text-[#1d1d1f] py-2 px-2 text-base rounded-md hover:bg-gray-50 transition`}
                        >
                          Upload fajlova
                        </Link>
                        <Link
                          href="/dashboard/statistika"
                          onClick={() => setIsMenuOpen(false)}
                          className={`${pathname === "/dashboard/statistika" ? "underline font-semibold" : ""} block text-[#1d1d1f] py-2 px-2 text-base rounded-md hover:bg-gray-50 transition`}
                        >
                          Statistika
                        </Link>
                        <Link
                          href="/api/auth/logout"
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-[#1d1d1f] py-2 px-2 text-base rounded-md hover:bg-gray-50 transition"
                        >
                          Odjavi se
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-[#1d1d1f] py-2 px-2 text-base rounded-md hover:bg-gray-50 transition"
                      >
                        PR Portal
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

