import api from './api';
import { SEOConfig, SEOData, StructuredData } from '../types/seo';

let cachedConfig: SEOConfig | null = null;

const defaultConfig: SEOConfig = {
  siteName: 'ShopHub',
  siteDescription: 'Your premier destination for fashion and lifestyle products.',
  siteUrl: 'https://shophub.com',
  siteImage: 'https://shophub.com/og-image.jpg',
  twitterHandle: '@shophub',
  facebookAppId: '',
  keywords: ['fashion', 'clothing', 'shoes', 'accessories'],
  author: 'ShopHub Team',
};

export const seoService = {
  // ----- API Methods -----
  async getConfig(): Promise<SEOConfig> {
    if (cachedConfig) return cachedConfig;
    try {
      const res = await api.get('/seo');
      cachedConfig = res.data.data;
      return cachedConfig;
    } catch (error: any) {
      // ✅ Handle 403 gracefully - return default config
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.warn('⚠️ SEO API access denied, using default config');
        cachedConfig = defaultConfig;
        return cachedConfig;
      }
      console.error('Error fetching SEO config:', error);
      cachedConfig = defaultConfig;
      return cachedConfig;
    }
  },

  async updateConfig(config: Partial<SEOConfig>): Promise<SEOConfig> {
    try {
      const current = await this.getConfig();
      const updated = { ...current, ...config };
      const res = await api.put('/seo', updated);
      cachedConfig = res.data.data;
      return cachedConfig;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.warn('⚠️ SEO API access denied for update');
        // Return merged config without saving to server
        const current = await this.getConfig();
        const updated = { ...current, ...config };
        cachedConfig = updated;
        return updated;
      }
      throw error;
    }
  },

  // ----- Synchronous helpers (use cachedConfig or default) -----
  getCurrentConfig(): SEOConfig {
    return cachedConfig || defaultConfig;
  },

  generateMetaTags(data: SEOData): string {
    const config = this.getCurrentConfig();
    const title = data.title ? `${data.title} | ${config.siteName}` : config.siteName;
    const description = data.description || config.siteDescription;
    const image = data.image || config.siteImage;
    const url = data.url || config.siteUrl;
    const keywords = data.keywords || config.keywords;

    return `
      <title>${title}</title>
      <meta name="title" content="${title}" />
      <meta name="description" content="${description}" />
      <meta name="keywords" content="${keywords.join(', ')}" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="${data.author || config.author}" />
      <link rel="canonical" href="${url}" />
      <meta property="og:type" content="${data.type || 'website'}" />
      <meta property="og:url" content="${url}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:site_name" content="${config.siteName}" />
      ${config.facebookAppId ? `<meta property="fb:app_id" content="${config.facebookAppId}" />` : ''}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="${url}" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${image}" />
      ${config.twitterHandle ? `<meta name="twitter:site" content="${config.twitterHandle}" />` : ''}
      ${config.twitterHandle ? `<meta name="twitter:creator" content="${config.twitterHandle}" />` : ''}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#ec4899" />
    `;
  },

  generateStructuredData(data: StructuredData): string {
    const config = this.getCurrentConfig();
    const baseData = {
      '@context': 'https://schema.org',
      '@type': data['@type'] || 'WebSite',
      name: config.siteName,
      url: config.siteUrl,
      description: config.siteDescription,
      ...data,
    };
    return JSON.stringify(baseData, null, 2);
  },

  generateProductStructuredData(product: any): string {
    const config = this.getCurrentConfig();
    const productData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || '',
      image: product.images?.[0] || product.image || config.siteImage,
      brand: { '@type': 'Brand', name: product.brand || 'ShopHub' },
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'GBP',
        availability: product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${config.siteUrl}/product/${product.id}`,
        seller: { '@type': 'Organization', name: config.siteName },
      },
      aggregateRating: product.rating ? {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews || 0,
      } : undefined,
      sku: product.sku,
      category: product.category,
      keywords: product.tags?.join(', ') || '',
    };
    if (product.oldPrice) {
      productData.offers = {
        ...productData.offers,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
    }
    return JSON.stringify(productData, null, 2);
  },

  generateBreadcrumbStructuredData(items: { name: string; url: string }[]): string {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
    return JSON.stringify(data, null, 2);
  },

  generateSitemap(pages: { url: string; lastModified?: Date; priority?: number; changeFreq?: string }[]): string {
    const config = this.getCurrentConfig();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const defaultPages = [
      { url: '/', priority: 1.0, changeFreq: 'daily' },
      { url: '/products', priority: 0.9, changeFreq: 'daily' },
      { url: '/women', priority: 0.8, changeFreq: 'weekly' },
      { url: '/men', priority: 0.8, changeFreq: 'weekly' },
      { url: '/kids', priority: 0.8, changeFreq: 'weekly' },
      { url: '/about', priority: 0.5, changeFreq: 'monthly' },
      { url: '/contact', priority: 0.5, changeFreq: 'monthly' },
      { url: '/help', priority: 0.4, changeFreq: 'monthly' },
    ];
    const allPages = [...defaultPages, ...pages];
    allPages.forEach(page => {
      xml += `  <url>\n    <loc>${config.siteUrl}${page.url}</loc>\n`;
      if (page.lastModified) xml += `    <lastmod>${page.lastModified.toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <priority>${page.priority || 0.5}</priority>\n`;
      xml += `    <changefreq>${page.changeFreq || 'weekly'}</changefreq>\n  </url>\n`;
    });
    xml += '</urlset>';
    return xml;
  },

  generateRobotsTxt(): string {
    const config = this.getCurrentConfig();
    return `# robots.txt for ${config.siteName}
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /cart/
Disallow: /checkout/
Disallow: /login/
Disallow: /register/
Disallow: /profile/
Disallow: /addresses/
Sitemap: ${config.siteUrl}/sitemap.xml
Host: ${config.siteUrl}
Crawl-delay: 10

User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /cart/
Disallow: /checkout/
Disallow: /login/
Disallow: /register/
Disallow: /profile/
Disallow: /addresses/
Crawl-delay: 5

User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /cart/
Disallow: /checkout/
Disallow: /login/
Disallow: /register/
Disallow: /profile/
Disallow: /addresses/
Crawl-delay: 5`;
  },

  getPageSEO(data: SEOData): { metaTags: string; structuredData: string } {
    const metaTags = this.generateMetaTags(data);
    let structuredData = '';
    if (data.type === 'product') {
      structuredData = this.generateStructuredData({
        '@type': 'Product',
        name: data.title,
        description: data.description,
        image: data.image,
      });
    } else {
      structuredData = this.generateStructuredData({
        '@type': data.type === 'article' ? 'Article' : 'WebPage',
        headline: data.title,
        description: data.description,
        image: data.image,
        datePublished: data.publishedTime,
        dateModified: data.modifiedTime,
        author: { '@type': 'Person', name: data.author || 'ShopHub Team' },
      });
    }
    return { metaTags, structuredData };
  },
};

export default seoService;