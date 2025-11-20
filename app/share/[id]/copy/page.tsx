'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function CopyShareLinkPage() {
  const params = useParams()
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [isPopup, setIsPopup] = useState(false)

  useEffect(() => {
    const url = `${window.location.origin}/download/${params.id}`
    setShareUrl(url)
    
    // Proveri da li je prozor otvoren kao popup
    if (typeof window !== 'undefined' && window.opener) {
      setIsPopup(true)
    }
    
    // Automatski kopiraj link u clipboard
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        
        // Ako je prozor otvoren kao popup, zatvori ga nakon kratke pauze
        if (typeof window !== 'undefined' && window.opener) {
          setTimeout(() => {
            window.close()
          }, 1500)
        }
      } catch (err) {
        // Fallback za starije browsere
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          setCopied(true)
          if (typeof window !== 'undefined' && window.opener) {
            setTimeout(() => {
              window.close()
            }, 1500)
          }
        } catch (copyErr) {
          console.error('Failed to copy:', copyErr)
        }
        document.body.removeChild(textArea)
      }
    }
    
    copyToClipboard()
  }, [params.id])

  return (
    <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center">
      <div className="container-custom text-center max-w-2xl">
        <div className="mb-8">
          {copied ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-[#1d1d1f] mb-4">
                Link je kopiran!
              </h1>
              <p className="text-gray-600 mb-6">
                Link za deljenje je uspešno kopiran u clipboard. Možete ga sada podeliti sa drugima.
              </p>
              {isPopup && (
                <p className="text-sm text-gray-500 mb-4">
                  Ovaj prozor će se zatvoriti za nekoliko sekundi...
                </p>
              )}
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📋</div>
              <h1 className="text-3xl font-bold text-[#1d1d1f] mb-4">
                Kopiranje linka...
              </h1>
            </>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600 mb-2">Link za deljenje:</p>
          <p 
            className="text-sm font-mono text-gray-800 break-all cursor-pointer select-all"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl).then(() => {
                setCopied(true)
              })
            }}
            title="Kliknite da kopirate"
          >
            {shareUrl}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl).then(() => {
                setCopied(true)
              })
            }}
          >
            {copied ? '✓ Kopirano ponovo' : 'Kopiraj ponovo'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== 'undefined' && window.opener) {
                window.close()
              } else {
                window.location.href = '/'
              }
            }}
          >
            {isPopup ? 'Zatvori' : 'Idi na početnu'}
          </Button>
        </div>
      </div>
    </div>
  )
}

