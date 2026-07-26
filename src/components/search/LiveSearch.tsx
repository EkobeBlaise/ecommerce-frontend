import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Package, Loader, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { searchProducts, getAllCategories, type Product, type Category } from '../../services/productService';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const LiveSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [categoryResults, setCategoryResults] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Save recent search
  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Search products and categories
  useEffect(() => {
    if (debouncedQuery.length > 1) {
      setLoading(true);
      const timer = setTimeout(() => {
        const searchResults = searchProducts(debouncedQuery);
        setResults(searchResults);
        
        const allCategories = getAllCategories();
        const matchingCategories = allCategories.filter(cat => 
          cat.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        setCategoryResults(matchingCategories);
        
        setLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setCategoryResults([]);
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle category click - redirect to products page with category filter
  const handleCategoryClick = (categoryName: string) => {
    saveRecentSearch(categoryName);
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
    setIsOpen(false);
    setQuery('');
  };

  // Handle product click - redirect to specific product detail page
  const handleProductClick = (productId: number) => {
    const product = results.find(p => p.id === productId);
    if (product) {
      saveRecentSearch(product.name);
      navigate(`/product/${productId}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  // Handle text search
  const handleTextSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm);
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products, categories..."
          className="w-full px-4 py-2 pl-10 pr-10 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none transition bg-gray-50 text-sm"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setCategoryResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query.length > 1 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border z-50 max-h-96 overflow-y-auto"
          >
            {loading ? (
              <div className="p-6 text-center">
                <Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                <p className="mt-2 text-xs text-gray-500">Searching products...</p>
              </div>
            ) : debouncedQuery.length > 1 ? (
              <div>
                {/* Category Results */}
                {categoryResults.length > 0 && (
                  <div className="border-b">
                    <div className="p-2 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-600">Categories</p>
                    </div>
                    {categoryResults.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.name)}
                        className="w-full text-left p-2 hover:bg-gray-50 transition flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-500">{category.count} products</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Product Results */}
                {results.length > 0 ? (
                  <div>
                    <div className="p-2 bg-gray-50 border-t">
                      <p className="text-xs font-semibold text-gray-600">
                        Products ({results.length})
                      </p>
                    </div>
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleProductClick(result.id)}
                        className="w-full text-left flex items-center gap-2 p-2 hover:bg-gray-50 transition cursor-pointer"
                      >
                        <img src={result.image} alt={result.name} className="w-10 h-10 object-cover rounded-lg" />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{result.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-blue-600">${result.price}</span>
                            <span className="text-xs text-gray-400">{result.category}</span>
                            {result.stock > 0 ? (
                              <span className="text-xs text-green-600">In Stock</span>
                            ) : (
                              <span className="text-xs text-red-500">Out of Stock</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-xs">★</span>
                          <span className="text-xs text-gray-600">{result.rating}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : categoryResults.length === 0 && (
                  <div className="p-6 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No products or categories found for "{debouncedQuery}"</p>
                    <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {recentSearches.length > 0 && (
                  <div className="p-2 border-b">
                    <h3 className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Recent Searches
                    </h3>
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTextSearch(term)}
                        className="w-full text-left p-1.5 hover:bg-gray-50 rounded-lg transition text-sm"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-orange-500" />
                    Popular Categories
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {['Electronics', 'Fashion', 'Books', 'Home & Living', 'Sports'].map((term) => (
                      <button
                        key={term}
                        onClick={() => handleCategoryClick(term)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2 border-t bg-gray-50 text-center">
                  <p className="text-xs text-gray-500">
                    🔥 {searchProducts('').length} products available
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveSearch;
