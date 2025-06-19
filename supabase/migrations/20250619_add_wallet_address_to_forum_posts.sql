-- Add wallet_address to forum_posts for Solana identity
alter table public.forum_posts add column if not exists wallet_address text;

-- Remove author_id foreign key if exists (optional, safe to ignore error if not present)
alter table public.forum_posts drop constraint if exists forum_posts_author_id_fkey;

-- (Optional) Remove author_id column if you want to go fully wallet-based
drop index if exists forum_posts_author_id_idx;
alter table public.forum_posts drop column if exists author_id; 