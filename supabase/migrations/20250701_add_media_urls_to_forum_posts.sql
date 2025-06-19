-- Add media_urls column to forum_posts for storing uploaded file URLs
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS media_urls text[]; 