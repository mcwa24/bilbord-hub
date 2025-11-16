-- Migration: Ukloni zavisnost od auth.users za newsletter subscriptions
-- Pokreni ovaj SQL u Supabase SQL Editor-u

-- 1. Ukloni foreign key constraint sa user_id (ako postoji)
ALTER TABLE newsletter_subscriptions 
DROP CONSTRAINT IF EXISTS newsletter_subscriptions_user_id_fkey;

-- 2. Ukloni index za user_id (ako postoji)
DROP INDEX IF EXISTS idx_newsletter_subscriptions_user_id;

-- 3. Postavi sve user_id vrednosti na NULL (ako postoje)
UPDATE newsletter_subscriptions 
SET user_id = NULL 
WHERE user_id IS NOT NULL;

-- 4. Ukloni user_id kolonu (opciono - možete je ostaviti ako želite)
-- ALTER TABLE newsletter_subscriptions DROP COLUMN IF EXISTS user_id;

-- 5. Ažuriraj RLS policies - svi mogu da kreiraju/čitaju/ažuriraju subscriptions
DROP POLICY IF EXISTS "Anyone can create subscription" ON newsletter_subscriptions;
CREATE POLICY "Anyone can create subscription" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read their own subscription" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can read subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Anyone can read subscriptions" ON newsletter_subscriptions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own subscription" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can update subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Anyone can update subscriptions" ON newsletter_subscriptions
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete their own subscription" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can delete subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Anyone can delete subscriptions" ON newsletter_subscriptions
  FOR DELETE USING (true);

-- 6. Proveri da li tabela postoji sa svim potrebnim kolonama
-- (Ako tabela ne postoji, pokreni supabase-newsletter-schema.sql prvo)
DO $$
BEGIN
  -- Proveri da li postoji user_id kolona
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'newsletter_subscriptions' 
    AND column_name = 'user_id'
  ) THEN
    -- Kolona postoji, sve je u redu
    RAISE NOTICE 'user_id kolona postoji - migration uspešan';
  ELSE
    -- Kolona ne postoji, dodaj je kao nullable (za kompatibilnost)
    ALTER TABLE newsletter_subscriptions 
    ADD COLUMN IF NOT EXISTS user_id UUID;
    RAISE NOTICE 'user_id kolona dodata';
  END IF;
END $$;

