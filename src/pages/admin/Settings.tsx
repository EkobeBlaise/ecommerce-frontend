import React, { useState, useEffect } from 'react';
import { 
  Save, Globe, DollarSign, Truck, Mail, 
  Bell, Palette, RefreshCw, FileText, 
  Edit3, Sun, Moon, Smartphone, CreditCard, Tag
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import PaymentMethodsManager from '../../components/admin/PaymentMethodsManager';
import BrandManager from '../../components/admin/BrandManager';
import toast from 'react-hot-toast';

const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const saveSettings = () => {
    setLoading(true);
    updateSettings(localSettings);
    if (localSettings.appearance.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.style.setProperty('--primary-color', localSettings.appearance.primaryColor);
    toast.success('Settings saved successfully!');
    setTimeout(() => setLoading(false), 500);
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [category]: { ...prev[category as keyof typeof prev], [key]: value } }));
  };

  const savePageContent = (page: string) => {
    updateSetting('pages', page, pageContent);
    setEditingPage(null);
    toast.success(`${page} content updated!`);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
    { id: 'pages', label: 'Page Content', icon: <FileText className="w-4 h-4" /> },
    { id: 'footer', label: 'Footer', icon: <Mail className="w-4 h-4" /> },
    { id: 'brands', label: 'Brands', icon: <Tag className="w-4 h-4" /> },
    { id: 'shipping', label: 'Shipping', icon: <Truck className="w-4 h-4" /> },
    { id: 'payments', label: 'Payments', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'payment-methods', label: 'Payment Methods', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];

  const pageContents = [
    { id: 'about', label: 'About Us', default: 'ShopHub was founded with a simple mission: to make online shopping easy, secure, and enjoyable for everyone.' },
    { id: 'terms', label: 'Terms & Conditions', default: 'By using our site, you agree to our terms and conditions.' },
    { id: 'privacy', label: 'Privacy Policy', default: 'We value your privacy and protect your data.' },
    { id: 'returns', label: 'Returns Policy', default: '30-day easy returns for all products.' },
    { id: 'shipping', label: 'Shipping Info', default: 'Free shipping on orders over $50.' },
    { id: 'legal', label: 'Legal Notice', default: 'ShopHub is a registered trademark.' },
    { id: 'accessibility', label: 'Accessibility', default: 'We are committed to accessibility.' },
    { id: 'cookies', label: 'Cookie Settings', default: 'We use cookies to enhance your experience.' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Store Settings</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your store configuration and preferences</p>
            </div>
            <button 
              onClick={saveSettings} 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition flex items-center gap-2 shadow-md whitespace-nowrap"
            >
              <Save className="w-4 h-4" /> 
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <div className="flex border-b border-gray-200 dark:border-gray-700 min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          
          {/* General Settings */}
          {activeTab === 'general' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">General Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
                  <input 
                    type="text" 
                    value={localSettings.general.storeName} 
                    onChange={(e) => updateSetting('general', 'storeName', e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Email</label>
                  <input 
                    type="email" 
                    value={localSettings.general.storeEmail} 
                    onChange={(e) => updateSetting('general', 'storeEmail', e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Phone</label>
                  <input 
                    type="tel" 
                    value={localSettings.general.storePhone} 
                    onChange={(e) => updateSetting('general', 'storePhone', e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Currency</label>
                  <select 
                    value={localSettings.general.storeCurrency} 
                    onChange={(e) => updateSetting('general', 'storeCurrency', e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Address</label>
                  <textarea 
                    value={localSettings.general.storeAddress} 
                    onChange={(e) => updateSetting('general', 'storeAddress', e.target.value)} 
                    rows={2} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          {activeTab === 'pages' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Page Content Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Edit the content displayed on your website pages</p>
              <div className="space-y-3">
                {pageContents.map(page => (
                  <div key={page.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{page.label}</h3>
                      {editingPage === page.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => savePageContent(page.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition">Save</button>
                          <button onClick={() => setEditingPage(null)} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingPage(page.id); setPageContent(localSettings.pages?.[page.id] || page.default); }} className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 transition">
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </div>
                    {editingPage === page.id ? (
                      <textarea 
                        value={pageContent} 
                        onChange={(e) => setPageContent(e.target.value)} 
                        rows={5} 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{localSettings.pages?.[page.id] || page.default}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Settings */}
          {activeTab === 'footer' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Footer Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Copyright Text</label>
                  <input 
                    type="text" 
                    value={localSettings.footer?.copyrightText || `© ${new Date().getFullYear()} ${localSettings.general.storeName}. All rights reserved.`} 
                    onChange={(e) => updateSetting('footer', 'copyrightText', e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" 
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Example: © 2024 ShopHub. All rights reserved.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline / Subtitle</label>
                  <input 
                    type="text" 
                    value={localSettings.footer?.tagline || 'Premium E-commerce Platform'} 
                    onChange={(e) => updateSetting('footer', 'tagline', e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Brands */}
          {activeTab === 'brands' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Brand Management</h2>
              <BrandManager />
            </div>
          )}

          {/* Shipping */}
          {activeTab === 'shipping' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Shipping Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Free Shipping Threshold ($)</label>
                  <input 
                    type="number" 
                    value={localSettings.shipping.freeShippingThreshold} 
                    onChange={(e) => updateSetting('shipping', 'freeShippingThreshold', parseFloat(e.target.value))} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" 
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Orders above this amount get free shipping</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard Shipping ($)</label>
                  <input 
                    type="number" 
                    value={localSettings.shipping.standardShippingCost} 
                    onChange={(e) => updateSetting('shipping', 'standardShippingCost', parseFloat(e.target.value))} 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payments */}
          {activeTab === 'payments' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Payment Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Rate (%)</label>
                <input 
                  type="number" 
                  value={localSettings.payments.taxRate} 
                  onChange={(e) => updateSetting('payments', 'taxRate', parseFloat(e.target.value))} 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" 
                />
              </div>
            </div>
          )}

          {/* Payment Methods */}
          {activeTab === 'payment-methods' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Payment Methods</h2>
              <PaymentMethodsManager />
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Appearance Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Mode</label>
                  <div className="flex gap-3">
                    <button onClick={() => updateSetting('appearance', 'theme', 'light')} className={`flex-1 py-2 px-3 rounded-lg border text-center transition ${localSettings.appearance.theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
                      <Sun className="w-5 h-5 mx-auto mb-1" /> Light
                    </button>
                    <button onClick={() => updateSetting('appearance', 'theme', 'dark')} className={`flex-1 py-2 px-3 rounded-lg border text-center transition ${localSettings.appearance.theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
                      <Moon className="w-5 h-5 mx-auto mb-1" /> Dark
                    </button>
                    <button onClick={() => updateSetting('appearance', 'theme', 'system')} className={`flex-1 py-2 px-3 rounded-lg border text-center transition ${localSettings.appearance.theme === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
                      <Smartphone className="w-5 h-5 mx-auto mb-1" /> System
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={localSettings.appearance.primaryColor} onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)} className="w-10 h-10 border rounded cursor-pointer" />
                    <input type="text" value={localSettings.appearance.primaryColor} onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Products Per Page</label>
                  <select value={localSettings.appearance.productsPerPage} onChange={(e) => updateSetting('appearance', 'productsPerPage', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <option value={12}>12 products</option>
                    <option value={24}>24 products</option>
                    <option value={48}>48 products</option>
                    <option value={96}>96 products</option>
                  </select>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Homepage Sections</label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Show Hero Slider</span>
                      <input type="checkbox" checked={localSettings.appearance.showHeroSlider} onChange={(e) => updateSetting('appearance', 'showHeroSlider', e.target.checked)} className="w-4 h-4" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Show Brand Carousel</span>
                      <input type="checkbox" checked={localSettings.appearance.showBrandCarousel} onChange={(e) => updateSetting('appearance', 'showBrandCarousel', e.target.checked)} className="w-4 h-4" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
