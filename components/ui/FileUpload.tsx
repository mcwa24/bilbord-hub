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
}

export default function FileUpload({
  accept,
  multiple = false,
  maxSize = 10,
  onUpload,
  label,
  type = 'document',
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

  const handleFiles = (newFiles: File[]) => {
    const validFiles: File[] = []
    const maxSizeBytes = maxSize * 1024 * 1024

    newFiles.forEach((file) => {
      if (file.size > maxSizeBytes) {
        toast.error(`Fajl ${file.name} je prevelik (max ${maxSize}MB)`)
        return
      }

      if (type === 'image' && !file.type.startsWith('image/')) {
        toast.error(`Fajl ${file.name} nije slika`)
        return
      }

      if (type === 'document' && !file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('msword') && !file.type.includes('document')) {
        toast.error(`Fajl ${file.name} nije PDF ili Word dokument`)
        return
      }

      validFiles.push(file)
    })

    if (multiple) {
      setFiles((prev) => [...prev, ...validFiles])
    } else {
      setFiles(validFiles.slice(0, 1))
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Izaberi fajlove za upload')
      return
    }

    setUploading(true)
    try {
      await onUpload(files)
      toast.success(`Uspešno upload-ovano ${files.length} fajlova`)
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
          accept={accept || (type === 'image' ? 'image/*' : '.pdf,.doc,.docx')}
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
                ? 'Slike (JPG, PNG, GIF) - max {maxSize}MB'
                : 'PDF ili Word dokumenti - max {maxSize}MB'}
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {type === 'image' ? (
                  <ImageIcon size={20} className="text-gray-600 flex-shrink-0" />
                ) : (
                  <File size={20} className="text-gray-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1d1d1f] truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-200 rounded transition"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Upload-ujem...
              </>
            ) : (
              <>
                <Upload size={18} className="mr-2" />
                Upload-uj fajlove
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

