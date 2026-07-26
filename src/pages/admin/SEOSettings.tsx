import React, { useState, useEffect } from 'react';
import { 
  Globe, Search, Twitter, Facebook, Image, 
  Link, FileText, RefreshCw, Save, 
  Download, Copy, Check
} from 'lucide-react';
import { seoService } from '../../services/seoService';
import { SEOConfig } from '../../types/seo';
import toast from 'react-hot-toast';

const SEOSettings: React.FC = () => {
  const [config, setConfig] = useState<SEOConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'robots' | 'sitemap' | 'structured'>('general');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const currentConfig = await seoService.getConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Error loading SEO config:', error);
      toast.error('Failed to load SEO configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await seoService.updateConfig(config);
      toast.success('SEO configuration saved successfully!');
    } catch (error) {
      console.error('Error saving SEO config:', error);
      toast.error('Failed to save SEO configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleExportSitemap = () => {
    const sitemap = seoService.generateSitemap([]);
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sitemap exported!');
  };

  const handleExportRobots = () => {
    const robots = seoService.generateRobotsTxt();
    const blob = new Blob([robots], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('robots.txt exported!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const generateStructuredData = () => {
    if (!config) return '{}';
    return seoService.generateStructuredData({
      '@type': 'WebSite',
      name: config.siteName,
      url: config.siteUrl,
      description: config.siteDescription,
    });
  };

  if (loading || !config) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SEO Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure SEO settings for better search engine visibility
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadConfig}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'general'
                ? 'bg-pink-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            General
          </button>
          <button
            onClick={() => setActiveTab('robots')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'robots'
                ? 'bg-pink-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            robots.txt
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'sitemap'
                ? 'bg-pink-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <Link className="w-4 h-4 inline mr-2" />
            Sitemap
          </button>
          <button
            onClick={() => setActiveTab('structured')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'structured'
                ? 'bg-pink-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Structured Data
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          {activeTab === 'general' && (
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General SEO Settings</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Description
                </label>
                <textarea
                  value={config.siteDescription}
                  onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site URL
                </label>
                <input
                  type="url"
                  value={config.siteUrl}
                  onChange={(e) => setConfig({ ...config, siteUrl: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Image (OG Image)
                </label>
                <input
                  type="url"
                  value={config.siteImage}
                  onChange={(e) => setConfig({ ...config, siteImage: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={config.twitterHandle || ''}
                    onChange={(e) => setConfig({ ...config, twitterHandle: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Facebook App ID
                  </label>
                  <input
                    type="text"
                    value={config.facebookAppId || ''}
                    onChange={(e) => setConfig({ ...config, facebookAppId: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={config.keywords.join(', ')}
                  onChange={(e) => setConfig({ ...config, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="fashion, clothing, shoes, accessories"
                />
              </div>
            </div>
          )}

          {activeTab === 'robots' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">robots.txt</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(seoService.generateRobotsTxt())}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy
                  </button>
                  <button
                    onClick={handleExportRobots}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                  {seoService.generateRobotsTxt()}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'sitemap' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sitemap</h2>
                <button
                  onClick={handleExportSitemap}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Sitemap
                </button>
              </div>
              <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                  {seoService.generateSitemap([])}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'structured' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Structured Data (JSON-LD)</h2>
                <button
                  onClick={() => copyToClipboard(generateStructuredData())}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
              </div>
              <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                  {generateStructuredData()}
                </pre>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 This structured data helps search engines understand your site better. 
                  Add this to your site's HTML to improve SEO.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEOSettings;