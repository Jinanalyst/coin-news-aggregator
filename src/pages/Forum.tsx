
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, MessageCircle, Share2, Award, MoreHorizontal, Wallet, LogOut } from "lucide-react";
import { SEO } from "@/components/SEO";
import { forumService } from '@/integrations/supabase/forumService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    avatar_url: string;
  };
  created_at: string;
  upvotes: number;
  downvotes: number;
  comments: { count: number }[];
}

const CreatePostDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('Wallet not connected');

      // Use the wallet address as the author ID directly
      return forumService.createPost(title, content, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: 'Post created!',
        description: 'Your post has been published successfully.',
      });
      onClose();
      setTitle('');
      setContent('');
    },
    onError: (error) => {
      console.error('Create post error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create post',
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={() => createPostMutation.mutate()}
              disabled={!title || !content || createPostMutation.isPending}
            >
              {createPostMutation.isPending ? 'Creating...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Forum = () => {
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      await open();
      toast({
        title: 'Success',
        description: 'Wallet connected successfully!',
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
      toast({
        title: 'Success',
        description: 'Wallet disconnected successfully!',
      });
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to disconnect wallet',
        variant: 'destructive',
      });
    }
  };

  const handleCreatePost = () => {
    if (!isConnected) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to create a post',
        variant: 'default',
      });
      handleConnectWallet();
      return;
    }
    setIsCreatePostOpen(true);
  };

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', sortBy],
    queryFn: () => forumService.getPosts(sortBy),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: string; voteType: 'up' | 'down' }) => {
      if (!address) throw new Error('Please connect your wallet to vote');
      
      return forumService.vote(address, voteType, postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to vote',
        variant: 'destructive',
      });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Forum - Crypto News" />
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/2e40a778-406c-49a2-a4f1-b096cc1671af.png" 
              alt="Crypto News Hub Logo" 
              className="h-12 w-auto"
            />
            <h1 className="text-2xl font-bold text-gray-900">Crypto Forum</h1>
          </div>
          <div className="space-x-2">
            <Button
              variant={sortBy === 'hot' ? 'default' : 'outline'}
              onClick={() => setSortBy('hot')}
            >
              Hot
            </Button>
            <Button
              variant={sortBy === 'new' ? 'default' : 'outline'}
              onClick={() => setSortBy('new')}
            >
              New
            </Button>
            <Button
              variant={sortBy === 'top' ? 'default' : 'outline'}
              onClick={() => setSortBy('top')}
            >
              Top
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <Button variant="outline" onClick={handleDisconnectWallet}>
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
              <Button onClick={handleCreatePost}>
                Create Post
              </Button>
            </>
          ) : (
            <Button onClick={handleConnectWallet} disabled={isConnecting}>
              {isConnecting ? (
                <>Connecting...</>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <CreatePostDialog
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />

      <div className="space-y-4">
        {isLoading ? (
          <div>Loading posts...</div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center space-y-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => voteMutation.mutate({ postId: post.id, voteType: 'up' })}
                  >
                    <ArrowUpCircle className="h-5 w-5" />
                  </Button>
                  <span>{post.upvotes - post.downvotes}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => voteMutation.mutate({ postId: post.id, voteType: 'down' })}
                  >
                    <ArrowDownCircle className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Avatar className="h-6 w-6">
                      <img src={post.author.avatar_url || '/placeholder.svg'} alt={post.author.username} />
                    </Avatar>
                    <span>{post.author.username}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.created_at)}</span>
                  </div>
                  <h3 className="text-lg font-semibold mt-2">{post.title}</h3>
                  <p className="mt-2 text-gray-600">{post.content}</p>
                  <div className="flex items-center space-x-4 mt-4">
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {post.comments?.length || 0} Comments
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Award className="h-4 w-4 mr-2" />
                      Award
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 ml-auto">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts yet. Be the first to create one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
