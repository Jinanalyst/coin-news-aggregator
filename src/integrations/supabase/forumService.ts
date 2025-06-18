import { supabase } from './client';
import { Database } from './types';

type Post = Database['public']['Tables']['forum_posts']['Row'];
type Comment = Database['public']['Tables']['forum_comments']['Row'];
type Vote = Database['public']['Tables']['forum_votes']['Row'];

export const forumService = {
  // Posts
  async getPosts(sortBy: 'new' | 'hot' | 'top' = 'hot') {
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles(username, avatar_url),
        comments:forum_comments(count),
        votes:forum_votes(count)
      `);

    switch (sortBy) {
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('upvotes', { ascending: false });
        break;
      case 'hot':
        // Hot is a combination of recency and votes
        query = query.order('created_at', { ascending: false }).order('upvotes', { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createPost(title: string, content: string, authorId: string) {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        title,
        content,
        author_id: authorId,
        upvotes: 0,
        downvotes: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Comments
  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('forum_comments')
      .select(`
        *,
        author:profiles(username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createComment(postId: string, content: string, authorId: string, parentId?: string) {
    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: postId,
        content,
        author_id: authorId,
        parent_id: parentId,
        upvotes: 0,
        downvotes: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Votes
  async vote(userId: string, voteType: 'up' | 'down', postId?: string, commentId?: string) {
    // First check if user has already voted
    const { data: existingVote } = await supabase
      .from('forum_votes')
      .select()
      .match({
        user_id: userId,
        post_id: postId,
        comment_id: commentId
      })
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same button
        const { error } = await supabase
          .from('forum_votes')
          .delete()
          .match({
            user_id: userId,
            post_id: postId,
            comment_id: commentId
          });

        if (error) throw error;
      } else {
        // Change vote type if clicking different button
        const { error } = await supabase
          .from('forum_votes')
          .update({ vote_type: voteType })
          .match({
            user_id: userId,
            post_id: postId,
            comment_id: commentId
          });

        if (error) throw error;
      }
    } else {
      // Create new vote
      const { error } = await supabase
        .from('forum_votes')
        .insert({
          user_id: userId,
          post_id: postId,
          comment_id: commentId,
          vote_type: voteType
        });

      if (error) throw error;
    }

    // Update vote counts on post or comment
    if (postId) {
      const { count: upvotes } = await supabase
        .from('forum_votes')
        .select('*', { count: 'exact' })
        .match({ post_id: postId, vote_type: 'up' });

      const { count: downvotes } = await supabase
        .from('forum_votes')
        .select('*', { count: 'exact' })
        .match({ post_id: postId, vote_type: 'down' });

      await supabase
        .from('forum_posts')
        .update({ upvotes, downvotes })
        .eq('id', postId);
    }

    if (commentId) {
      const { count: upvotes } = await supabase
        .from('forum_votes')
        .select('*', { count: 'exact' })
        .match({ comment_id: commentId, vote_type: 'up' });

      const { count: downvotes } = await supabase
        .from('forum_votes')
        .select('*', { count: 'exact' })
        .match({ comment_id: commentId, vote_type: 'down' });

      await supabase
        .from('forum_comments')
        .update({ upvotes, downvotes })
        .eq('id', commentId);
    }
  }
}; 