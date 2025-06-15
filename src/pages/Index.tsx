
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Clock, Rss } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Rss className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">CryptoNews Hub</h1>
                <p className="text-purple-200">Real-time cryptocurrency news aggregator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <div className="text-sm text-purple-200 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last updated: {formatDate(lastUpdated.toISOString())}
                </div>
              )}
              <Button 
                onClick={fetchNews} 
                disabled={loading}
                variant="outline"
                className="border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* News Sources */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            Live Sources
          </h2>
          <div className="flex flex-wrap gap-2">
            {CRYPTO_RSS_FEEDS.map((feed) => (
              <Badge key={feed.name} variant="secondary" className="bg-white/10 text-white border-white/20">
                {feed.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <Skeleton className="h-4 w-20 bg-white/20" />
                  <Skeleton className="h-6 w-full bg-white/20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full bg-white/20 mb-4" />
                  <Skeleton className="h-4 w-32 bg-white/20" />
                </CardContent>
              </Card>
            ))
          ) : news.length > 0 ? (
            news.map((article) => (
              <Card 
                key={article.guid} 
                className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => window.open(article.link, '_blank')}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getSourceColor(article.source)} text-white border-0`}>
                      {article.source}
                    </Badge>
                    <ExternalLink className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-white text-lg leading-tight line-clamp-2 group-hover:text-purple-200 transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex items-center text-xs text-white/50">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(article.pubDate)}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-white/60 mb-4">
                <Rss className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No news articles available</p>
                <p className="text-sm">Try refreshing to fetch the latest news</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {news.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
              <div className="text-white">
                <span className="font-bold text-purple-300">{news.length}</span> articles
              </div>
              <div className="h-4 w-px bg-white/30"></div>
              <div className="text-white">
                <span className="font-bold text-purple-300">{CRYPTO_RSS_FEEDS.length}</span> sources
              </div>
              <div className="h-4 w-px bg-white/30"></div>
              <div className="text-white">
                <span className="font-bold text-purple-300">Auto-refresh</span> every 10min
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
