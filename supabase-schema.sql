-- pr_releases tabela
CREATE TABLE IF NOT EXISTS pr_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  material_links JSONB DEFAULT '[]',
  alt_texts JSONB DEFAULT '[]',
  seo_meta_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0
);

-- download_stats tabela
CREATE TABLE IF NOT EXISTS download_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES pr_releases(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  media_name TEXT,
  media_email TEXT
);

-- Indexi za brže pretrage
CREATE INDEX IF NOT EXISTS idx_pr_releases_published_at ON pr_releases(published_at);
CREATE INDEX IF NOT EXISTS idx_pr_releases_company_name ON pr_releases(company_name);
CREATE INDEX IF NOT EXISTS idx_pr_releases_industry ON pr_releases(industry);
CREATE INDEX IF NOT EXISTS idx_pr_releases_created_by ON pr_releases(created_by);
CREATE INDEX IF NOT EXISTS idx_download_stats_release_id ON download_stats(release_id);

-- RLS policies
ALTER TABLE pr_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Svi mogu da čitaju published releases
DROP POLICY IF EXISTS "Anyone can read published releases" ON pr_releases;
CREATE POLICY "Anyone can read published releases" ON pr_releases
  FOR SELECT USING (published_at IS NOT NULL);

-- Policy: Korisnici mogu da čitaju svoja saopštenja (čak i unpublished)
DROP POLICY IF EXISTS "Users can read their own releases" ON pr_releases;
CREATE POLICY "Users can read their own releases" ON pr_releases
  FOR SELECT USING (auth.uid() = created_by);

-- Policy: Korisnici mogu da kreiraju svoja saopštenja
DROP POLICY IF EXISTS "Users can create their own releases" ON pr_releases;
CREATE POLICY "Users can create their own releases" ON pr_releases
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy: Korisnici mogu da ažuriraju svoja saopštenja
DROP POLICY IF EXISTS "Users can update their own releases" ON pr_releases;
CREATE POLICY "Users can update their own releases" ON pr_releases
  FOR UPDATE USING (auth.uid() = created_by);

-- Policy: Korisnici mogu da brišu svoja saopštenja
DROP POLICY IF EXISTS "Users can delete their own releases" ON pr_releases;
CREATE POLICY "Users can delete their own releases" ON pr_releases
  FOR DELETE USING (auth.uid() = created_by);

-- Policy: Svi mogu da insert-uju download stats
DROP POLICY IF EXISTS "Anyone can insert download stats" ON download_stats;
CREATE POLICY "Anyone can insert download stats" ON download_stats
  FOR INSERT WITH CHECK (true);

-- Policy: Korisnici mogu da čitaju download stats za svoja saopštenja
DROP POLICY IF EXISTS "Users can read download stats for their releases" ON download_stats;
CREATE POLICY "Users can read download stats for their releases" ON download_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pr_releases
      WHERE pr_releases.id = download_stats.release_id
      AND pr_releases.created_by = auth.uid()
    )
  );

-- Funkcija za automatsko ažuriranje updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger za automatsko ažuriranje updated_at
DROP TRIGGER IF EXISTS update_pr_releases_updated_at ON pr_releases;
CREATE TRIGGER update_pr_releases_updated_at
    BEFORE UPDATE ON pr_releases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Storage buckets za fajlove i slike
-- Napomena: Ovo se mora uraditi ručno u Supabase Dashboard -> Storage
-- 1. Kreiraj bucket "pr-images" (public)
-- 2. Kreiraj bucket "pr-documents" (public)
-- 3. Postavi RLS policies:

-- Policy za pr-images: Authenticated users can upload
-- CREATE POLICY "Authenticated users can upload images" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'pr-images' AND
--     auth.role() = 'authenticated'
--   );

-- Policy za pr-images: Anyone can read
-- CREATE POLICY "Anyone can read images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'pr-images');

-- Policy za pr-documents: Authenticated users can upload
-- CREATE POLICY "Authenticated users can upload documents" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'pr-documents' AND
--     auth.role() = 'authenticated'
--   );

-- Policy za pr-documents: Anyone can read
-- CREATE POLICY "Anyone can read documents" ON storage.objects
--   FOR SELECT USING (bucket_id = 'pr-documents');

