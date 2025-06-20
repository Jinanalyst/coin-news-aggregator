import { supabase } from './client';
import { Database } from './types';

type Post = Database['public']['Tables']['forum_posts']['Row'];
type Comment = Database['public']['Tables']['forum_comments']['Row'];
type Vote = Database['public']['Tables']['forum_votes']['Row'];

// Helper to upload files to Supabase Storage and return URLs
export async function uploadFilesToSupabase(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const filePath = `forum-uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { data, error } = await supabase.storage.from('public').upload(filePath, file);
    if (error) throw error;
    const { publicURL } = supabase.storage.from('public').getPublicUrl(filePath).data;
    if (publicURL) urls.push(publicURL);
  }
  return urls;
}

export const forumService = {
  // Posts
  async getPosts(sortBy: 'new' | 'hot' | 'top' = 'hot') {
    console.log('Fetching posts with sortBy:', sortBy);
    
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
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
    
    console.log('Posts query result:', { data, error });
    
    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
    
    // Add mock author data since we don't have a users table
    const postsWithAuthors = data?.map(post => ({
      ...post,
      author: {
        username: `User_${post.author_id?.slice(-8) || 'Unknown'}`,
        avatar_url: '/placeholder.svg'
      }
    })) || [];
    
    console.log('Posts with authors:', postsWithAuthors);
    return postsWithAuthors;
  },

  async createPost(title: string, content: string, authorId: string, mediaUrls: string[] = []) {
    console.log('Creating post with parameters:', { title, content, authorId, mediaUrls });
    const postData = {
      title: title.trim(),
      content: content.trim(),
      author_id: authorId,
      media_urls: mediaUrls,
      upvotes: 0,
      downvotes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    console.log('Inserting post data:', postData);
    const { data, error } = await supabase
      .from('forum_posts')
      .insert(postData)
      .select()
      .single();
    console.log('Create post result:', { data, error });
    if (error) {
      console.error('Create post error details:', error);
      throw new Error(`Failed to create post: ${error.message}`);
    }
    return data;
  },

  // Comments
  async getComments(postId: string) {
    console.log('Fetching comments for post:', postId);
    
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
    
    // Add mock author data since we don't have a users table
    return data?.map(comment => ({
      ...comment,
      author: {
        username: `User_${comment.author_id?.slice(-8) || 'Unknown'}`,
        avatar_url: '/placeholder.svg'
      }
    })) || [];
  },

  async createComment(postId: string, content: string, authorId: string, parentId?: string) {
    console.log('Creating comment with parameters:', { postId, content, authorId, parentId });
    
    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: postId,
        content: content.trim(),
        author_id: authorId,
        parent_id: parentId,
        upvotes: 0,
        downvotes: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Create comment error:', error);
      throw error;
    }
    return data;
  },

  // Votes
  async vote(userId: string, voteType: 'up' | 'down', postId?: string, commentId?: string) {
    console.log('Voting with parameters:', { userId, voteType, postId, commentId });
    
    // First check if user has already voted
    const { data: existingVote } = await supabase
      .from('forum_votes')
      .select()
      .match({
        user_id: userId,
        post_id: postId || null,
        comment_id: commentId || null
      })
      .single();

    console.log('Existing vote:', existingVote);

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same button
        const { error } = await supabase
          .from('forum_votes')
          .delete()
          .match({
            user_id: userId,
            post_id: postId || null,
            comment_id: commentId || null
          });

        if (error) {
          console.error('Error removing vote:', error);
          throw error;
        }
      } else {
        // Change vote type if clicking different button
        const { error } = await supabase
          .from('forum_votes')
          .update({ vote_type: voteType })
          .match({
            user_id: userId,
            post_id: postId || null,
            comment_id: commentId || null
          });

        if (error) {
          console.error('Error updating vote:', error);
          throw error;
        }
      }
    } else {
      // Create new vote
      const { error } = await supabase
        .from('forum_votes')
        .insert({
          user_id: userId,
          post_id: postId || null,
          comment_id: commentId || null,
          vote_type: voteType
        });

      if (error) {
        console.error('Error creating vote:', error);
        throw error;
      }
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
        .update({ upvotes: upvotes || 0, downvotes: downvotes || 0 })
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
        .update({ upvotes: upvotes || 0, downvotes: downvotes || 0 })
        .eq('id', commentId);
    }
  }
};
