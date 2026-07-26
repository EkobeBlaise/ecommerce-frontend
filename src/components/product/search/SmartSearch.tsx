// src/components/search/SmartSearch.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, TrendingUp, Package, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { searchProducts } from '../../services/searchService';

export const SmartSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
    
    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    // Search debounce
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        setLoading(true);
        const searchResults = await searchProducts(query);
        setResults(searchResults);
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  const saveSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };
  
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      saveSearch(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setQuery('');
    }
  };
  
  const trendingSearches = ['summer dresses', 'wireless headphones', 'smart watches', 'gaming laptop'];
  
  return (
    <div ref={searchRef} className="relative flex-1 max-w-xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products, brands, categories..."
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto"
          >
            {loading ? (
              <div className="p-8 text-center">
                <Loader className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                <p className="mt-2 text-gray-500">Searching...</p>
              </div>
            ) : query.length > 1 ? (
              results.length > 0 ? (
                <div>
                  <div className="p-3 border-b">
                    <h3 className="font-semibold text-sm">Products</h3>
                  </div>
                  {results.map((product: any) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        saveSearch(product.name);
                        navigate(`/product/${product.id}`);
                        setIsOpen(false);
                      }}
                      className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 text-left"
                    >
                      <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-primary-600">${product.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No products found for "{query}"</p>
                </div>
              )
            ) : (
              <div>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-3 border-b">
                    <h3 className="font-semibold text-sm mb-2">Recent Searches</h3>
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(term)}
                        className="w-full p-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <History className="w-4 h-4 text-gray-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Trending Searches */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    Trending Now
                  </h3>
                  {trendingSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(term)}
                      className="w-full p-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                      <span className="text-orange-500 font-bold">#{idx + 1}</span>
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};