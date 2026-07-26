import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated 404 */}
          <div className="relative mb-6">
            <div className="text-8xl md:text-9xl font-bold text-gray-300 dark:text-gray-700 mb-2">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertCircle className="w-16 h-16 text-pink-500 opacity-50" />
            </div>
          </div>
          
          <div className="text-6xl mb-6">🔍</div>
          
          <h1 className="text-3xl font-bold mb-3 dark:text-white">Page Not Found</h1>
          <p className="text-gray-500 mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Check the URL for typos or use the links below to find what you need.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-700 transition"
            >
              <Home className="w-4 h-4" /> Back to Home
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 dark:border-gray-700 px-6 py-3 rounded-full font-semibold hover:border-pink-600 hover:text-pink-600 transition"
            >
              <ShoppingBag className="w-4 h-4" /> Browse Products
            </Link>
          </div>

          {/* Quick Links */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="font-semibold mb-4 dark:text-white">Quick Links</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/women" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-pink-100 dark:hover:bg-pink-900/30 transition">Women's Fashion</Link>
              <Link to="/men" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-pink-100 dark:hover:bg-pink-900/30 transition">Men's Fashion</Link>
              <Link to="/kids" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-pink-100 dark:hover:bg-pink-900/30 transition">Kids' Collection</Link>
              <Link to="/sale" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-pink-100 dark:hover:bg-pink-900/30 transition">Sale</Link>
              <Link to="/track-order" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-pink-100 dark:hover:bg-pink-900/30 transition">Track Order</Link>
              <Link to="/help" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-pink-100 dark:hover:bg-pink-900/30 transition">Help Center</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
