CREATE INDEX IF NOT EXISTS idx_pr_releases_tags ON pr_releases USING GIN(tags);
