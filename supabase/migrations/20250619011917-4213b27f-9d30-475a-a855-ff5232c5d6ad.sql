
-- Enable Row Level Security on forum_comments
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on forum_votes  
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_comments
-- Anyone can read comments
CREATE POLICY "Anyone can read comments"
    ON public.forum_comments FOR SELECT
    USING (true);

-- Users can create comments (no auth required for now since we're using wallet addresses)
CREATE POLICY "Anyone can create comments"
    ON public.forum_comments FOR INSERT
    WITH CHECK (true);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
    ON public.forum_comments FOR UPDATE
    USING (author_id IS NOT NULL);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
    ON public.forum_comments FOR DELETE
    USING (author_id IS NOT NULL);

-- RLS Policies for forum_votes
-- Anyone can read votes
CREATE POLICY "Anyone can read votes"
    ON public.forum_votes FOR SELECT
    USING (true);

-- Users can create votes (no auth required for now since we're using wallet addresses)
CREATE POLICY "Anyone can create votes"
    ON public.forum_votes FOR INSERT
    WITH CHECK (true);

-- Users can update their own votes
CREATE POLICY "Users can update their own votes"
    ON public.forum_votes FOR UPDATE
    USING (user_id IS NOT NULL);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes"
    ON public.forum_votes FOR DELETE
    USING (user_id IS NOT NULL);
