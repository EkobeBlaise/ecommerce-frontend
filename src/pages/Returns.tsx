import React from 'react';

const Returns: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Returns Policy</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 space-y-4">
          <p className="text-gray-600 dark:text-gray-400">We want you to be completely satisfied with your purchase. If for any reason you're not, we offer a 30-day return policy.</p>
          <h2 className="text-xl font-bold mt-6 dark:text-white">Return Conditions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Items must be returned within 30 days of delivery</li>
            <li>Products must be unused and in original packaging</li>
            <li>Customer is responsible for return shipping costs</li>
            <li>Refunds are processed within 5-7 business days</li>
          </ul>
          <h2 className="text-xl font-bold mt-6 dark:text-white">How to Return</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Contact our support team to initiate return</li>
            <li>Pack the item securely in original packaging</li>
            <li>Ship to our returns address</li>
            <li>Once received, we'll process your refund</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Returns;
