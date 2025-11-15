'use client'

import { useState } from 'react'

export default function OPRPlatformiPage() {
  const [language, setLanguage] = useState<'sr' | 'en'>('sr')

  const content = {
    sr: {
      title: 'O PR Platformi',
      intro: 'PR Hub platforma je centralizovani sistem za distribuciju PR saopštenja koji povezuje PR agencije, kompanije i medije na jednom mestu. Upload PR saopštenja i upravljanje platformom vrši naš tim.',
      keyBenefit: {
        title: 'Zašto PR Hub?',
        text: 'PR Hub platforma omogućava da objavljivači ne moraju imati direktnu saradnju sa pojedinačnim portalima, firmama ili medijima. Vaša PR saopštenja se automatski šire kroz platformu, a portali, mediji i firme mogu pristupiti i objavljivati vaša saopštenja bez potrebe za direktnim kontaktom. Ovo značajno pojednostavljuje proces distribucije i omogućava širu vidljivost vaših PR materijala.'
      },
      howItWorks: {
        title: 'Kako funkcioniše',
        text: 'Naša platforma omogućava jednostavnu i efikasnu distribuciju PR saopštenja sa automatskim obaveštavanjem pretplatnika.',
        steps: [
          {
            title: '1. Upload PR saopštenja',
            text: 'Kada imate saradnju sa portalom Bilbord, naš tim upload-uje vaša PR saopštenja na PR Hub platformu. Dodajemo naslov, opis, tagove, slike i originalne fajlove (PDF dokumente, ZIP arhive sa slikama).'
          },
          {
            title: '2. Automatsko obaveštavanje pretplatnika',
            text: 'Kada naš tim upload-uje PR saopštenje na PR Hub platformi, svi korisnici sa odgovarajućim pretplatama na portalu Bilbord automatski dobijaju obaveštenje o novom saopštenju. Pretplate se filtriraju po kategorijama, tagovima i interesovanjima.'
          },
          {
            title: '3. Centralizovani hub',
            text: 'Sva PR saopštenja su dostupna na jednom mestu - PR Hub platformi. Mediji i drugi korisnici mogu pretraživati, filtrirati i preuzimati PR materijale sa jednog mesta.'
          },
          {
            title: '4. Preuzimanje materijala',
            text: 'Korisnici mogu preuzeti originalne fajlove (PDF dokumente, slike) direktno sa platforme. Svako preuzimanje se prati radi statistike i analitike.'
          }
        ]
      },
      features: {
        title: 'Ključne funkcionalnosti',
        items: [
          'Upload PR saopštenja od strane našeg tima na PR Hub platformi',
          'Automatsko obaveštavanje pretplatnika sa portala Bilbord',
          'Upload i organizacija originalnih fajlova (PDF, slike)',
          'Pretraga i filtriranje po kategorijama, tagovima i datumu',
          'Centralizovani pristup svim PR materijalima',
          'Statistika preuzimanja i pregleda',
          'Ready-to-publish HTML kod za brzu objavu'
        ]
      },
      benefits: {
        title: 'Prednosti',
        text: 'PR Hub platforma pojednostavljuje proces distribucije PR saopštenja i omogućava efikasniju komunikaciju između PR agencija, kompanija i medija.',
        forPR: {
          title: 'Za PR agencije i kompanije',
          items: [
            'Jednostavna distribucija PR saopštenja - naš tim upload-uje vaša saopštenja',
            'Automatsko obaveštavanje relevantnih medija',
            'Praćenje statistike preuzimanja',
            'Organizovano čuvanje PR materijala'
          ]
        },
        forMedia: {
          title: 'Za medije',
          items: [
            'Centralizovani pristup svim PR saopštenjima',
            'Pretraga i filtriranje po interesovanjima',
            'Preuzimanje originalnih fajlova',
            'Ready-to-publish HTML kod'
          ]
        }
      },
      subscription: {
        title: 'Pretplate',
        text: 'Da biste koristili PR Hub platformu, potrebno je da imate aktivnu pretplatu na portalu Bilbord. Pretplate se razlikuju po kategorijama i omogućavaju pristup različitim tipovima PR saopštenja.',
        link: 'https://bilbord.rs/pretplate/',
        linkText: 'Saznajte više o pretplatama'
      }
    },
    en: {
      title: 'About PR Platform',
      intro: 'PR Hub platform is a centralized system for PR release distribution that connects PR agencies, companies, and media in one place. Our team handles uploading PR releases and managing the platform.',
      keyBenefit: {
        title: 'Why PR Hub?',
        text: 'The point of PR Hub platform is that publishers do not need to have direct partnerships with individual portals, companies, or media. Instead, your PR releases are automatically distributed through the platform, and portals, media, and companies can access and publish your releases without the need for direct contact. This significantly simplifies the distribution process and enables wider visibility of your PR materials.'
      },
      howItWorks: {
        title: 'How it works',
        text: 'Our platform enables simple and efficient distribution of PR releases with automatic subscriber notifications.',
        steps: [
          {
            title: '1. Upload PR releases',
            text: 'When you have a partnership with Bilbord portal, our team uploads your PR releases on the PR Hub platform. We add title, description, tags, images, and original files (PDF documents, ZIP archives with images).'
          },
          {
            title: '2. Automatic subscriber notifications',
            text: 'When our team uploads a PR release on the PR Hub platform, all users with appropriate subscriptions on Bilbord portal automatically receive a notification about the new release. Subscriptions are filtered by categories, tags, and interests.'
          },
          {
            title: '3. Centralized hub',
            text: 'All PR releases are available in one place - the PR Hub platform. Media and other users can search, filter, and download PR materials from one location.'
          },
          {
            title: '4. Material downloads',
            text: 'Users can download original files (PDF documents, images) directly from the platform. Each download is tracked for statistics and analytics.'
          }
        ]
      },
      features: {
        title: 'Key features',
        items: [
          'Upload PR releases by our team on PR Hub platform',
          'Automatic notification of Bilbord portal subscribers',
          'Upload and organization of original files (PDF, images)',
          'Search and filter by categories, tags, and date',
          'Centralized access to all PR materials',
          'Download and view statistics',
          'Ready-to-publish HTML code for quick publishing'
        ]
      },
      benefits: {
        title: 'Benefits',
        text: 'PR Hub platform simplifies the PR release distribution process and enables more efficient communication between PR agencies, companies, and media.',
        forPR: {
          title: 'For PR agencies and companies',
          items: [
            'Simple distribution of PR releases - our team uploads your releases',
            'Automatic notification of relevant media',
            'Tracking download statistics',
            'Organized storage of PR materials'
          ]
        },
        forMedia: {
          title: 'For media',
          items: [
            'Centralized access to all PR releases',
            'Search and filter by interests',
            'Download original files',
            'Ready-to-publish HTML code'
          ]
        }
      },
      subscription: {
        title: 'Subscriptions',
        text: 'To use the PR Hub platform, you need to have an active subscription on Bilbord portal. Subscriptions differ by categories and provide access to different types of PR releases.',
        link: 'https://bilbord.rs/pretplate/',
        linkText: 'Learn more about subscriptions'
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
          <p className="mb-8 text-lg">{currentContent.intro}</p>

          <div className="bg-[#f9c344] bg-opacity-20 border-l-4 border-[#f9c344] p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">
              {currentContent.keyBenefit.title}
            </h2>
            <p className="text-[#1d1d1f] text-lg leading-relaxed">
              {currentContent.keyBenefit.text}
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.howItWorks.title}
          </h2>
          <p className="mb-6">{currentContent.howItWorks.text}</p>
          
          <div className="space-y-6 mb-8">
            {currentContent.howItWorks.steps.map((step, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#1d1d1f]">{step.text}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.features.title}
          </h2>
          <ul className="list-disc list-inside space-y-3 mb-6 ml-4">
            {currentContent.features.items.map((item, index) => (
              <li key={index} className="text-[#1d1d1f]">{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.benefits.title}
          </h2>
          <p className="mb-6">{currentContent.benefits.text}</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">
                {currentContent.benefits.forPR.title}
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {currentContent.benefits.forPR.items.map((item, index) => (
                  <li key={index} className="text-[#1d1d1f]">{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">
                {currentContent.benefits.forMedia.title}
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {currentContent.benefits.forMedia.items.map((item, index) => (
                  <li key={index} className="text-[#1d1d1f]">{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#1d1d1f] mt-8 mb-4">
            {currentContent.subscription.title}
          </h2>
          <p className="mb-4">{currentContent.subscription.text}</p>
          <a
            href={currentContent.subscription.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-[#f9c344] text-[#1d1d1f] font-semibold rounded-lg hover:bg-[#f0b830] transition-colors"
          >
            {currentContent.subscription.linkText}
          </a>
        </div>
      </div>
    </div>
  )
}

