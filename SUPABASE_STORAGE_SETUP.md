# Supabase Storage Setup

Za admin upload funkcionalnost, potrebno je da kreiraš Storage buckets u Supabase.

## Koraci:

### 1. Kreiraj Storage Buckets

Idi u Supabase Dashboard → **Storage** → **New bucket**

#### Bucket 1: `pr-images`
- **Name**: `pr-images`
- **Public bucket**: ✅ (checked)
- **File size limit**: 5 MB (ili više po potrebi)
- **Allowed MIME types**: `image/*`

#### Bucket 2: `pr-documents`
- **Name**: `pr-documents`
- **Public bucket**: ✅ (checked)
- **File size limit**: 10 MB (ili više po potrebi)
- **Allowed MIME types**: `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 2. Postavi RLS Policies

Idi u **Storage** → **Policies** za svaki bucket:

#### Za `pr-images` bucket:

**Policy 1: Authenticated users can upload**
```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pr-images');
```

**Policy 2: Anyone can read**
```sql
CREATE POLICY "Anyone can read images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pr-images');
```

**Policy 3: Users can delete their own files**
```sql
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pr-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Za `pr-documents` bucket:

**Policy 1: Authenticated users can upload**
```sql
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pr-documents');
```

**Policy 2: Anyone can read**
```sql
CREATE POLICY "Anyone can read documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pr-documents');
```

**Policy 3: Users can delete their own files**
```sql
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pr-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Testiraj Upload

1. Prijavi se u aplikaciju
2. Idi na `/dashboard/admin`
3. Pokušaj da upload-uješ sliku ili dokument
4. Proveri da li se fajl pojavio u Supabase Storage

## Napomena

- Fajlovi se čuvaju u strukturi: `{user_id}/{timestamp}-{filename}`
- Svaki korisnik vidi samo svoje upload-ovane fajlove
- Public buckets znači da su URL-ovi javno dostupni (bez autentikacije za čitanje)

