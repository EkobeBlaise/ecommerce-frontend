import React from 'react';

const Shipping: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Shipping Information</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 space-y-4">
          <h2 className="text-xl font-bold dark:text-white">Shipping Options</h2>
          <div className="space-y-3">
            <div className="border-b pb-3">
              <p className="font-semibold dark:text-white">Standard Shipping (3-5 business days)</p>
              <p className="text-gray-600 dark:text-gray-400">Free on orders over $50, otherwise $5.99</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold dark:text-white">Express Shipping (1-2 business days)</p>
              <p className="text-gray-600 dark:text-gray-400">$12.99 flat rate</p>
            </div>
          </div>
          <h2 className="text-xl font-bold mt-6 dark:text-white">International Shipping</h2>
          <p className="text-gray-600 dark:text-gray-400">We ship worldwide. Delivery times and costs vary by location.</p>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
