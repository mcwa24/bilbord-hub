-- Newsletter subscriptions tabela (simplified - bez user_id)
-- Pokreni ovaj SQL u Supabase SQL Editor-u ako već imaš tabelu sa user_id kolonom

-- Ako tabela već postoji, ukloni user_id kolonu (ako postoji)
ALTER TABLE newsletter_subscriptions 
DROP COLUMN IF EXISTS user_id;

-- Ako tabela ne postoji, kreiraj je
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  receive_all BOOLEAN DEFAULT true,
  subscribed_tags TEXT[] DEFAULT '{}',
  verification_token TEXT,
  is_verified BOOLEAN DEFAULT false,
  user_id UUID, -- Ostavljamo nullable za kompatibilnost, ali ne koristimo ga
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_email_sent_at TIMESTAMPTZ
);

-- Indexi za brže pretrage
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_is_active ON newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_is_verified ON newsletter_subscriptions(is_verified);

-- RLS policies (simplified - svi mogu da kreiraju/čitaju/ažuriraju)
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Svi mogu da kreiraju subscription (za prijavu)
DROP POLICY IF EXISTS "Anyone can create subscription" ON newsletter_subscriptions;
CREATE POLICY "Anyone can create subscription" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

-- Policy: Svi mogu da čitaju subscriptions (za admin panel i sl.)
DROP POLICY IF EXISTS "Anyone can read subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Anyone can read subscriptions" ON newsletter_subscriptions
  FOR SELECT USING (true);

-- Policy: Svi mogu da ažuriraju subscriptions (za verifikaciju i odjavu)
DROP POLICY IF EXISTS "Anyone can update subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Anyone can update subscriptions" ON newsletter_subscriptions
  FOR UPDATE USING (true);

-- Policy: Svi mogu da obrišu subscriptions (za odjavu)
DROP POLICY IF EXISTS "Anyone can delete subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Anyone can delete subscriptions" ON newsletter_subscriptions
  FOR DELETE USING (true);

