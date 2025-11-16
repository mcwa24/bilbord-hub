'use client'

import { useState } from 'react'
import React from 'react'
import { Upload, Eye, Download, Share2, Mail } from 'lucide-react'
import NewsletterSubscribe from '@/components/NewsletterSubscribe'

export default function OPRPlatformiPage() {
  const [language, setLanguage] = useState<'sr' | 'en'>('sr')

  const content = {
    sr: {
      title: 'O PR Platformi',
      intro: 'PR Hub platforma je centralizovani sistem za distribuciju PR saopštenja koji povezuje PR agencije, kompanije i medije na jednom mestu. PR saopštenja mogu upload-ovati Bilbord tim, kao i firme i agencije same kroz platformu.',
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
            text: 'PR saopštenja mogu upload-ovati Bilbord tim ili firme i agencije same kroz platformu. Dodajte naslov, opis, tagove, slike i originalne fajlove (PDF dokumente, ZIP arhive sa slikama).'
          },
          {
            title: '2. Automatsko obaveštavanje pretplatnika',
            text: 'Kada se PR saopštenje upload-uje na PR Hub platformi (bilo od strane Bilbord tima ili firme/agencije), svi korisnici sa odgovarajućim pretplatama na portalu Bilbord automatski dobijaju obaveštenje o novom saopštenju. Pretplate se filtriraju po kategorijama, tagovima i interesovanjima.'
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
          'Upload PR saopštenja od strane Bilbord tima ili firme/agencije same',
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
            'Jednostavna distribucija PR saopštenja - upload-ujte saopštenja sami ili neka Bilbord tim to uradi za vas',
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
            'Ready-to-publish HTML kod',
            'Email obaveštenja po tagovima - dobijajte obaveštenja čim stigne PR saopštenje sa tagovima koje pratite'
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
        text: 'Svako PR saopštenje možete preuzeti ručno ili koristiti funkciju deljenja. Kada kliknete na ikonu deljenja pored saopštenja, kopira se jedinstveni link. Svako ko klikne na taj link automatski dobija download slika (ZIP arhiva) i dokumenta - sve na jednom mestu, bez dodatnih koraka.',
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
            title: 'Upload saopštenja',
            text: 'Hub team ili firme upload-uju PR saopštenja na platformu sa naslovom, tagovima, slikama i dokumentima.',
            icon: 'upload'
          },
          {
            title: 'Pregled saopštenja',
            text: 'Sva saopštenja su vidljiva direktno u listi sa naslovom, datumom, tagovima i linkovima za preuzimanje materijala.',
            icon: 'eye'
          },
          {
            title: 'Preuzimanje materijala',
            text: 'Preuzmite dokumente i ZIP arhive sa slikama direktno sa platforme ili koristite funkciju deljenja.',
            icon: 'download'
          },
          {
            title: 'Deljenje linkova',
            text: 'Koristite ikonu deljenja da kopirate jedinstveni link. Svako ko klikne na link automatski dobija download svih materijala.',
            icon: 'share'
          }
        ]
      }
    },
    en: {
      title: 'About PR Platform',
      intro: 'PR Hub platform is a centralized system for PR release distribution that connects PR agencies, companies, and media in one place. PR releases can be uploaded by the Bilbord team, as well as by companies and agencies themselves through the platform.',
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
            text: 'PR releases can be uploaded by the Bilbord team or by companies and agencies themselves through the platform. Add title, description, tags, images, and original files (PDF documents, ZIP archives with images).'
          },
          {
            title: '2. Automatic subscriber notifications',
            text: 'When a PR release is uploaded on the PR Hub platform (either by the Bilbord team or by a company/agency), all users with appropriate subscriptions on Bilbord portal automatically receive a notification about the new release. Subscriptions are filtered by categories, tags, and interests.'
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
          'Upload PR releases by Bilbord team or companies/agencies themselves',
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
            'Simple distribution of PR releases - upload releases yourself or let the Bilbord team do it for you',
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
            'Ready-to-publish HTML code',
            'Email notifications by tags - receive notifications as soon as a PR release arrives with tags you follow'
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
        text: 'You can download each PR release manually or use the sharing function. When you click on the share icon next to a release, a unique link is copied. Anyone who clicks on that link automatically gets a download of images (ZIP archive) and documents - all in one place, without additional steps.',
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
            title: 'Upload releases',
            text: 'Hub team or companies upload PR releases to the platform with title, tags, images, and documents.',
            icon: 'upload'
          },
          {
            title: 'View release',
            text: 'All releases are visible directly in the list with title, date, tags, and links to download materials.',
            icon: 'eye'
          },
          {
            title: 'Download materials',
            text: 'Download documents and ZIP archives with images directly from the platform or use the sharing function.',
            icon: 'download'
          },
          {
            title: 'Share links',
            text: 'Use the share icon to copy a unique link. Anyone who clicks on the link automatically gets a download of all materials.',
            icon: 'share'
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

          {/* Baner za email obaveštenja */}
          <div className="bg-gradient-to-r from-[#f9c344] to-[#f0b830] p-8 md:p-12 rounded-2xl mb-8 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <Mail size={32} className="text-[#1d1d1f]" />
                <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f]">
                  {language === 'sr' ? 'Prijavite se na email obaveštenja' : 'Subscribe to email notifications'}
                </h2>
              </div>
              <p className="text-[#1d1d1f] text-lg mb-6 leading-relaxed">
                {language === 'sr' 
                  ? 'Mediji mogu da se prijave na email obaveštenja i dobijaju obaveštenja čim stigne PR saopštenje sa tagovima koje pratite. Budite uvek u toku sa najnovijim PR saopštenjima iz vaših oblasti interesovanja.'
                  : 'Media can subscribe to email notifications and receive alerts as soon as a PR release arrives with tags they follow. Stay up to date with the latest PR releases from your areas of interest.'}
              </p>
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl">
                <NewsletterSubscribe />
              </div>
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
              {currentContent.hubSteps.steps.map((step: any, index: number) => {
                const icons: Record<string, React.ReactNode> = {
                  upload: <Upload size={20} className="text-[#1d1d1f]" />,
                  eye: <Eye size={20} className="text-[#1d1d1f]" />,
                  download: <Download size={20} className="text-[#1d1d1f]" />,
                  share: <Share2 size={20} className="text-[#1d1d1f]" />
                }
                const IconComponent = icons[step.icon] || icons.upload
                
                return (
                  <div key={index} className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      {IconComponent}
                      <h3 className="text-xl font-bold text-[#1d1d1f]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-[#1d1d1f] text-gray-700">
                      {step.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

