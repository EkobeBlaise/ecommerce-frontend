import React from 'react';
import SEO from '../components/common/SEO';

const Accessibility: React.FC = () => {
  return (
    <>
      <SEO
        title="Accessibility - ShopHub"
        description="ShopHub is committed to making our website accessible to all users."
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Accessibility Statement</h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">Last updated: July 2026</p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Our Commitment</h2>
            <p className="text-gray-600 dark:text-gray-400">
              ShopHub is committed to ensuring digital accessibility for people with disabilities. 
              We continuously improve the user experience for everyone and apply relevant 
              accessibility standards.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Accessibility Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Keyboard navigation support</li>
              <li>Screen reader compatibility</li>
              <li>High contrast mode support</li>
              <li>Text resizing capabilities</li>
              <li>Clear and consistent navigation</li>
              <li>Alt text for images</li>
            </ul>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Standards</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at 
              the AA level. We regularly test and audit our site to maintain compliance.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Feedback</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We welcome your feedback on the accessibility of our site. If you encounter 
              any barriers, please contact us at{' '}
              <a href="mailto:accessibility@luxewardrobe.com" className="text-pink-600 hover:underline">
                accessibility@luxewardrobe.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Accessibility;