DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
CREATE POLICY "Anyone can upload images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'pr-images');

DROP POLICY IF EXISTS "Anyone can read images" ON storage.objects;
CREATE POLICY "Anyone can read images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pr-images');

DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;
CREATE POLICY "Anyone can update images"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'pr-images')
WITH CHECK (bucket_id = 'pr-images');

DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
CREATE POLICY "Anyone can delete images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'pr-images');

DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
CREATE POLICY "Anyone can upload documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'pr-documents');

DROP POLICY IF EXISTS "Anyone can read documents" ON storage.objects;
CREATE POLICY "Anyone can read documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pr-documents');

DROP POLICY IF EXISTS "Anyone can update documents" ON storage.objects;
CREATE POLICY "Anyone can update documents"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'pr-documents')
WITH CHECK (bucket_id = 'pr-documents');

DROP POLICY IF EXISTS "Anyone can delete documents" ON storage.objects;
CREATE POLICY "Anyone can delete documents"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'pr-documents');
