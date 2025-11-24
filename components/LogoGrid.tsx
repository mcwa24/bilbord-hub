'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const logos = [
  // Prvi red - 10 logoa
  'aik bank.png',
  'avokado.png',
  'bambi-logo-old-min.png',
  'beldocs.jpg',
  'beogradski trkacki klub.svg',
  'bor hotel.png',
  'Cineplexx-logo.webp',
  'Cinestar_logo.svg',
  'coca-cola-hbc.png',
  'diopta.png',
  // Drugi red - 10 logoa
  'dom_omladine.jpg',
  'fashion company.jpg',
  'fashion-and-friends.png',
  'fest.png',
  'fondacija novak djokovic.png',
  'Gorenje_logo.jpg',
  'HBO_logo.svg',
  'hisense-logo.png',
  'huawei-logo-picture-4.png',
  'italija.png',
  // Treći red - 10 logoa
  'jysk.png',
  'kcb-logo-bw.png',
  'kominik_art.jpeg',
  'Mascom-800-450-SAMO-HERMES_1497345915.jpg',
  'Mastercard-logo.svg.png',
  'MediGroup-logo.png',
  'mts dvorana.png',
  'muzej savremen umetnosti.png',
  'OTP_banka_Srbija.svg.png',
  'palic.jpg',
  // Četvrti red - 10 logoa
  'pro_pr.jpeg',
  'sarajevo.png',
  'Samsung-emblem.png',
  'TLC_Logo.svg.png',
  'UNICEF-logo.png',
  'walter.webp',
  'Warner_Bros._Discovery_(symbol).svg.png',
  'Warnermedia_logo.png',
  'XYZ-share.gif',
  'Yandex_Logo_2021.png',
]

function GifFirstFrame({ logo, index }: { logo: string; index: number }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  useEffect(() => {
    const img = document.createElement('img')
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          setImageSrc(canvas.toDataURL('image/png'))
        }
      } catch (error) {
        // Fallback na originalni GIF ako canvas ne radi
        setImageSrc(`/logos/${logo}`)
      }
    }
    img.onerror = () => {
      setImageSrc(`/logos/${logo}`)
    }
    img.src = `/logos/${logo}`
  }, [logo])

  if (!imageSrc) {
    return null
  }

  return (
    <img
      src={imageSrc}
      alt={`Partner logo ${index + 1}`}
      className="object-contain"
      style={{ 
        maxWidth: '90%', 
        maxHeight: '90%',
        width: 'auto',
        height: 'auto'
      }}
      loading={index < 6 ? "eager" : "lazy"}
    />
  )
}

export default function LogoGrid() {
  return (
    <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10 gap-0">
      {logos.map((logo, index) => (
        <div
          key={logo}
          className="flex items-center justify-center p-2 bg-white rounded-lg pointer-events-none"
          style={{ 
            height: '120px',
            width: '100%'
          }}
        >
          {logo.endsWith('.gif') ? (
            <GifFirstFrame logo={logo} index={index} />
          ) : (
            <Image
              src={`/logos/${logo}`}
              alt={`Partner logo ${index + 1}`}
              width={100}
              height={80}
              className="object-contain"
              style={{ 
                maxWidth: '90%', 
                maxHeight: '90%',
                width: 'auto',
                height: 'auto'
              }}
              loading={index < 6 ? "eager" : "lazy"}
              unoptimized={logo.endsWith('.svg') || logo.endsWith('.webp')}
            />
          )}
        </div>
      ))}
    </div>
  )
}

