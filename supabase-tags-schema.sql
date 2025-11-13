-- Tabela za tagove
CREATE TABLE IF NOT EXISTS pr_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela za many-to-many relaciju između saopštenja i tagova
CREATE TABLE IF NOT EXISTS pr_release_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES pr_releases(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES pr_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(release_id, tag_id)
);

-- Indexi za brže pretrage
CREATE INDEX IF NOT EXISTS idx_pr_tags_name ON pr_tags(name);
CREATE INDEX IF NOT EXISTS idx_pr_tags_slug ON pr_tags(slug);
CREATE INDEX IF NOT EXISTS idx_pr_release_tags_release_id ON pr_release_tags(release_id);
CREATE INDEX IF NOT EXISTS idx_pr_release_tags_tag_id ON pr_release_tags(tag_id);

-- RLS policies za pr_tags
ALTER TABLE pr_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read tags" ON pr_tags;
CREATE POLICY "Anyone can read tags" ON pr_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create tags" ON pr_tags;
CREATE POLICY "Anyone can create tags" ON pr_tags
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update tags" ON pr_tags;
CREATE POLICY "Anyone can update tags" ON pr_tags
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete tags" ON pr_tags;
CREATE POLICY "Anyone can delete tags" ON pr_tags
  FOR DELETE USING (true);

-- RLS policies za pr_release_tags
ALTER TABLE pr_release_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read release tags" ON pr_release_tags;
CREATE POLICY "Anyone can read release tags" ON pr_release_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create release tags" ON pr_release_tags;
CREATE POLICY "Anyone can create release tags" ON pr_release_tags
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update release tags" ON pr_release_tags;
CREATE POLICY "Anyone can update release tags" ON pr_release_tags
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete release tags" ON pr_release_tags;
CREATE POLICY "Anyone can delete release tags" ON pr_release_tags
  FOR DELETE USING (true);

-- Funkcija za kreiranje slug-a od imena taga
CREATE OR REPLACE FUNCTION create_tag_slug(tag_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(tag_name, '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Funkcija za automatsko kreiranje slug-a pri insert-u taga
CREATE OR REPLACE FUNCTION set_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := create_tag_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger za automatsko postavljanje slug-a
DROP TRIGGER IF EXISTS trigger_set_tag_slug ON pr_tags;
CREATE TRIGGER trigger_set_tag_slug
  BEFORE INSERT OR UPDATE ON pr_tags
  FOR EACH ROW
  EXECUTE FUNCTION set_tag_slug();

-- Funkcija za automatsko ažuriranje updated_at za pr_tags
CREATE OR REPLACE FUNCTION update_pr_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger za automatsko ažuriranje updated_at
DROP TRIGGER IF EXISTS update_pr_tags_updated_at ON pr_tags;
CREATE TRIGGER update_pr_tags_updated_at
    BEFORE UPDATE ON pr_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_pr_tags_updated_at();

-- Funkcija za migraciju postojećih tagova iz TEXT[] u pr_tags tabelu
-- (Opciono - pokreni ručno ako želiš da migriraš postojeće tagove)
CREATE OR REPLACE FUNCTION migrate_existing_tags()
RETURNS void AS $$
DECLARE
  release_record RECORD;
  tag_name TEXT;
  tag_id UUID;
BEGIN
  FOR release_record IN SELECT id, tags FROM pr_releases WHERE tags IS NOT NULL AND array_length(tags, 1) > 0 LOOP
    FOREACH tag_name IN ARRAY release_record.tags LOOP
      -- Proveri da li tag već postoji
      SELECT id INTO tag_id FROM pr_tags WHERE name = tag_name;
      
      -- Ako ne postoji, kreiraj ga
      IF tag_id IS NULL THEN
        INSERT INTO pr_tags (name) VALUES (tag_name) RETURNING id INTO tag_id;
      END IF;
      
      -- Poveži tag sa saopštenjem (ako već nije povezan)
      INSERT INTO pr_release_tags (release_id, tag_id)
      VALUES (release_record.id, tag_id)
      ON CONFLICT (release_id, tag_id) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

