'use client'

import { useState, useRef, DragEvent } from 'react'
import { Upload, X, File, Image as ImageIcon, Loader2 } from 'lucide-react'
import Button from './Button'
import toast from 'react-hot-toast'

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onUpload: (files: File[]) => Promise<void>
  label?: string
  type?: 'image' | 'document'
  allowZip?: boolean // Allow ZIP archives for images
}

export default function FileUpload({
  accept,
  multiple = false,
  maxSize = 10,
  onUpload,
  label,
  type = 'document',
  allowZip = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (newFiles: File[]) => {
    const validFiles: File[] = []
    const maxSizeBytes = maxSize * 1024 * 1024

    newFiles.forEach((file) => {
      if (file.size > maxSizeBytes) {
        toast.error(`Fajl ${file.name} je prevelik (max ${maxSize}MB)`)
        return
      }

      // Ako je ZIP fajl i dozvoljen za slike
      if (type === 'image' && allowZip && file.name.toLowerCase().endsWith('.zip')) {
        validFiles.push(file)
        return
      }

      if (type === 'image' && !file.type.startsWith('image/')) {
        toast.error(`Fajl ${file.name} nije slika ili ZIP arhiva`)
        return
      }

      if (type === 'document' && !file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('msword') && !file.type.includes('document')) {
        toast.error(`Fajl ${file.name} nije PDF ili Word dokument`)
        return
      }

      validFiles.push(file)
    })

    if (validFiles.length === 0) return

    // Automatski upload čim se doda fajl
    setUploading(true)
    try {
      await onUpload(validFiles)
      toast.success(`Uspešno upload-ovano ${validFiles.length} ${validFiles.length === 1 ? 'fajl' : 'fajlova'}`)
      setFiles([])
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (error: any) {
      toast.error(error.message || 'Greška pri upload-u')
    } finally {
      setUploading(false)
    }
  }


  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-[#1d1d1f] mb-2">
          {label}
        </label>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-[#f9c344] bg-[#f9c344]/10'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept || (type === 'image' ? (allowZip ? 'image/*,.zip' : 'image/*') : '.pdf,.doc,.docx')}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          {type === 'image' ? (
            <ImageIcon size={48} className="text-gray-400" />
          ) : (
            <File size={48} className="text-gray-400" />
          )}
          <div>
            <p className="text-gray-600 mb-1">
              Prevuci fajlove ovde ili{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-[#1d1d1f] font-semibold hover:underline"
              >
                izaberi fajlove
              </button>
            </p>
            <p className="text-sm text-gray-500">
              {type === 'image'
                ? allowZip
                  ? `Slike (JPG, PNG, GIF) ili ZIP arhiva - max ${maxSize}MB`
                  : `Slike (JPG, PNG, GIF) - max ${maxSize}MB`
                : `PDF ili Word dokumenti - max ${maxSize}MB`}
            </p>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
          <Loader2 size={20} className="animate-spin" />
          <span>Upload-ujem fajlove...</span>
        </div>
      )}
    </div>
  )
}

