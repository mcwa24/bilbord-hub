'use client'

import { useState } from 'react'

export default function CookiePolicyPage() {
  const [language, setLanguage] = useState<'sr' | 'en'>('sr')

  const content = {
    sr: {
      title: 'Cookie Policy',
      effectiveDate: 'Datum stupanja na snagu: 13. novembar 2024',
      intro: 'Ova Pravila o kolačićima objašnjavaju kako bilbord.rs ("Web stranica") koristi kolačiće i druge tehnologije praćenja za prikupljanje informacija o vašem ponašanju pregledavanja i obrascima korištenja.',
      whatAreCookies: {
        title: 'Što su kolačići?',
        text: 'Kolačići su male datoteke koje se pohranjuju na vaš uređaj kada posjetite web stranicu. Omogućuju web stranici da prepozna vaš uređaj i zapamti vaše preferencije i postavke.'
      },
      types: {
        title: 'Vrste kolačića koje koristimo',
        text: 'Na našoj web stranici koristimo sljedeće vrste kolačića:',
        essential: 'Neophodni kolačići: Ovi kolačići su neophodni za pravilno funkcioniranje web stranice. Omogućuju vam navigaciju web-stranicom i korištenje njezinih značajki.',
        performance: 'Kolačići za rad: Ovi kolačići prikupljaju informacije o tome kako posjetitelji koriste našu web stranicu, kao što su stranice koje se najviše posjećuju i koje poveznice se klikaju. Oni nam pomažu poboljšati izvedbu naše web stranice.',
        functional: 'Funkcionalni kolačići: Ovi kolačići omogućuju web-mjestu da zapamti vaše postavke i postavke, kao što su postavke jezika i veličina fonta.',
        advertising: 'Oglašavački kolačići: Ovi se kolačići koriste za isporuku prilagođenih oglasa na temelju vašeg ponašanja i interesa prilikom pregledavanja.',
        social: 'Kolačići društvenih medija: Ovi se kolačići koriste za omogućavanje dijeljenja društvenih medija i interakcije s platformama društvenih medija.'
      },
      thirdParty: {
        title: 'Kolačići treće strane',
        text: 'Također možemo koristiti kolačiće trećih strana na našoj web stranici. Ove kolačiće postavljaju pružatelji usluga trećih strana, kao što su Google Analytics i platforme društvenih medija.'
      },
      control: {
        title: 'Kako kontrolirati kolačiće',
        text: 'Kolačiće možete kontrolirati putem postavki preglednika. Možete odlučiti prihvatiti ili odbiti kolačiće i izbrisati postojeće kolačiće. Međutim, ako odlučite onemogućiti kolačiće, neke značajke naše web stranice možda neće ispravno funkcionirati.',
        links: {
          chrome: 'Google Chrome: https://support.google.com/chrome/answer/95647?hl=hr',
          firefox: 'Firefox: https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences',
          safari: 'Safari: https://support.apple.com/en-gb/guide/safari/sfri11471/mac',
          ie: 'Internet Explorer: https://support.microsoft.com/en-us/topic/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d'
        }
      },
      changes: {
        title: 'Promjene ove Politike kolačića',
        text: 'S vremena na vrijeme možemo ažurirati ovu Politiku kolačića. Ako napravimo bilo kakve materijalne promjene, obavijestit ćemo vas objavljivanjem ažuriranih Pravila o kolačićima na našoj web stranici i ažuriranjem "Datuma stupanja na snagu" na vrhu ove stranice.'
      },
      contact: {
        title: 'Kontaktirajte nas',
        text: 'Ako imate pitanja ili nedoumica u vezi sa ovom Politikom kolačića, kontaktirajte nas.'
      }
    },
    en: {
      title: 'Cookie Policy',
      effectiveDate: 'Effective Date: November 13, 2024',
      intro: 'This Cookie Policy explains how bilbord.rs (the "Website") uses cookies and other tracking technologies to collect information about your browsing behavior and usage patterns.',
      whatAreCookies: {
        title: 'What are Cookies?',
        text: 'Cookies are small files that are stored on your device when you visit a website. They allow the website to recognize your device and remember your preferences and settings.'
      },
      types: {
        title: 'Types of Cookies We Use',
        text: 'We use the following types of cookies on our Website:',
        essential: 'Essential Cookies: These cookies are necessary for the Website to function properly. They enable you to navigate the Website and use its features.',
        performance: 'Performance Cookies: These cookies collect information about how visitors use our Website, such as which pages are most visited and which links are clicked. They help us improve the performance of our Website.',
        functional: 'Functional Cookies: These cookies allow the Website to remember your preferences and settings, such as your language preference and font size.',
        advertising: 'Advertising Cookies: These cookies are used to deliver personalized advertisements to you based on your browsing behavior and interests.',
        social: 'Social Media Cookies: These cookies are used to enable social media sharing and interaction with social media platforms.'
      },
      thirdParty: {
        title: 'Third-Party Cookies',
        text: 'We may also use third-party cookies on our Website. These cookies are placed by third-party service providers, such as Google Analytics and social media platforms.'
      },
      control: {
        title: 'How to Control Cookies',
        text: 'You can control cookies through your browser settings. You can choose to accept or reject cookies and delete existing cookies. However, if you choose to disable cookies, some features of our Website may not function properly.',
        links: {
          chrome: 'Google Chrome: https://support.google.com/chrome/answer/95647?hl=en',
          firefox: 'Firefox: https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences',
          safari: 'Safari: https://support.apple.com/en-gb/guide/safari/sfri11471/mac',
          ie: 'Internet Explorer: https://support.microsoft.com/en-us/topic/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d'
        }
      },
      changes: {
        title: 'Changes to this Cookie Policy',
        text: 'We may update this Cookie Policy from time to time. If we make any material changes, we will notify you by posting the updated Cookie Policy on our Website and updating the "Effective Date" at the top of this page.'
      },
      contact: {
        title: 'Contact Us',
        text: 'If you have any questions or concerns about this Cookie Policy, please contact us.'
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
          
          <p className="mb-6">{currentContent.intro}</p>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.whatAreCookies.title}
          </h2>
          <p className="mb-6">{currentContent.whatAreCookies.text}</p>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.types.title}
          </h2>
          <p className="mb-4">{currentContent.types.text}</p>
          <ul className="list-disc list-inside space-y-3 mb-6 ml-4">
            <li>{currentContent.types.essential}</li>
            <li>{currentContent.types.performance}</li>
            <li>{currentContent.types.functional}</li>
            <li>{currentContent.types.advertising}</li>
            <li>{currentContent.types.social}</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.thirdParty.title}
          </h2>
          <p className="mb-6">{currentContent.thirdParty.text}</p>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.control.title}
          </h2>
          <p className="mb-4">{currentContent.control.text}</p>
          <p className="mb-2">{language === 'sr' ? 'Kako biste saznali više o tome kako kontrolirati kolačiće u svom pregledniku, posjetite sljedeće poveznice:' : 'To learn more about how to control cookies in your browser, please visit the following links:'}</p>
          <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
            <li>
              <a href="https://support.google.com/chrome/answer/95647?hl=hr" target="_blank" rel="noopener noreferrer" className="text-[#1d1d1f] hover:underline">
                {currentContent.control.links.chrome}
              </a>
            </li>
            <li>
              <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-[#1d1d1f] hover:underline">
                {currentContent.control.links.firefox}
              </a>
            </li>
            <li>
              <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#1d1d1f] hover:underline">
                {currentContent.control.links.safari}
              </a>
            </li>
            <li>
              <a href="https://support.microsoft.com/en-us/topic/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-[#1d1d1f] hover:underline">
                {currentContent.control.links.ie}
              </a>
            </li>
          </ul>

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

