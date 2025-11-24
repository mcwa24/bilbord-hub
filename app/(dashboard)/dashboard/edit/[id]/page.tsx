'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { Image as ImageIcon, FileText, Save } from 'lucide-react'
import FileUpload from '@/components/ui/FileUpload'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import TagInput from '@/components/ui/TagInput'
import { uploadImage, uploadDocument, getImageUrl, getDocumentUrl } from '@/lib/supabase/storage'
import { PRRelease } from '@/types'
import toast from 'react-hot-toast'

interface UploadedFile {
  name: string
  url: string
  type: 'image' | 'document'
  path: string
  size: number
}

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [releaseName, setReleaseName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [publishedDate, setPublishedDate] = useState<string>('')
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploadedDocument, setUploadedDocument] = useState<UploadedFile | null>(null)
  const [uploadedZip, setUploadedZip] = useState<UploadedFile | null>(null)
  const [existingDocument, setExistingDocument] = useState<UploadedFile | null>(null)
  const [existingZip, setExistingZip] = useState<UploadedFile | null>(null)
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([])
  const [customEmail, setCustomEmail] = useState('')

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/dashboard/login')
      return
    }
    fetchRelease()
  }, [params.id, router])

  const fetchRelease = async () => {
    try {
      const res = await fetch(`/api/releases/${params.id}`)
      const data = await res.json()
      const release: PRRelease = data.release

      setReleaseName(release.title)
      setTags(release.tags || [])
      
      // Učitaj datum - konvertuj iz ISO stringa u format za input (YYYY-MM-DD)
      if (release.published_at) {
        const date = new Date(release.published_at)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        setPublishedDate(`${year}-${month}-${day}`)
      } else if (release.created_at) {
        const date = new Date(release.created_at)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        setPublishedDate(`${year}-${month}-${day}`)
      }

      // Učitaj postojeće fajlove
      const zipFiles = release.material_links.filter(
        (link) => link.url.toLowerCase().endsWith('.zip') || link.label === 'Slike'
      )
      const documents = release.material_links.filter(
        (link) => !link.url.toLowerCase().endsWith('.zip') && link.label !== 'Slike'
      )

      if (documents.length > 0) {
        const doc = documents[0]
        setExistingDocument({
          name: doc.label,
          url: doc.url,
          type: 'document',
          path: '',
          size: 0,
        })
      }

      if (zipFiles.length > 0) {
        const zip = zipFiles[0]
        setExistingZip({
          name: zip.label === 'Slike' ? 'Slike.zip' : zip.label,
          url: zip.url,
          type: 'image',
          path: '',
          size: 0,
        })
      }
    } catch (error) {
      toast.error('Greška pri učitavanju saopštenja')
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUpload = async (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
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
      setExistingDocument(null)
      toast.success('Dokument upload-ovan!')
    } catch (error: any) {
      toast.error(error.message || 'Greška pri upload-u dokumenta')
    }
  }

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return

    setImageFiles(files)

    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Dodaj slike sa originalnim nazivima (bez meta podataka)
      files.forEach((file) => {
        // Koristi samo ime fajla bez putanje
        const fileName = file.name.split('/').pop() || file.name
        zip.file(fileName, file)
      })

      // Postavi komentar na ZIP fajl

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 1 },
        comment: 'Bilbord Hub' // Meta podatak za ZIP
      })

      const timestamp = Date.now()
      const zipFileName = `slike-${timestamp}.zip`
      const zipFile = new File([zipBlob], zipFileName, { type: 'application/zip' })

      // Upload-uj ZIP fajl sa originalnim imenom
      const storagePath = `uploads/slike-${timestamp}.zip`
      const { data, error } = await uploadImage(storagePath, zipFile)

      if (error) {
        throw new Error(error.message || 'Greška pri upload-u ZIP arhive')
      }

      const uploaded = {
        name: zipFileName,
        url: getImageUrl(data!.path),
        type: 'image' as const,
        path: data!.path,
        size: zipBlob.size,
      }
      setUploadedZip(uploaded)
      setExistingZip(null)
      toast.success(`Upload-ovano ${files.length} slika u ZIP arhivi!`)
    } catch (error: any) {
      toast.error(error.message || 'Greška pri upload-u slika')
    }
  }

  const handleSaveRelease = async () => {
    if (!releaseName.trim()) {
      toast.error('Unesite ime saopštenja')
      return
    }

    const documentToUse = uploadedDocument || existingDocument
    const zipToUse = uploadedZip || existingZip

    if (!documentToUse && !zipToUse) {
      toast.error('Upload-ujte dokument ili slike')
      return
    }

    setSaving(true)
    try {
      const materialLinks = []
      if (documentToUse) {
        materialLinks.push({
          type: 'other',
          url: documentToUse.url,
          label: documentToUse.name,
        })
      }
      if (zipToUse) {
        materialLinks.push({
          type: 'other',
          url: zipToUse.url,
          label: 'Slike',
        })
      }

      // Konvertuj datum u ISO format
      const publishedAt = publishedDate 
        ? new Date(publishedDate + 'T00:00:00').toISOString()
        : new Date().toISOString()

      const releaseData = {
        title: releaseName,
        description: releaseName,
        content: `<p>${releaseName}</p>`,
        company_name: 'Admin',
        industry: 'General',
        tags: tags,
        material_links: materialLinks,
        alt_texts: [],
        seo_meta_description: releaseName,
        published_at: publishedAt,
      }

      const res = await fetch(`/api/releases/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(releaseData),
      })

      const responseData = await res.json()

      if (res.ok) {
        toast.success('Saopštenje ažurirano!')
        
        // Pošalji emailove dodatnim primaocima ako su navedeni
        if (additionalEmails.length > 0) {
          try {
            const emailRes = await fetch(`/api/releases/${params.id}/send-additional-emails`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ additional_emails: additionalEmails }),
            })
            
            const emailData = await emailRes.json()
            if (emailRes.ok) {
              toast.success(`Email obaveštenja poslata na ${emailData.sent}/${emailData.total} adresa`)
            }
          } catch (err) {
            // Ignoriši greške pri slanju emailova
          }
        }
        
        router.push('/')
      } else {
        throw new Error(responseData.error || 'Greška pri ažuriranju saopštenja')
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri ažuriranju saopštenja')
    } finally {
      setSaving(false)
    }
  }

  const formatFileSize = (bytes: number, unit: 'KB' | 'MB' = 'KB'): string => {
    if (bytes === 0) return '0 Bytes'
    if (unit === 'MB') {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }
    return (bytes / 1024).toFixed(2) + ' KB'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16">
        <div className="container-custom">
          <p className="text-gray-600">Učitavanje...</p>
        </div>
      </div>
    )
  }

  const documentToUse = uploadedDocument || existingDocument
  const zipToUse = uploadedZip || existingZip

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
          Izmeni saopštenje
        </h1>

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
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Datum *
            </label>
            <Input
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              required
            />
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
            {zipToUse && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  {uploadedZip ? '✓ Nova ZIP arhiva upload-ovana' : '✓ Postojeća ZIP arhiva'}: {zipToUse.name}
                  {zipToUse.size > 0 && ` (${formatFileSize(zipToUse.size, 'MB')})`}
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
            {documentToUse && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  {uploadedDocument ? '✓ Novi dokument upload-ovan' : '✓ Postojeći dokument'}: {documentToUse.name}
                  {documentToUse.size > 0 && ` (${formatFileSize(documentToUse.size, 'KB')})`}
                </p>
              </div>
            )}
          </Card>
        </div>

        {(documentToUse || zipToUse) && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#1d1d1f]">
                Sačuvaj izmene
              </h2>
              <Button
                onClick={handleSaveRelease}
                disabled={saving || !releaseName.trim()}
                className="flex items-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Čuvanje...' : 'Sačuvaj'}
              </Button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {documentToUse && (
                <p>✓ Dokument: {documentToUse.name} {documentToUse.size > 0 && `(${formatFileSize(documentToUse.size, 'KB')})`}</p>
              )}
              {zipToUse && (
                <p>✓ Slike (ZIP): {zipToUse.name} {zipToUse.size > 0 && `(${formatFileSize(zipToUse.size, 'MB')})`}</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

