import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bilbord-hub.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Bilbord Hub | Centralizovana PR platforma",
  description: "Bilbord Hub je centralizovana PR platforma na kojoj PR agencije i kompanije postavljaju svoja saopštenja, a mediji ih preuzimaju.",
  keywords: "PR platforma, PR saopštenja, mediji, press release, PR agencije",
  authors: [{ name: "Bilbord Hub" }],
  creator: "Bilbord Hub",
  publisher: "Bilbord Hub",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/FINAL LOGO BILBORD-01.png',
    shortcut: '/FINAL LOGO BILBORD-01.png',
    apple: '/FINAL LOGO BILBORD-01.png',
  },
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: siteUrl,
    siteName: 'Bilbord Hub',
    title: "Bilbord Hub | Centralizovana PR platforma",
    description: "Bilbord Hub je centralizovana PR platforma na kojoj PR agencije i kompanije postavljaju svoja saopštenja, a mediji ih preuzimaju.",
    images: [
      {
        url: `${siteUrl}/vanilla-bear-films-JEwNQerg3Hs-unsplash_Bilbord_Portal.jpg`,
        width: 1200,
        height: 630,
        alt: 'Bilbord Hub - Centralizovana PR platforma',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bilbord Hub | Centralizovana PR platforma",
    description: "Bilbord Hub je centralizovana PR platforma na kojoj PR agencije i kompanije postavljaju svoja saopštenja, a mediji ih preuzimaju.",
    images: [`${siteUrl}/vanilla-bear-films-JEwNQerg3Hs-unsplash_Bilbord_Portal.jpg`],
    creator: '@bilbordhub',
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Dodaj verifikacione kodove kada budu dostupni
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
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
          src="https://cinnamon-bloodhound.pikapod.net/script.js"
          data-website-id="ee3ce941-ec38-4af8-ae47-080442c22382"
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

