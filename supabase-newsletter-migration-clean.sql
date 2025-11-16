ALTER TABLE newsletter_subscriptions 
DROP CONSTRAINT IF EXISTS newsletter_subscriptions_user_id_fkey;

DROP INDEX IF EXISTS idx_newsletter_subscriptions_user_id;

UPDATE newsletter_subscriptions 
SET user_id = NULL 
WHERE user_id IS NOT NULL;

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

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'newsletter_subscriptions' 
    AND column_name = 'user_id'
  ) THEN
    RAISE NOTICE 'user_id kolona postoji - migration uspešan';
  ELSE
    ALTER TABLE newsletter_subscriptions 
    ADD COLUMN IF NOT EXISTS user_id UUID;
    RAISE NOTICE 'user_id kolona dodata';
  END IF;
END $$;

