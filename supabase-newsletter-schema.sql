-- Newsletter subscriptions tabela
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  receive_all BOOLEAN DEFAULT true, -- Ako je true, prima sva saopštenja; ako je false, filtrira po tagovima
  subscribed_tags TEXT[] DEFAULT '{}', -- Lista tagova koje korisnik želi da prima
  verification_token TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_email_sent_at TIMESTAMPTZ
);

-- Indexi za brže pretrage
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_is_active ON newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_is_verified ON newsletter_subscriptions(is_verified);

-- RLS policies
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Svi mogu da kreiraju subscription (za prijavu)
DROP POLICY IF EXISTS "Anyone can create subscription" ON newsletter_subscriptions;
CREATE POLICY "Anyone can create subscription" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

-- Policy: Korisnici mogu da čitaju svoju subscription (po email-u)
DROP POLICY IF EXISTS "Users can read their own subscription" ON newsletter_subscriptions;
CREATE POLICY "Users can read their own subscription" ON newsletter_subscriptions
  FOR SELECT USING (true);

-- Policy: Korisnici mogu da ažuriraju svoju subscription (po email-u ili token-u)
DROP POLICY IF EXISTS "Users can update their own subscription" ON newsletter_subscriptions;
CREATE POLICY "Users can update their own subscription" ON newsletter_subscriptions
  FOR UPDATE USING (true);

-- Policy: Korisnici mogu da obrišu svoju subscription
DROP POLICY IF EXISTS "Users can delete their own subscription" ON newsletter_subscriptions;
CREATE POLICY "Users can delete their own subscription" ON newsletter_subscriptions
  FOR DELETE USING (true);

