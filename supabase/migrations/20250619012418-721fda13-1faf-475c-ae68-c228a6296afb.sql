
-- First, drop the foreign key constraint that's blocking the type change
ALTER TABLE public.forum_posts DROP CONSTRAINT IF EXISTS forum_posts_author_id_fkey;

-- Now change author_id from UUID to TEXT to store wallet addresses
ALTER TABLE public.forum_posts ALTER COLUMN author_id TYPE TEXT;
