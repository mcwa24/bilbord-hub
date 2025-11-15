'use client'

import Image from 'next/image'

const logos = [
  'aik bank.png',
  'bambi-logo-old-min.png',
  'beogradski trkacki klub.svg',
  'bor hotel.png',
  'Cineplexx-logo.webp',
  'Cinestar_logo.svg',
  'coca-cola-hbc.png',
  'diopta.png',
  'fashion company.jpg',
  'fashion-and-friends.png',
  'fondacija novak djokovic.png',
  'Gorenje_logo.jpg',
  'HBO_logo.svg',
  'hisense-logo.png',
  'huawei-logo-picture-4.png',
  'jysk.png',
  'Mascom-800-450-SAMO-HERMES_1497345915.jpg',
  'MediGroup-logo.png',
  'mts dvorana.png',
  'muzej savremen umetnosti.png',
  'OTP_banka_Srbija.svg.png',
  'Samsung-emblem.png',
  'TLC_Logo.svg.png',
  'UNICEF-logo.png',
  'Warner_Bros._Discovery_(symbol).svg.png',
  'Warnermedia_logo.png',
  'XYZ-share.gif',
  'Yandex_Logo_2021.png',
]

export default function LogoGrid() {
  return (
    <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
      {logos.map((logo, index) => (
        <div
          key={logo}
          className="flex items-center justify-center p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          style={{ 
            height: '120px',
            width: '100%'
          }}
        >
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
            unoptimized={logo.endsWith('.svg') || logo.endsWith('.webp') || logo.endsWith('.gif')}
          />
        </div>
      ))}
    </div>
  )
}

