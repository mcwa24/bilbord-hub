import { createClient } from './client'

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ data: { path: string } | null; error: any }> {
  try {
    // Proveri da li Supabase environment varijable postoje
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return {
        data: null,
        error: { message: 'Supabase nije konfigurisan' }
      }
    }

    const supabase = createClient()
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    return { data, error }
  } catch (error: any) {
    console.error('Storage upload error:', error)
    return {
      data: null,
      error: { message: error.message || 'Greška pri upload-u fajla' }
    }
  }
}

export async function uploadImage(
  path: string,
  file: File
): Promise<{ data: { path: string } | null; error: any }> {
  return uploadFile('pr-images', path, file)
}

export async function uploadDocument(
  path: string,
  file: File
): Promise<{ data: { path: string } | null; error: any }> {
  return uploadFile('pr-documents', path, file)
}

export function getPublicUrl(bucket: string, path: string): string {
  try {
    // Proveri da li Supabase environment varijable postoje
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return ''
    }

    const supabase = createClient()
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data?.publicUrl || ''
  } catch (error: any) {
    console.error('Storage getPublicUrl error:', error)
    return ''
  }
}

export function getImageUrl(path: string): string {
  return getPublicUrl('pr-images', path)
}

export function getDocumentUrl(path: string): string {
  return getPublicUrl('pr-documents', path)
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: any }> {
  try {
    // Proveri da li Supabase environment varijable postoje
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return { error: { message: 'Supabase nije konfigurisan' } }
    }

    const supabase = createClient()
    const { error } = await supabase.storage.from(bucket).remove([path])
    return { error }
  } catch (error: any) {
    console.error('Storage delete error:', error)
    return { error: { message: error.message || 'Greška pri brisanju fajla' } }
  }
}

