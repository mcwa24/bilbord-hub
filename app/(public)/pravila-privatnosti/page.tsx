'use client'

import { useState } from 'react'

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState<'sr' | 'en'>('sr')

  const content = {
    sr: {
      title: 'Privacy Policy',
      effectiveDate: 'Datum stupanja na snagu: 13. novembar 2024',
      intro: 'Hvala vam što ste posetili bilbord.rs ("Veb stranica"). Ova Pravila o privatnosti objašnjavaju kako prikupljamo, koristimo i otkrivamo podatke o vama kada koristite našu web stranicu.',
      intro2: 'Poštujemo vašu privatnost i predani smo zaštiti vaših osobnih podataka. Pažljivo pročitajte ovu Politiku privatnosti kako biste razumjeli našu praksu u vezi s vašim osobnim podacima i kako ćemo s njima postupati.',
      collect: {
        title: 'Informacije koje prikupljamo',
        text: 'Od vas možemo prikupljati osobne podatke kada posjetite našu web stranicu, registrirate se na web stranici, pretplatite se na naš bilten, ispunite obrazac ili odgovorite na anketu. Osobni podaci koje možemo prikupiti uključuju:',
        items: [
          'Tvoje ime',
          'Vaša email adresa',
          'Vaš broj telefona',
          'Vaša adresa',
          'Vaša IP adresa',
          'Informacije o vašem pregledniku',
          'Informacije o vašem uređaju',
          'Ostale informacije koje nam dostavite'
        ]
      },
      use: {
        title: 'Kako koristimo vaše podatke',
        text: 'Osobne podatke koje prikupljamo od vas možemo koristiti u razne svrhe, uključujući:',
        items: [
          'Za poboljšanje naše web stranice i usluga koje nudimo',
          'Da odgovorimo na vaše upite, zahtjeve i komentare',
          'Za slanje marketinških i promotivnih e-poruka',
          'Kako bismo personalizirali vaše iskustvo na našoj web stranici',
          'Za provođenje anketa i istraživanja',
          'Za poštivanje zakonskih obveza'
        ],
        share: 'Vaše osobne podatke možemo podijeliti s pružateljima usluga trećih strana koji obavljaju usluge u naše ime, kao što su hosting web stranica, isporuka e-pošte i analiza podataka. Od pružatelja usluga trećih strana zahtijevamo da koriste vaše osobne podatke samo za pružanje usluga za koje smo ih ugovorili i za održavanje povjerljivosti i sigurnosti vaših osobnih podataka.',
        disclose: 'Također možemo otkriti vaše osobne podatke trećim stranama kada vjerujemo da je takvo otkrivanje potrebno za poštivanje primjenjivih zakona, propisa ili pravnih procesa ili za zaštitu naših prava, imovine ili sigurnosti ili prava, imovine ili sigurnosti drugih.'
      },
      cookies: {
        title: 'Kolačići i druge tehnologije praćenja',
        text: 'Koristimo kolačiće i druge tehnologije praćenja na našoj web stranici kako bismo prikupili informacije o vašem ponašanju pregledavanja i obrascima korištenja. Kolačići su male datoteke koje se pohranjuju na vaš uređaj kada posjetite web stranicu. Omogućuju nam prepoznavanje vašeg uređaja i pamćenje vaših preferencija i postavki.',
        control: 'Kolačiće možete kontrolirati putem postavki preglednika. Međutim, ako odlučite onemogućiti kolačiće, neke značajke naše web stranice možda neće ispravno funkcionirati.'
      },
      choices: {
        title: 'Vaši izbori',
        text: 'Možete odlučiti isključiti primanje marketinških i promotivnih e-poruka od nas slijedeći upute navedene u e-poruci. Također se možete odjaviti s našeg newslettera klikom na poveznicu za odjavu pri dnu e-pošte.',
        rights: 'Također možete imati pravo na pristup, ispravak ili brisanje svojih osobnih podataka. Ako želite ostvariti bilo koje od ovih prava, obratite nam se na kontakt strani.'
      },
      security: {
        title: 'Sigurnost',
        text: 'Poduzimamo razumne mjere kako bismo zaštitili vaše osobne podatke od neovlaštenog pristupa, korištenja i otkrivanja. Međutim, nijedna metoda prijenosa putem interneta ili metoda elektroničke pohrane nije 100% sigurna. Stoga ne možemo jamčiti apsolutnu sigurnost vaših osobnih podataka.'
      },
      changes: {
        title: 'Promjene ovih Pravila privatnosti',
        text: 'S vremena na vrijeme možemo ažurirati ovu Politiku privatnosti. Ako napravimo bilo kakve materijalne promjene, obavijestit ćemo vas objavljivanjem ažuriranih Pravila o privatnosti na našem web-mjestu i ažuriranjem "Datuma stupanja na snagu" na vrhu ove stranice.'
      },
      contact: {
        title: 'Kontaktirajte nas',
        text: 'Ukoliko imate pitanja ili nedoumica u vezi sa ovom Politikom privatnosti, kontaktirajte nas.'
      }
    },
    en: {
      title: 'Privacy Policy',
      effectiveDate: 'Effective Date: November 13, 2024',
      intro: 'Thank you for visiting bilbord.rs (the "Website"). This Privacy Policy explains how we collect, use, and disclose information about you when you use our Website.',
      intro2: 'We respect your privacy and are committed to protecting your personal information. Please read this Privacy Policy carefully to understand our practices regarding your personal information and how we will treat it.',
      collect: {
        title: 'Information We Collect',
        text: 'We may collect personal information from you when you visit our Website, register on the Website, subscribe to our newsletter, fill out a form, or respond to a survey. The personal information we may collect includes:',
        items: [
          'Your name',
          'Your email address',
          'Your phone number',
          'Your address',
          'Your IP address',
          'Your browser information',
          'Your device information',
          'Other information you provide to us'
        ]
      },
      use: {
        title: 'How We Use Your Information',
        text: 'We may use the personal information we collect from you for various purposes, including:',
        items: [
          'To improve our Website and the services we offer',
          'To respond to your inquiries, requests, and comments',
          'To send you marketing and promotional emails',
          'To personalize your experience on our Website',
          'To conduct surveys and research',
          'To comply with legal obligations'
        ],
        share: 'We may share your personal information with third-party service providers who perform services on our behalf, such as website hosting, email delivery, and data analysis. We require these third-party service providers to use your personal information only to provide the services we have contracted them for and to maintain the confidentiality and security of your personal information.',
        disclose: 'We may also disclose your personal information to third parties when we believe such disclosure is necessary to comply with applicable laws, regulations, or legal processes or to protect our rights, property, or safety or the rights, property, or safety of others.'
      },
      cookies: {
        title: 'Cookies and Other Tracking Technologies',
        text: 'We use cookies and other tracking technologies on our Website to collect information about your browsing behavior and usage patterns. Cookies are small files that are stored on your device when you visit a website. They allow us to recognize your device and remember your preferences and settings.',
        control: 'You can control cookies through your browser settings. However, if you choose to disable cookies, some features of our Website may not function properly.'
      },
      choices: {
        title: 'Your Choices',
        text: 'You may choose to opt-out of receiving marketing and promotional emails from us by following the instructions provided in the email. You may also choose to unsubscribe from our newsletter by clicking on the unsubscribe link at the bottom of the email.',
        rights: 'You may also have the right to access, correct, or delete your personal information. If you wish to exercise any of these rights, please contact us.'
      },
      security: {
        title: 'Security',
        text: 'We take reasonable measures to protect your personal information from unauthorized access, use, and disclosure. However, no method of transmission over the Internet or method of electronic storage is 100% secure. Therefore, we cannot guarantee the absolute security of your personal information.'
      },
      changes: {
        title: 'Changes to this Privacy Policy',
        text: 'We may update this Privacy Policy from time to time. If we make any material changes, we will notify you by posting the updated Privacy Policy on our Website and updating the "Effective Date" at the top of this page.'
      },
      contact: {
        title: 'Contact Us',
        text: 'If you have any questions or concerns about this Privacy Policy, please contact us.'
      }
    }
  }

  const currentContent = content[language]

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f]">
            {currentContent.title}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('sr')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                language === 'sr'
                  ? 'bg-[#f9c344] text-[#1d1d1f]'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Srpski
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                language === 'en'
                  ? 'bg-[#f9c344] text-[#1d1d1f]'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="prose prose-lg max-w-none text-[#1d1d1f]">
          <p className="text-sm text-gray-500 mb-8">{currentContent.effectiveDate}</p>
          
          <p className="mb-4">{currentContent.intro}</p>
          <p className="mb-6">{currentContent.intro2}</p>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.collect.title}
          </h2>
          <p className="mb-4">{currentContent.collect.text}</p>
          <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
            {currentContent.collect.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.use.title}
          </h2>
          <p className="mb-4">{currentContent.use.text}</p>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
            {currentContent.use.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="mb-4">{currentContent.use.share}</p>
          <p className="mb-6">{currentContent.use.disclose}</p>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.cookies.title}
          </h2>
          <p className="mb-4">{currentContent.cookies.text}</p>
          <p className="mb-6">{currentContent.cookies.control}</p>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.choices.title}
          </h2>
          <p className="mb-4">{currentContent.choices.text}</p>
          <p className="mb-6">{currentContent.choices.rights}</p>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.security.title}
          </h2>
          <p className="mb-6">{currentContent.security.text}</p>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.changes.title}
          </h2>
          <p className="mb-6">{currentContent.changes.text}</p>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.contact.title}
          </h2>
          <p className="mb-6">{currentContent.contact.text}</p>
        </div>
      </div>
    </div>
  )
}
