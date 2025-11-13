'use client'

import { useState } from 'react'
import { Image as ImageIcon, FileText, Link as LinkIcon, Save } from 'lucide-react'
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
}

export default function AdminPage() {
  const [releaseName, setReleaseName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedDocument, setUploadedDocument] = useState<UploadedFile | null>(null)
  const [uploadedZip, setUploadedZip] = useState<UploadedFile | null>(null)

  const handleDocumentUpload = async (files: File[]) => {
    if (files.length === 0) return
    const file = files[0] // Uzmi prvi fajl
    setDocumentFile(file)
    
    const timestamp = Date.now()
    const fileName = `uploads/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    try {
      const { data, error } = await uploadDocument(fileName, file)
      if (error) {
        console.error('Upload error:', error)
        throw new Error(error.message || 'Greška pri upload-u dokumenta')
      }

      const uploaded = {
        name: file.name,
        url: getDocumentUrl(data!.path),
        type: 'document' as const,
        path: data!.path,
        size: file.size,
      }
      setUploadedDocument(uploaded)
      toast.success('Dokument upload-ovan!')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Greška pri upload-u dokumenta')
    }
  }

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return
    
    setImageFiles(files)
    
    try {
      // Pakuj sve slike u jedan ZIP
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      files.forEach((file) => {
        zip.file(file.name, file)
      })

      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 1 } // Niska kompresija za zadržavanje kvaliteta
      })
      
      const timestamp = Date.now()
      const zipFileName = `slike-${timestamp}.zip`
      const zipFile = new File([zipBlob], zipFileName, { type: 'application/zip' })

      // Upload-uj ZIP fajl
      const fileName = `uploads/${timestamp}-${zipFileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const { data, error } = await uploadImage(fileName, zipFile)
      
      if (error) {
        console.error('Upload error:', error)
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
      toast.success(`Upload-ovano ${files.length} slika u ZIP arhivi!`)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Greška pri upload-u slika')
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
        })
      }
      if (uploadedZip) {
        materialLinks.push({
          type: 'other',
          url: uploadedZip.url,
          label: 'Slike',
        })
      }

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
        published_at: new Date().toISOString(),
      }

      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(releaseData),
      })

      const responseData = await res.json()

      if (res.ok) {
        toast.success('Saopštenje kreirano!')
        // Reset forme
        setReleaseName('')
        setTags([])
        setDocumentFile(null)
        setImageFiles([])
        setUploadedDocument(null)
        setUploadedZip(null)
      } else {
        console.error('API error:', responseData)
        throw new Error(responseData.error || 'Greška pri kreiranju saopštenja')
      }
    } catch (error: any) {
      console.error('Error saving release:', error)
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

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
          Admin - Upload fajlova
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
          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
              Tagovi
            </label>
            <TagInput tags={tags} onChange={setTags} />
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

