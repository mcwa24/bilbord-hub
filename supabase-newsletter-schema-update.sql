-- Dodaj user_id kolonu u newsletter_subscriptions tabelu
ALTER TABLE newsletter_subscriptions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Kreiraj index za user_id
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_user_id ON newsletter_subscriptions(user_id);

-- Poveži postojeće subscriptions sa user_id na osnovu email-a
UPDATE newsletter_subscriptions ns
SET user_id = au.id
FROM auth.users au
WHERE ns.email = LOWER(au.email)
  AND ns.user_id IS NULL;

-- Ažuriraj RLS policies da korisnici mogu da vide samo svoje subscriptions
DROP POLICY IF EXISTS "Users can read their own subscription" ON newsletter_subscriptions;
CREATE POLICY "Users can read their own subscription" ON newsletter_subscriptions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own subscription" ON newsletter_subscriptions;
CREATE POLICY "Users can update their own subscription" ON newsletter_subscriptions
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete their own subscription" ON newsletter_subscriptions;
CREATE POLICY "Users can delete their own subscription" ON newsletter_subscriptions
  FOR DELETE USING (
    auth.uid() = user_id OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
