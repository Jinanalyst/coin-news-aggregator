-- Create forum posts table
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0
);

-- Create forum comments table
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0
);

-- Create forum votes table
CREATE TABLE IF NOT EXISTS public.forum_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT vote_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    CONSTRAINT unique_post_vote UNIQUE (user_id, post_id) WHERE post_id IS NOT NULL,
    CONSTRAINT unique_comment_vote UNIQUE (user_id, comment_id) WHERE comment_id IS NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON public.forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_upvotes ON public.forum_posts(upvotes DESC);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON public.forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON public.forum_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent ON public.forum_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_forum_votes_post ON public.forum_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_comment ON public.forum_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_user ON public.forum_votes(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Anyone can read posts"
    ON public.forum_posts FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create posts"
    ON public.forum_posts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts"
    ON public.forum_posts FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts"
    ON public.forum_posts FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Anyone can read comments"
    ON public.forum_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON public.forum_comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments"
    ON public.forum_comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments"
    ON public.forum_comments FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- Votes policies
CREATE POLICY "Anyone can read votes"
    ON public.forum_votes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create votes"
    ON public.forum_votes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
    ON public.forum_votes FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
    ON public.forum_votes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id); 