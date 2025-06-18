import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, MessageCircle, Share2, Award, MoreHorizontal, Wallet } from "lucide-react";
import { SEO } from "@/components/SEO";
import { forumService } from '@/integrations/supabase/forumService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from 'wagmi';
import { WalletKit } from '@reown/walletkit';
import { Core } from '@walletconnect/core';

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

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');
      
      return forumService.createPost(title, content, user.data.user.id);
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
              Post
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
  const [walletKit, setWalletKit] = useState<any>(null);

  useEffect(() => {
    const initWalletKit = async () => {
      try {
        const core = new Core({
          projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
        });

        const kit = await WalletKit.init({
          core,
          metadata: {
            name: 'CryptoNews Forum',
            description: 'Forum for crypto news and discussions',
            url: window.location.origin,
            icons: []
          }
        });
        setWalletKit(kit);
      } catch (error) {
        console.error('Failed to initialize WalletKit:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize wallet connection. Please make sure WalletConnect Project ID is configured.',
          variant: 'destructive',
        });
      }
    };

    if (!walletKit) {
      initWalletKit();
    }
  }, []);

  const handleConnectWallet = async () => {
    if (!walletKit) {
      toast({
        title: 'Error',
        description: 'Wallet connection not initialized',
        variant: 'destructive',
      });
      return;
    }

    try {
      await walletKit.connect();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', sortBy],
    queryFn: () => forumService.getPosts(sortBy),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: string; voteType: 'up' | 'down' }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Please sign in to vote');
      
      return forumService.vote(user.data.user.id, voteType, postId);
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
    <>
      <SEO 
        title="CryptoNews Hub Forum - Discuss Cryptocurrency News and Trends"
        description="Join the conversation about cryptocurrency news, market trends, and blockchain technology. Share insights and discuss with the crypto community."
      />
      <div className="min-h-screen bg-[#1a1a1b] text-gray-200">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#1a1a1b] border-b border-gray-700">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold">CryptoNews Forum</h1>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    className={sortBy === 'hot' ? 'bg-gray-700' : ''} 
                    onClick={() => setSortBy('hot')}
                  >
                    Hot
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={sortBy === 'new' ? 'bg-gray-700' : ''} 
                    onClick={() => setSortBy('new')}
                  >
                    New
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={sortBy === 'top' ? 'bg-gray-700' : ''} 
                    onClick={() => setSortBy('top')}
                  >
                    Top
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Input 
                  type="search" 
                  placeholder="Search posts" 
                  className="w-64 bg-gray-800 border-gray-700"
                />
                {isConnected ? (
                  <Button 
                    variant="default" 
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => setIsCreatePostOpen(true)}
                  >
                    Create Post
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={handleConnectWallet}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-3xl mx-auto">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="mb-4 bg-[#272729] border-gray-700 animate-pulse">
                  <div className="p-4">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </Card>
              ))
            ) : posts?.map((post: Post) => (
              <Card 
                key={post.id} 
                className="mb-4 bg-[#272729] border-gray-700 hover:border-gray-500 cursor-pointer"
                onClick={() => navigate(`/forum/post/${post.id}`)}
              >
                <div className="flex p-4">
                  {/* Voting */}
                  <div className="flex flex-col items-center mr-4 space-y-1">
                    <button 
                      className="text-gray-400 hover:text-orange-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        voteMutation.mutate({ postId: post.id, voteType: 'up' });
                      }}
                    >
                      <ArrowUpCircle size={20} />
                    </button>
                    <span className="text-sm font-medium">
                      {formatNumber(post.upvotes - post.downvotes)}
                    </span>
                    <button 
                      className="text-gray-400 hover:text-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        voteMutation.mutate({ postId: post.id, voteType: 'down' });
                      }}
                    >
                      <ArrowDownCircle size={20} />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1">
                    <div className="flex items-center text-xs text-gray-400 mb-2">
                      <span className="font-medium text-gray-300">Posted by u/{post.author.username}</span>
                      <span className="mx-1">•</span>
                      <span>{formatTimeAgo(post.created_at)}</span>
                    </div>
                    <h2 className="text-lg font-medium mb-2">{post.title}</h2>
                    <p className="text-gray-300 mb-3">{post.content}</p>
                    <div className="flex items-center space-x-4 text-gray-400">
                      <button 
                        className="flex items-center space-x-1 hover:bg-gray-700 px-2 py-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/forum/post/${post.id}`);
                        }}
                      >
                        <MessageCircle size={18} />
                        <span>{formatNumber(post.comments[0]?.count || 0)} Comments</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:bg-gray-700 px-2 py-1 rounded">
                        <Share2 size={18} />
                        <span>Share</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:bg-gray-700 px-2 py-1 rounded">
                        <Award size={18} />
                        <span>Award</span>
                      </button>
                      <button className="hover:bg-gray-700 px-2 py-1 rounded">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <CreatePostDialog 
        isOpen={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)} 
      />
    </>
  );
};

export default Forum; 