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
    icon: '/21150324_764549870419530_5822848782914038843_n.png',
    shortcut: '/21150324_764549870419530_5822848782914038843_n.png',
    apple: '/21150324_764549870419530_5822848782914038843_n.png',
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

