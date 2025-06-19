-- Allow inserts if wallet_address is present
CREATE POLICY "Allow wallet users to insert"
  ON forum_posts
  FOR INSERT
  WITH CHECK (wallet_address IS NOT NULL); 