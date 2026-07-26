// src/components/common/SEO.tsx

import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  siteName?: string;
  twitterHandle?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  children?: React.ReactNode;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  siteName = 'ShopHub',
  twitterHandle = '@shophub',
  noIndex = false,
  noFollow = false,
  children,
}) => {
  // ✅ Normalize keywords to array
  const normalizeKeywords = (input: string | string[] | undefined): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input.filter(Boolean).map(k => k.trim());
    }
    if (typeof input === 'string') {
      // If it's a JSON string
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).map(k => k.trim());
        }
      } catch (e) {
        // Not JSON, split by comma
        return input.split(',').map(k => k.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const keywordsArray = normalizeKeywords(keywords);
  const keywordsString = keywordsArray.join(', ');

  const metaTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || 'Shop the latest products and trends at ShopHub. Discover fashion, electronics, and more.';
  const metaImage = image || 'https://shophub.com/og-image.jpg';
  const metaUrl = url || 'https://shophub.com';

  return (
    <Helmet>
      <title>{metaTitle}</title>
      <meta name="title" content={metaTitle} />
      <meta name="description" content={metaDescription} />
      {keywordsArray.length > 0 && (
        <meta name="keywords" content={keywordsString} />
      )}
      <meta name="robots" content={`${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`} />
      {author && <meta name="author" content={author} />}
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteName} />
      {publishedTime && <meta property="og:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="og:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}

      {/* Viewport & Theme */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#ec4899" />

      {children}
    </Helmet>
  );
};

export default SEO;