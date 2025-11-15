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
      },
      shareFeature: {
        title: 'Jednostavno deljenje saopštenja',
        text: 'Svako PR saopštenje možete preuzeti ručno ili koristiti funkciju deljenja. Kada kliknete na ikonu deljenja pored saopštenja, kopira se jedinstveni link. Svako ko klikne na taj link automatski dobija download i slika (ZIP arhiva) i dokumenta (PDF) - sve na jednom mestu, bez dodatnih koraka.',
        benefits: [
          'Jednostavno deljenje - samo kopirajte link',
          'Automatski download - slike i dokumenti se preuzimaju odjednom',
          'Brza distribucija - pošaljite link putem email-a ili društvenih mreža',
          'Bez dodatnih koraka - sve se dešava automatski'
        ]
      },
      hubSteps: {
        title: 'Kako funkcioniše PR Hub platforma',
        steps: [
          {
            title: '1. Pretraga i filtriranje',
            text: 'Koristite pretragu i filtere da pronađete PR saopštenja po kategorijama, tagovima ili datumu objave.'
          },
          {
            title: '2. Pregled saopštenja',
            text: 'Kliknite na saopštenje da vidite detalje, slike, sadržaj i materijale za preuzimanje.'
          },
          {
            title: '3. Preuzimanje materijala',
            text: 'Preuzmite PDF dokumente i ZIP arhive sa slikama direktno sa platforme ili koristite funkciju deljenja.'
          },
          {
            title: '4. Deljenje linkova',
            text: 'Koristite ikonu deljenja da kopirate jedinstveni link. Svako ko klikne na link automatski dobija download svih materijala.'
          }
        ]
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
      },
      shareFeature: {
        title: 'Easy sharing of releases',
        text: 'You can download each PR release manually or use the sharing function. When you click on the share icon next to a release, a unique link is copied. Anyone who clicks on that link automatically gets a download of both images (ZIP archive) and documents (PDF) - all in one place, without additional steps.',
        benefits: [
          'Easy sharing - just copy the link',
          'Automatic download - images and documents are downloaded at once',
          'Quick distribution - send the link via email or social media',
          'No additional steps - everything happens automatically'
        ]
      },
      hubSteps: {
        title: 'How PR Hub platform works',
        steps: [
          {
            title: '1. Search and filter',
            text: 'Use search and filters to find PR releases by categories, tags, or publication date.'
          },
          {
            title: '2. View release',
            text: 'Click on a release to see details, images, content, and downloadable materials.'
          },
          {
            title: '3. Download materials',
            text: 'Download PDF documents and ZIP archives with images directly from the platform or use the sharing function.'
          },
          {
            title: '4. Share links',
            text: 'Use the share icon to copy a unique link. Anyone who clicks on the link automatically gets a download of all materials.'
          }
        ]
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

          <div className="bg-gradient-to-r from-[#f9c344] to-[#f0b830] p-8 rounded-2xl mb-8 shadow-lg">
            <h2 className="text-3xl font-bold text-[#1d1d1f] mb-4">
              {currentContent.shareFeature.title}
            </h2>
            <p className="text-[#1d1d1f] text-lg mb-6 leading-relaxed">
              {currentContent.shareFeature.text}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {currentContent.shareFeature.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-[#1d1d1f] font-bold text-xl flex-shrink-0">✓</span>
                  <span className="text-[#1d1d1f] font-medium">{benefit}</span>
                </div>
              ))}
            </div>
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
            className="inline-block px-6 py-3 bg-[#f9c344] text-[#1d1d1f] font-semibold rounded-lg hover:bg-[#f0b830] transition-colors mb-12"
          >
            {currentContent.subscription.linkText}
          </a>

          <div className="border-t-2 border-gray-200 pt-12 mt-12">
            <h2 className="text-3xl font-bold text-[#1d1d1f] mb-6 text-center">
              {currentContent.hubSteps.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {currentContent.hubSteps.steps.map((step, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#1d1d1f] text-gray-700">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

