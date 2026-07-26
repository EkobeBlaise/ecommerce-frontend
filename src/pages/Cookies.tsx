import React from 'react';
import SEO from '../components/common/SEO';

const Cookies: React.FC = () => {
  return (
    <>
      <SEO
        title="Cookie Policy - Luxe Wardrobe"
        description="Learn how Luxe Wardrobe uses cookies to enhance your browsing experience."
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Cookie Policy</h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">Last updated: July 2026</p>
            
            <h2 className="text-xl font-bold mt-6 dark:text-white">What are Cookies?</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Cookies are small text files that are stored on your device when you visit a website. 
              They help us provide you with a better experience by remembering your preferences 
              and understanding how you interact with our site.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">How We Use Cookies</h2>
            <div className="space-y-3">
              <div>
                <p className="font-semibold dark:text-white">Essential Cookies</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Required for basic site functionality like keeping you logged in and remembering your cart.
                </p>
              </div>
              <div>
                <p className="font-semibold dark:text-white">Analytics Cookies</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Help us understand how visitors use our site so we can improve it.
                </p>
              </div>
              <div>
                <p className="font-semibold dark:text-white">Preference Cookies</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Remember your settings like language and region.
                </p>
              </div>
              <div>
                <p className="font-semibold dark:text-white">Marketing Cookies</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Used to show relevant advertisements (with your consent).
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Managing Your Cookie Preferences</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You can manage or disable cookies in your browser settings. Please note that 
              disabling certain cookies may affect the functionality of our site.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Third-Party Cookies</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We may use third-party services like Google Analytics and payment processors 
              which may place their own cookies. Please refer to their respective privacy 
              policies for more information.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Contact</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Questions about our cookie policy? Contact us at{' '}
              <a href="mailto:privacy@luxewardrobe.com" className="text-pink-600 hover:underline">
                privacy@luxewardrobe.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cookies;