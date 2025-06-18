import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, Rss, Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import NewsCard from "@/components/NewsCard";
import { SEO } from "@/components/SEO";
import { Link } from 'react-router-dom';

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  guid: string;
}

const CRYPTO_RSS_FEEDS = [
  { url: 'https://cointelegraph.com/rss', name: 'Cointelegraph', category: 'General' },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', name: 'CoinDesk', category: 'News' },
  { url: 'https://cryptonews.com/news/feed/', name: 'CryptoNews', category: 'Analysis' },
  { url: 'https://decrypt.co/feed', name: 'Decrypt', category: 'Technology' },
  { url: 'https://bitcoinist.com/feed/', name: 'Bitcoinist', category: 'Bitcoin' },
];

const Index = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const parseRSSFeed = async (feedUrl: string, sourceName: string): Promise<NewsItem[]> => {
    try {
      // Using a CORS proxy for RSS feeds in development
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data.status === 'ok') {
        return data.items.slice(0, 5).map((item: any) => ({
          title: item.title,
          description: item.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
          link: item.link,
          pubDate: item.pubDate,
          source: sourceName,
          guid: item.guid || item.link,
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching RSS from ${sourceName}:`, error);
      return [];
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const allNewsPromises = CRYPTO_RSS_FEEDS.map(feed => 
        parseRSSFeed(feed.url, feed.name)
      );
      
      const newsArrays = await Promise.all(allNewsPromises);
      const allNews = newsArrays.flat();
      
      // Sort by publication date
      const sortedNews = allNews.sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
      
      setNews(sortedNews);
      setLastUpdated(new Date());
      toast({
        title: "News Updated",
        description: `Fetched ${sortedNews.length} articles from ${CRYPTO_RSS_FEEDS.length} sources`,
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSourceColor = (source: string) => {
    const colors = {
      'Cointelegraph': 'bg-blue-500',
      'CoinDesk': 'bg-orange-500',
      'CryptoNews': 'bg-green-500',
      'Decrypt': 'bg-purple-500',
      'Bitcoinist': 'bg-yellow-500',
    };
    return colors[source as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <>
      <SEO
        title="CryptoNews Hub - Real-time Cryptocurrency News Aggregator"
        description="Get the latest cryptocurrency news from top sources like Cointelegraph, CoinDesk, CryptoNews, Decrypt, and Bitcoinist. Real-time updates and automatic translations."
        type="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header - Mobile optimized */}
        <div className="sticky top-0 z-10 bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                  <Rss className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-white">CryptoNews Hub</h1>
                  <p className="text-sm sm:text-base text-purple-200 hidden sm:block">Real-time cryptocurrency news aggregator with translation</p>
                  <p className="text-xs text-purple-200 sm:hidden">Mobile crypto news</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <Link 
                  to="/forum"
                  className="text-purple-200 hover:text-white transition-colors duration-200"
                >
                  Forum
                </Link>
                {lastUpdated && (
                  <div className="text-xs sm:text-sm text-purple-200 flex items-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Last updated: </span>
                    {formatDate(lastUpdated.toISOString())}
                  </div>
                )}
                <Button 
                  onClick={fetchNews} 
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* News Sources */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              Live Sources
            </h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {CRYPTO_RSS_FEEDS.map((feed) => (
                <Badge key={feed.name} variant="secondary" className="bg-white/10 text-white border-white/20 text-xs">
                  {feed.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* News Grid - Mobile responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <Skeleton className="h-4 w-20 bg-white/20" />
                    <Skeleton className="h-5 sm:h-6 w-full bg-white/20" />
                    <Skeleton className="h-12 sm:h-16 w-full bg-white/20" />
                    <Skeleton className="h-4 w-32 bg-white/20" />
                  </div>
                </div>
              ))
            ) : news.length > 0 ? (
              news.map((article) => (
                <NewsCard
                  key={article.guid}
                  article={article}
                  getSourceColor={getSourceColor}
                  formatDate={formatDate}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 sm:py-12">
                <div className="text-white/60 mb-4">
                  <Rss className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-base sm:text-lg">No news articles available</p>
                  <p className="text-sm">Try refreshing to fetch the latest news</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Stats - Mobile responsive */}
          {news.length > 0 && (
            <div className="mt-8 sm:mt-12 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-white/5 backdrop-blur-sm rounded-lg px-4 sm:px-6 py-3 border border-white/10">
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-white">
                    <span className="font-bold text-purple-300">{news.length}</span> articles
                  </div>
                  <div className="h-4 w-px bg-white/30"></div>
                  <div className="text-white">
                    <span className="font-bold text-purple-300">{CRYPTO_RSS_FEEDS.length}</span> sources
                  </div>
                </div>
                <div className="hidden sm:block h-4 w-px bg-white/30"></div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-white">
                    <span className="font-bold text-purple-300">Auto-refresh</span> <span className="hidden sm:inline">every 10min</span>
                  </div>
                  <div className="h-4 w-px bg-white/30"></div>
                  <div className="text-white flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    <span className="font-bold text-purple-300">Mobile</span> ready
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
