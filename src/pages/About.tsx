import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Award, Users, ShoppingBag, Globe } from 'lucide-react';

const About: React.FC = () => {
  const { settings } = useSettings();
  const content = settings.pages?.about || "ShopHub was founded with a simple mission: to make online shopping easy, secure, and enjoyable for everyone. We believe that quality products should be accessible to all, backed by exceptional customer service. Today, we're proud to serve thousands of customers worldwide, offering a curated selection of premium products across electronics, fashion, home goods, and more.";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">About {settings.general.storeName}</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 mb-8">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{content}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center"><Globe className="w-8 h-8 text-blue-600 mx-auto mb-3" /><div className="text-2xl font-bold dark:text-white">30+</div><div className="text-sm text-gray-600 dark:text-gray-400">Countries</div></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center"><Users className="w-8 h-8 text-blue-600 mx-auto mb-3" /><div className="text-2xl font-bold dark:text-white">50K+</div><div className="text-sm text-gray-600 dark:text-gray-400">Customers</div></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center"><ShoppingBag className="w-8 h-8 text-blue-600 mx-auto mb-3" /><div className="text-2xl font-bold dark:text-white">10K+</div><div className="text-sm text-gray-600 dark:text-gray-400">Products Sold</div></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center"><Award className="w-8 h-8 text-blue-600 mx-auto mb-3" /><div className="text-2xl font-bold dark:text-white">5+</div><div className="text-sm text-gray-600 dark:text-gray-400">Awards</div></div>
        </div>
      </div>
    </div>
  );
};

export default About;
