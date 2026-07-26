import React from 'react';
import SEO from '../components/common/SEO';
import { Link } from 'react-router-dom';

const Legal: React.FC = () => {
  return (
    <>
      <SEO
        title="Legal Notice - Luxe Wardrobe"
        description="Legal information about ShopHub, including trademark, copyright, and business information."
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Legal Notice</h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">Last updated: July 2026</p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Company Information</h2>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p><strong>Company Name:</strong> luxewardrobe Ltd</p>
              <p><strong>Registration Number:</strong> 12345678</p>
              <p><strong>VAT Number:</strong> GB123456789</p>
              <p><strong>Registered Address:</strong> 123 Commerce Street, London, UK</p>
            </div>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Trademark & Copyright</h2>
            <p className="text-gray-600 dark:text-gray-400">
              LuxeWardrobe™ is a registered trademark of LuxeWardrobe Ltd. All content on this website, 
              including text, images, logos, and design, is protected by copyright and other 
              intellectual property laws. Unauthorized use is prohibited.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-400">
              While we strive to provide accurate and up-to-date information, ShopHub makes 
              no warranties or representations about the accuracy, completeness, or reliability 
              of any content on this site. Use of the site is at your own risk.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400">
              To the fullest extent permitted by law, luxewardrobe shall not be liable for any 
              direct, indirect, incidental, special, or consequential damages arising from 
              your use of our services.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Governing Law</h2>
            <p className="text-gray-600 dark:text-gray-400">
              These terms are governed by and construed in accordance with the laws of the 
              United Kingdom. Any disputes shall be subject to the exclusive jurisdiction 
              of the courts of England and Wales.
            </p>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Related Policies</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li><Link to="/terms" className="text-pink-600 hover:underline">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-pink-600 hover:underline">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-pink-600 hover:underline">Cookie Policy</Link></li>
              <li><Link to="/returns" className="text-pink-600 hover:underline">Returns Policy</Link></li>
              <li><Link to="/shipping" className="text-pink-600 hover:underline">Shipping Information</Link></li>
            </ul>

            <h2 className="text-xl font-bold mt-6 dark:text-white">Contact</h2>
            <p className="text-gray-600 dark:text-gray-400">
              For legal inquiries, please contact us at{' '}
              <a href="mailto:legal@shophub.com" className="text-pink-600 hover:underline">
                legal@luxewardrobe.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Legal;