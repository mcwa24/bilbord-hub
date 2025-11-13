'use client'

import { useState } from 'react'
import { Image as ImageIcon, FileText, Link as LinkIcon } from 'lucide-react'
import FileUpload from '@/components/ui/FileUpload'
import Card from '@/components/ui/Card'
import { uploadImage, uploadDocument, getImageUrl, getDocumentUrl } from '@/lib/supabase/storage'
import toast from 'react-hot-toast'

interface UploadedFile {
  name: string
  url: string
  type: 'image' | 'document'
  path: string
}

export default function AdminPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const handleImageUpload = async (files: File[]) => {
    const supabase = (await import('@/lib/supabase/client')).createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Morate biti prijavljeni')
    }

    const uploadPromises = files.map(async (file) => {
      const timestamp = Date.now()
      const fileName = `${user.id}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      const { data, error } = await uploadImage(fileName, file)
      if (error) throw error

      return {
        name: file.name,
        url: getImageUrl(data!.path),
        type: 'image' as const,
        path: data!.path,
      }
    })

    const results = await Promise.all(uploadPromises)
    setUploadedFiles((prev) => [...prev, ...results])
  }

  const handleDocumentUpload = async (files: File[]) => {
    const supabase = (await import('@/lib/supabase/client')).createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Morate biti prijavljeni')
    }

    const uploadPromises = files.map(async (file) => {
      const timestamp = Date.now()
      const fileName = `${user.id}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      try {
        const { data, error } = await uploadDocument(fileName, file)
        if (error) {
          console.error('Upload error:', error)
          throw new Error(error.message || 'Greška pri upload-u dokumenta')
        }

        return {
          name: file.name,
          url: getDocumentUrl(data!.path),
          type: 'document' as const,
          path: data!.path,
        }
      } catch (error: any) {
        console.error('Upload error:', error)
        throw new Error(error.message || 'Greška pri upload-u dokumenta')
      }
    })

    const results = await Promise.all(uploadPromises)
    setUploadedFiles((prev) => [...prev, ...results])
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      toast.success('URL kopiran!')
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      toast.error('Greška pri kopiranju')
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
          Admin - Upload fajlova
        </h1>

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
              maxSize={5}
              onUpload={handleImageUpload}
              label="Slike za PR objave"
            />
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
              multiple
              maxSize={10}
              onUpload={handleDocumentUpload}
              label="PDF ili Word dokumenti"
            />
          </Card>
        </div>

        {uploadedFiles.length > 0 && (
          <Card>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">
              Upload-ovani fajlovi ({uploadedFiles.length})
            </h2>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {file.type === 'image' ? (
                      <ImageIcon size={20} className="text-gray-600 flex-shrink-0" />
                    ) : (
                      <FileText size={20} className="text-gray-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1d1d1f] truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 truncate max-w-md">
                          {file.url}
                        </p>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(file.url)}
                          className="p-1 hover:bg-gray-200 rounded transition"
                          title="Kopiraj URL"
                        >
                          <LinkIcon
                            size={14}
                            className={`${
                              copiedUrl === file.url ? 'text-[#f9c344]' : 'text-gray-600'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                  {file.type === 'image' && (
                    <div className="ml-4 flex-shrink-0">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-4 p-2 hover:bg-gray-200 rounded transition"
                  >
                    <span className="text-gray-600">×</span>
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

