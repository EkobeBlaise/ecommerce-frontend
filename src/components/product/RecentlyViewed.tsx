import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock } from 'lucide-react';
import { getProductById, type Product } from '../../services/productService';

export const RecentlyViewed: React.FC = () => {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      const ids = JSON.parse(stored);
      const products = ids.map((id: number) => getProductById(id)).filter(Boolean);
      setRecentProducts(products);
    }
  }, []);

  // Track product view (call this from product detail page)
  const addToRecentlyViewed = (productId: number) => {
    const stored = localStorage.getItem('recentlyViewed');
    let ids = stored ? JSON.parse(stored) : [];
    ids = [productId, ...ids.filter((id: number) => id !== productId)].slice(0, 6);
    localStorage.setItem('recentlyViewed', JSON.stringify(ids));
    setRecentProducts(ids.map((id: number) => getProductById(id)).filter(Boolean));
  };

  if (recentProducts.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8 border-t">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recentProducts.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition p-3 text-center"
          >
            <img src={product.image} alt={product.name} className="w-full h-24 object-cover rounded mb-2 group-hover:scale-105 transition" />
            <p className="text-xs font-medium line-clamp-1">{product.name}</p>
            <p className="text-blue-600 font-bold text-sm">${product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
