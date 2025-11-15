import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bilbord Hub | Centralizovana PR platforma",
  description: "Bilbord Hub je centralizovana PR platforma na kojoj PR agencije i kompanije postavljaju svoja saopštenja, a mediji ih preuzimaju.",
  keywords: "PR platforma, PR saopštenja, mediji, press release, PR agencije",
  icons: {
    icon: '/FINAL LOGO BILBORD-01.png',
    shortcut: '/FINAL LOGO BILBORD-01.png',
    apple: '/FINAL LOGO BILBORD-01.png',
  },
  openGraph: {
    title: "Bilbord Hub | Centralizovana PR platforma",
    description: "Bilbord Hub je centralizovana PR platforma na kojoj PR agencije i kompanije postavljaju svoja saopštenja, a mediji ih preuzimaju.",
    images: [
      {
        url: '/vanilla-bear-films-JEwNQerg3Hs-unsplash_Bilbord_Portal.jpg',
        width: 1200,
        height: 630,
        alt: 'Bilbord Hub - Centralizovana PR platforma',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bilbord Hub | Centralizovana PR platforma",
    description: "Bilbord Hub je centralizovana PR platforma na kojoj PR agencije i kompanije postavljaju svoja saopštenja, a mediji ih preuzimaju.",
    images: ['/vanilla-bear-films-JEwNQerg3Hs-unsplash_Bilbord_Portal.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className={inter.className}>
        <Script
          defer
          src="https://indigo-slug.pikapod.net/script.js"
          data-website-id="f1273d31-c664-463e-8c72-b16f85911138"
          strategy="afterInteractive"
        />
        <Header />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

