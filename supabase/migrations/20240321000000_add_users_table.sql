-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT UNIQUE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    is_wallet_user BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update forum_posts to reference users table
ALTER TABLE public.forum_posts
DROP CONSTRAINT forum_posts_author_id_fkey,
ADD CONSTRAINT forum_posts_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.users(id)
    ON DELETE CASCADE;

-- Update forum_comments to reference users table
ALTER TABLE public.forum_comments
DROP CONSTRAINT forum_comments_author_id_fkey,
ADD CONSTRAINT forum_comments_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.users(id)
    ON DELETE CASCADE;

-- Update forum_votes to reference users table
ALTER TABLE public.forum_votes
DROP CONSTRAINT forum_votes_user_id_fkey,
ADD CONSTRAINT forum_votes_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(id)
    ON DELETE CASCADE;

-- Add RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Anyone can read users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid()::text = wallet_address);

-- Create index for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address); 