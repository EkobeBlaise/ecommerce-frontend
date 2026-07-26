import React from 'react';
import SEO from '../components/common/SEO';

const Privacy: React.FC = () => {
  return (
    <>
      <SEO
        title="Privacy Policy - LuxeWardrobe"
        description="Learn how LuxeWardrobe protects your privacy and handles your data."
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Privacy Policy</h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">Last updated: July 2026</p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">1. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We collect information you provide directly, such as when you create an account, 
              place an order, or contact us. This may include your name, email address, shipping 
              address, and payment information.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Process your orders and payments</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Provide customer support</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our services</li>
            </ul>

            <h2 className="text-xl font-bold mt-6 dark:text-white">3. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We implement industry-standard security measures to protect your data. All 
              payment transactions are encrypted using SSL technology.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">4. Cookies</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We use cookies to enhance your browsing experience, analyze site traffic, and 
              personalize content. You can manage cookie preferences in your browser settings.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">5. Third-Party Services</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We may use third-party services for payment processing, shipping, and analytics. 
              These services have their own privacy policies.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">6. Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request data deletion</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>

            <h2 className="text-xl font-bold mt-6 dark:text-white">7. Contact</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Questions about our privacy policy? Contact us at <a href="mailto:privacy@shophub.com" className="text-pink-600 hover:underline">privacy@luxewardrobe.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;