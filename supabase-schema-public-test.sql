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
  created_by UUID,
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

-- Policy: Svi mogu da čitaju sve releases (za testiranje)
DROP POLICY IF EXISTS "Anyone can read all releases" ON pr_releases;
CREATE POLICY "Anyone can read all releases" ON pr_releases
  FOR SELECT USING (true);

-- Policy: Svi mogu da kreiraju releases (za testiranje)
DROP POLICY IF EXISTS "Anyone can create releases" ON pr_releases;
CREATE POLICY "Anyone can create releases" ON pr_releases
  FOR INSERT WITH CHECK (true);

-- Policy: Svi mogu da ažuriraju releases (za testiranje)
DROP POLICY IF EXISTS "Anyone can update releases" ON pr_releases;
CREATE POLICY "Anyone can update releases" ON pr_releases
  FOR UPDATE USING (true);

-- Policy: Svi mogu da brišu releases (za testiranje)
DROP POLICY IF EXISTS "Anyone can delete releases" ON pr_releases;
CREATE POLICY "Anyone can delete releases" ON pr_releases
  FOR DELETE USING (true);

-- Policy: Svi mogu da insert-uju download stats
DROP POLICY IF EXISTS "Anyone can insert download stats" ON download_stats;
CREATE POLICY "Anyone can insert download stats" ON download_stats
  FOR INSERT WITH CHECK (true);

-- Policy: Svi mogu da čitaju download stats (za testiranje)
DROP POLICY IF EXISTS "Anyone can read download stats" ON download_stats;
CREATE POLICY "Anyone can read download stats" ON download_stats
  FOR SELECT USING (true);

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

