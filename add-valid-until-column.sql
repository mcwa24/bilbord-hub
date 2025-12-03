-- Dodaj valid_until kolonu u pr_releases tabelu
-- Ovo polje je opciono i označava do kada je vest aktuelna

ALTER TABLE pr_releases 
ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;

-- Dodaj index za brže pretrage po valid_until
CREATE INDEX IF NOT EXISTS idx_pr_releases_valid_until ON pr_releases(valid_until);

