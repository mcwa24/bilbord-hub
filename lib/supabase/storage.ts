import { createClient } from './client'

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ data: { path: string } | null; error: any }> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  return { data, error }
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
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
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
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  return { error }
}

