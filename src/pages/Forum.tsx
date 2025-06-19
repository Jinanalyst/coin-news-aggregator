import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, MessageCircle, Share2, Award, MoreHorizontal, Wallet, LogOut } from "lucide-react";
import { SEO } from "@/components/SEO";
import { forumService, uploadFilesToSupabase } from '@/integrations/supabase/forumService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TipButton } from '@/components/TipButton';
import { MembershipPlansDialog } from '@/components/MembershipPlansDialog';

function linkify(text: string) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    part.match(/https?:\/\//) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>{part}</a>
    ) : (
      part
    )
  );
}

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
  wallet_address?: string;
}

const CreatePostDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { publicKey, connected: solanaConnected } = useWallet();
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const isWalletConnected = (solanaConnected && publicKey) || (ethConnected && ethAddress);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!isWalletConnected) throw new Error('Wallet not connected');
      const authorAddress = solanaConnected && publicKey
        ? publicKey.toBase58()
        : ethConnected && ethAddress
          ? ethAddress
          : '';
      let mediaUrls: string[] = [];
      if (files.length > 0) {
        mediaUrls = await uploadFilesToSupabase(files);
      }
      return forumService.createPost(title, content, authorAddress, mediaUrls);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: 'Post created!',
        description: 'Your post has been published successfully.',
      });
      onClose();
      setTitle('');
      setContent('');
      setFiles([]);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create post',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in both title and content',
        variant: 'destructive',
      });
      return;
    }
    createPostMutation.mutate();
  };

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
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
          />
          {/* Show previews */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {files.map((file, idx) => file.type.startsWith('image') ? (
              <img key={idx} src={URL.createObjectURL(file)} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
            ) : file.type.startsWith('video') ? (
              <video key={idx} src={URL.createObjectURL(file)} style={{ width: 60, height: 60, borderRadius: 6 }} controls />
            ) : null)}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
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
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const { publicKey, connected: solanaConnected } = useWallet();
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const isWalletConnected = (solanaConnected && publicKey) || (ethConnected && ethAddress);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [hasSelectedPlan, setHasSelectedPlan] = useState(false);

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

  const handleConnectWalletToPost = async () => {
    if (!solanaConnected) {
      await handleConnectWallet();
      // After connection, check membership
      if (solanaConnected && !(userPlan === 'free' || userPlan === 'pro' || userPlan === 'premium')) {
        setIsPlansOpen(true);
      }
      return;
    }
    if (!(userPlan === 'free' || userPlan === 'pro' || userPlan === 'premium')) {
      setIsPlansOpen(true);
      return;
    }
    setCanPost(true);
    setIsCreatePostOpen(true);
  };

  const handleCreatePost = () => {
    if (!isWalletConnected) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to create a post',
        variant: 'default',
      });
      return;
    }
    if (!(userPlan === 'free' || userPlan === 'pro' || userPlan === 'premium')) {
      setIsPlansOpen(true);
      return;
    }
    setCanPost(true);
    setIsCreatePostOpen(true);
  };

  const handlePlanSuccess = (plan: string) => {
    setUserPlan(plan);
    setCanPost(true);
    setIsCreatePostOpen(true);
    setIsPlansOpen(false);
    setHasSelectedPlan(true);
  };

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', sortBy],
    queryFn: () => forumService.getPosts(sortBy),
  });

  console.log('Posts query result:', { posts, isLoading, error });

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
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CN</span>
            </div>
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
              <span className="text-sm text-gray-600">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
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

      <MembershipPlansDialog open={isPlansOpen} onClose={() => setIsPlansOpen(false)} onSuccess={handlePlanSuccess} />
      <CreatePostDialog
        isOpen={isCreatePostOpen && canPost}
        onClose={() => { setIsCreatePostOpen(false); setCanPost(false); }}
      />

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading posts: {error.message}</p>
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center space-y-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => voteMutation.mutate({ postId: post.id, voteType: 'up' })}
                    disabled={!isConnected}
                  >
                    <ArrowUpCircle className="h-5 w-5" />
                  </Button>
                  <span className="font-medium">{(post.upvotes || 0) - (post.downvotes || 0)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => voteMutation.mutate({ postId: post.id, voteType: 'down' })}
                    disabled={!isConnected}
                  >
                    <ArrowDownCircle className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Avatar className="h-6 w-6">
                      <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs">{post.author.username.slice(0, 2).toUpperCase()}</span>
                      </div>
                    </Avatar>
                    <span>{post.author.username}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.created_at)}</span>
                  </div>
                  <h3 className="text-lg font-semibold mt-2">{post.title}</h3>
                  <div>{linkify(post.content)}</div>
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
                    {post.wallet_address && (
                      <TipButton recipient={post.wallet_address} />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts yet. Be the first to create one!</p>
            {!isConnected && (
              <Button onClick={handleConnectWallet} className="mt-4">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet to Post
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
