import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
  };
}

export const SEO = ({
  title = 'CryptoNews Hub - Real-time Crypto News Aggregator',
  description = 'Stay updated with the latest cryptocurrency news from top sources. Real-time RSS feed aggregation from Cointelegraph, CoinDesk, and more.',
  image = 'https://lovable.dev/opengraph-image-p98pqg.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://cryptonews.opinionomics.co.kr',
  type = 'website',
  article,
}: SEOProps) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'NewsArticle' : 'WebSite',
    headline: title,
    description,
    image,
    url,
    ...(article && {
      datePublished: article.publishedTime,
      dateModified: article.modifiedTime,
      author: article.authors?.map(author => ({
        '@type': 'Person',
        name: author,
      })),
      keywords: article.tags?.join(', '),
    }),
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article Specific Meta Tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          {article.authors?.map((author, index) => (
            <meta key={index} property="article:author" content={author} />
          ))}
          {article.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
}; 