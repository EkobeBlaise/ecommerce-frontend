import React from 'react';
import SEO from '../components/common/SEO';

const Terms: React.FC = () => {
  return (
    <>
      <SEO
        title="Terms & Conditions - LuxeWardrobe"
        description="Read our terms and conditions for using LuxeWardrobe."
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Terms & Conditions</h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">Last updated: July 2026</p>
            
            <h2 className="text-xl font-bold mt-6 dark:text-white">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-400">
              By using LuxeWardrobe, you agree to comply with and be bound by these terms and conditions. 
              If you do not agree, please do not use our service.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">2. Account Registration</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You must be at least 18 years old to create an account. You are responsible for 
              maintaining the confidentiality of your account credentials.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">3. Orders and Payments</h2>
            <p className="text-gray-600 dark:text-gray-400">
              All orders are subject to availability. We reserve the right to refuse or cancel 
              any order at our discretion. Payment is processed securely through our payment partners.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">4. Returns and Refunds</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We offer a 30-day return policy for eligible items. Please refer to our Returns Policy 
              for detailed information.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">5. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-400">
              All content on LuxeWardrobe is protected by copyright and intellectual property laws. 
              You may not reproduce, distribute, or create derivative works without permission.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">6. Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-400">
              LuxeWardrobe is provided "as is" without warranties of any kind. We do not guarantee 
              that our service will be uninterrupted or error-free.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">7. Contact</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Questions about these terms? Contact us at <a href="mailto:support@luxewardrobe.com" className="text-pink-600 hover:underline">support@luxewardrobe.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;