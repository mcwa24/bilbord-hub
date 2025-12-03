'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { Image as ImageIcon, FileText, Link as LinkIcon, Save, BarChart3 } from 'lucide-react'
import FileUpload from '@/components/ui/FileUpload'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import TagInput from '@/components/ui/TagInput'
import { uploadImage, uploadDocument, getImageUrl, getDocumentUrl } from '@/lib/supabase/storage'
import toast from 'react-hot-toast'

interface UploadedFile {
  name: string
  url: string
  type: 'image' | 'document'
  path: string
  size: number // in bytes
  thumbnailUrl?: string | null
  imageUrls?: string[] // Sve URL-ove slika
}

export default function AdminPage() {
  const router = useRouter()
  
  // Postavi današnji datum kao default
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [releaseName, setReleaseName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [publishedDate, setPublishedDate] = useState<string>(getTodayDate())
  const [validUntilDate, setValidUntilDate] = useState<string>('')
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedDocument, setUploadedDocument] = useState<UploadedFile | null>(null)
  const [uploadedZip, setUploadedZip] = useState<UploadedFile | null>(null)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([])
  const [customEmail, setCustomEmail] = useState('')

  useEffect(() => {
    // Proveri admin status na client side
    const adminStatus = isAdmin()
    setIsAuthorized(adminStatus)
  }, [])

  const handleDocumentUpload = async (files: File[]) => {
    if (files.length === 0) return
    const file = files[0] // Uzmi prvi fajl
    setDocumentFile(file)
    
    // Zadrži originalno ime fajla, samo dodaj timestamp na kraju za jedinstvenost
    const timestamp = Date.now()
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'))
    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'))
    // Čisti ime fajla od nevalidnih karaktera za storage, ali zadrži originalno za download
    const cleanFileName = fileNameWithoutExt.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `uploads/${cleanFileName}-${timestamp}${fileExtension}`
    
    try {
      const { data, error } = await uploadDocument(storagePath, file)
      if (error) {
        throw new Error(error.message || 'Greška pri upload-u dokumenta')
      }

      const uploaded = {
        name: file.name, // Originalno ime za download
        url: getDocumentUrl(data!.path),
        type: 'document' as const,
        path: data!.path,
        size: file.size,
      }
      setUploadedDocument(uploaded)
      toast.success('Dokument upload-ovan!')
    } catch (error: any) {
      toast.error(error.message || 'Greška pri upload-u dokumenta')
    }
  }

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return
    
    setImageFiles(files)
    setUploading(true)
    
    try {
      const timestamp = Date.now()
      const uploadedImages: string[] = []
      const uploadErrors: string[] = []

      // Upload-uj svaku sliku posebno u storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = file.name.split('/').pop() || file.name
        // Čisti ime fajla od nevalidnih karaktera
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
        const imagePath = `uploads/images/${timestamp}-${i}-${cleanFileName}`
        
        try {
          const { data: imageData, error: imageError } = await uploadImage(imagePath, file)
          
          if (imageError) {
            uploadErrors.push(`${fileName}: ${imageError.message || 'Upload failed'}`)
            continue
          }

          if (imageData) {
            const imageUrl = getImageUrl(imageData.path)
            uploadedImages.push(imageUrl)
          }
        } catch (err: any) {
          uploadErrors.push(`${fileName}: ${err.message || 'Upload failed'}`)
        }
      }

      if (uploadedImages.length === 0) {
        const errorMsg = uploadErrors.length > 0 
          ? `Greška pri upload-u slika:\n${uploadErrors.join('\n')}`
          : 'Nijedna slika nije upload-ovana'
        throw new Error(errorMsg)
      }

      // Pakuj sve slike u jedan ZIP za download
      let zipUrl: string | null = null
      let zipSize = 0 // Veličina ZIP fajla u bajtovima
      try {
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()

        files.forEach((file) => {
          const fileName = file.name.split('/').pop() || file.name
          zip.file(fileName, file)
        })

        const zipBlob = await zip.generateAsync({ 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 1 },
          comment: 'Bilbord Hub'
        })
        
        zipSize = zipBlob.size // Veličina ZIP fajla u bajtovima
        const zipFileName = `slike-${timestamp}.zip`
        const zipFile = new File([zipBlob], zipFileName, { type: 'application/zip' })
        const storagePath = `uploads/slike-${timestamp}.zip`
        const { data, error } = await uploadImage(storagePath, zipFile)
        
        if (error) {
          // Nastavi čak i ako ZIP upload ne uspe - korisnik može da download-uje pojedinačne slike
        } else if (data) {
          zipUrl = getImageUrl(data.path)
        }
      } catch (zipError: any) {
        // Nastavi čak i ako ZIP ne uspe
      }

      const uploaded = {
        name: `slike-${timestamp}.zip`,
        url: zipUrl || uploadedImages[0], // Fallback na prvu sliku ako ZIP ne uspe
        type: 'image' as const,
        path: zipUrl ? `uploads/slike-${timestamp}.zip` : '',
        size: zipSize, // Veličina ZIP fajla u bajtovima
        imageUrls: uploadedImages, // Čuvamo sve URL-ove slika
      }
      setUploadedZip(uploaded)
      
      if (uploadErrors.length > 0) {
        toast.success(`Upload-ovano ${uploadedImages.length}/${files.length} slika! Neke slike nisu upload-ovane.`, { duration: 5000 })
      } else {
        toast.success(`Upload-ovano ${uploadedImages.length} slika!`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri upload-u slika')
      setImageFiles([])
      setUploadedZip(null)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveRelease = async () => {
    if (!releaseName.trim()) {
      toast.error('Unesite ime saopštenja')
      return
    }

    if (!uploadedDocument && !uploadedZip) {
      toast.error('Upload-ujte dokument ili slike')
      return
    }

    setUploading(true)
    try {
      const materialLinks = []
      if (uploadedDocument) {
        materialLinks.push({
          type: 'other',
          url: uploadedDocument.url,
          label: uploadedDocument.name,
          size: uploadedDocument.size, // Čuvamo veličinu fajla u bajtovima
        })
      }
      if (uploadedZip) {
        materialLinks.push({
          type: 'other',
          url: uploadedZip.url,
          label: 'Slike',
          size: uploadedZip.size, // Čuvamo veličinu ZIP fajla u bajtovima
        })
      }

      // Konvertuj datum u ISO format
      const publishedAt = publishedDate 
        ? new Date(publishedDate + 'T00:00:00').toISOString()
        : new Date().toISOString()

      // Pripremi alt_texts sa svim slikama
      const altTexts = uploadedZip?.imageUrls?.map((url, index) => ({
        image_url: url,
        alt_text: `${releaseName} - Slika ${index + 1}`
      })) || []

      const releaseData: any = {
        title: releaseName,
        description: releaseName,
        content: `<p>${releaseName}</p>`,
        company_name: 'Admin',
        industry: 'General',
        tags: tags,
        material_links: materialLinks,
        alt_texts: altTexts,
        thumbnail_url: null, // Ne koristimo thumbnail
        seo_meta_description: releaseName,
        published_at: publishedAt,
      }

      // Dodaj valid_until samo ako je unesen
      if (validUntilDate) {
        releaseData.valid_until = new Date(validUntilDate + 'T23:59:59').toISOString()
      }

      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...releaseData,
          additional_emails: additionalEmails,
        }),
      })

      const responseData = await res.json()

      if (res.ok) {
        toast.success('Saopštenje kreirano!')
        // Reset forme
        setReleaseName('')
        setTags([])
        setPublishedDate(getTodayDate())
        setValidUntilDate('')
        setDocumentFile(null)
        setImageFiles([])
        setUploadedDocument(null)
        setUploadedZip(null)
        setAdditionalEmails([])
        // Redirect na naslovnu stranicu u sekciju "Poslednja saopštenja"
        window.location.href = '/#najnovija-saopstenja'
      } else {
        throw new Error(responseData.error || 'Greška pri kreiranju saopštenja')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri kreiranju saopštenja')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number, unit: 'KB' | 'MB' = 'KB'): string => {
    if (unit === 'MB') {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }
    return (bytes / 1024).toFixed(2) + ' KB'
  }

  // Ako još nije provereno, prikaži loading
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f9c344] mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Učitavanje...</p>
        </div>
      </div>
    )
  }

  // Ako nije autorizovan, prikaži 404
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[#1d1d1f] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Stranica nije pronađena</h2>
          <p className="text-gray-600 mb-8">Stranica koju tražite ne postoji.</p>
          <a 
            href="/prijava" 
            className="inline-block px-8 py-3 bg-[#f9c344] hover:bg-[#f0b830] text-[#1d1d1f] font-semibold rounded-full transition"
          >
            Vrati se na prijavu
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f]">
            Admin - Upload fajlova
          </h1>
          <Link href="/dashboard/statistika">
            <Button className="flex items-center gap-2">
              <BarChart3 size={18} />
              Statistika
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Ime saopštenja *
            </label>
            <Input
              type="text"
              value={releaseName}
              onChange={(e) => setReleaseName(e.target.value)}
              placeholder="Unesite ime saopštenja"
              required
            />
          </div>
          <div className="mb-4">
            <label 
              htmlFor="published-date"
              className="block text-sm font-semibold text-[#1d1d1f] mb-2 cursor-pointer"
            >
              Datum *
            </label>
            <Input
              id="published-date"
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              onClick={(e) => {
                // Otvori kalendar kada se klikne na polje
                const input = e.target as HTMLInputElement
                input.showPicker?.()
              }}
              required
            />
          </div>
          <div className="mb-4">
            <label 
              htmlFor="valid-until-date"
              className="block text-sm font-semibold text-[#1d1d1f] mb-2 cursor-pointer"
            >
              Vest aktuelna do (opciono)
            </label>
            <Input
              id="valid-until-date"
              type="date"
              value={validUntilDate}
              onChange={(e) => setValidUntilDate(e.target.value)}
              onClick={(e) => {
                // Otvori kalendar kada se klikne na polje
                const input = e.target as HTMLInputElement
                input.showPicker?.()
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ako unesete datum, vest će biti označena zelenom bojom dok je aktuelna, a narandžastom nakon što prođe.
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Tagovi
            </label>
            <TagInput tags={tags} onChange={setTags} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-3">
              Dodatna email obaveštenja
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  const email = 'jasmina@propr.rs'
                  if (additionalEmails.includes(email)) {
                    setAdditionalEmails(additionalEmails.filter(e => e !== email))
                  } else {
                    setAdditionalEmails([...additionalEmails, email])
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  additionalEmails.includes('jasmina@propr.rs')
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {additionalEmails.includes('jasmina@propr.rs') && '✓ '}
                Pro PR
              </button>
              <button
                type="button"
                onClick={() => {
                  const email = 'mokahusar@gmail.com'
                  if (additionalEmails.includes(email)) {
                    setAdditionalEmails(additionalEmails.filter(e => e !== email))
                  } else {
                    setAdditionalEmails([...additionalEmails, email])
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  additionalEmails.includes('mokahusar@gmail.com')
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {additionalEmails.includes('mokahusar@gmail.com') && '✓ '}
                KomunikArt
              </button>
              <button
                type="button"
                onClick={() => {
                  const email = 'imarcetic@gmail.com'
                  if (additionalEmails.includes(email)) {
                    setAdditionalEmails(additionalEmails.filter(e => e !== email))
                  } else {
                    setAdditionalEmails([...additionalEmails, email])
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  additionalEmails.includes('imarcetic@gmail.com')
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {additionalEmails.includes('imarcetic@gmail.com') && '✓ '}
                Ivan
              </button>
            </div>
            
            {/* Custom email input */}
            <div className="mt-4 flex gap-2">
              <Input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="Unesite email adresu"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (customEmail.trim()) {
                      const email = customEmail.trim().toLowerCase()
                      if (!additionalEmails.includes(email)) {
                        setAdditionalEmails([...additionalEmails, email])
                        setCustomEmail('')
                      } else {
                        toast.error('Email adresa je već dodata')
                      }
                    }
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  if (customEmail.trim()) {
                    const email = customEmail.trim().toLowerCase()
                    if (!additionalEmails.includes(email)) {
                      setAdditionalEmails([...additionalEmails, email])
                      setCustomEmail('')
                    } else {
                      toast.error('Email adresa je već dodata')
                    }
                  }
                }}
                variant="outline"
              >
                Dodaj
              </Button>
            </div>

            {/* Lista dodatnih email adresa */}
            {additionalEmails.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-[#1d1d1f] mb-2">
                  Email obaveštenje će biti poslato na:
                </p>
                <div className="flex flex-wrap gap-2">
                  {additionalEmails.map((email) => (
                    <div
                      key={email}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                    >
                      <span className="text-gray-800">{email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAdditionalEmails(additionalEmails.filter(e => e !== email))
                        }}
                        className="text-gray-500 hover:text-gray-800 transition"
                        aria-label={`Ukloni ${email}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              ⚠️ Upload-ovanjem materijala potvrđujete da posedujete sva autorska prava ili dozvole 
              za distribuciju. Materijali će biti dostupni medijima za redakcijsku upotrebu. 
              <Link href="/copyright" className="text-[#1d1d1f] hover:underline ml-1">Saznaj više</Link>
            </p>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon size={24} className="text-[#1d1d1f]" />
              <h2 className="text-xl font-bold text-[#1d1d1f]">
                Upload slika
              </h2>
            </div>
            <FileUpload
              type="image"
              multiple
              maxSize={100}
              allowZip={false}
              onUpload={handleImageUpload}
              label="Slike za PR objave (biće pakovane u ZIP)"
            />
            {uploadedZip && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ ZIP arhiva upload-ovana: {uploadedZip.name} ({formatFileSize(uploadedZip.size, 'MB')})
                </p>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} className="text-[#1d1d1f]" />
              <h2 className="text-xl font-bold text-[#1d1d1f]">
                Upload dokumenata
              </h2>
            </div>
            <FileUpload
              type="document"
              multiple={false}
              maxSize={50}
              onUpload={handleDocumentUpload}
              label="PDF ili Word dokument"
            />
            {uploadedDocument && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Dokument upload-ovan: {uploadedDocument.name} ({formatFileSize(uploadedDocument.size, 'KB')})
                </p>
              </div>
            )}
          </Card>
        </div>

        {(uploadedDocument || uploadedZip) && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#1d1d1f]">
                Sačuvaj saopštenje
              </h2>
              <Button
                onClick={handleSaveRelease}
                disabled={uploading || !releaseName.trim()}
                className="flex items-center gap-2"
              >
                <Save size={18} />
                {uploading ? 'Čuvanje...' : 'Sačuvaj'}
              </Button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {uploadedDocument && (
                <p>✓ Dokument: {uploadedDocument.name} ({formatFileSize(uploadedDocument.size, 'KB')})</p>
              )}
              {uploadedZip && (
                <p>✓ Slike (ZIP): {uploadedZip.name} ({formatFileSize(uploadedZip.size, 'MB')})</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

