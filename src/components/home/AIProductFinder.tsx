import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { getAllProducts } from '../../services/productService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface AIFilters {
  gender?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  keywords?: string[];
}

const AIProductFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      toast.error('Please describe what you\'re looking for');
      return;
    }

    setIsLoading(true);
    setIsAnalyzing(true);
    try {
      // 1. Send query to backend for AI parsing
      const response = await api.post('/ai/parse-search', { query: trimmedQuery });
      let filters: AIFilters = {};
      if (response.data.success) {
        filters = response.data.data;
      } else {
        // Fallback to simple parsing
        filters = parseQueryLocally(trimmedQuery);
      }
      console.log('🧠 AI parsed filters:', filters);

      // 2. Build flat search parameters
      const params: any = {
        search: trimmedQuery,
        ai: 'true',
      };
      if (filters.gender) params.gender = filters.gender;
      if (filters.category) params.category = filters.category;
      if (filters.subcategory) params.subcategory = filters.subcategory;
      if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
      if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;

      // 3. Perform search using getAllProducts (flat params)
      const results = await getAllProducts(params);

      // 4. Navigate with all parameters
      const queryString = new URLSearchParams();
      queryString.append('search', trimmedQuery);
      queryString.append('ai', 'true');
      if (filters.gender) queryString.append('gender', filters.gender);
      if (filters.category) queryString.append('category', filters.category);
      if (filters.subcategory) queryString.append('subcategory', filters.subcategory);
      if (filters.minPrice !== undefined) queryString.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice !== undefined) queryString.append('maxPrice', String(filters.maxPrice));

      navigate(`/products?${queryString.toString()}`);

      if (results.length === 0) {
        toast.error('No products found. Try a different description.');
      } else {
        toast.success(`Found ${results.length} products matching your description`);
      }
    } catch (error) {
      console.error('Error during AI search:', error);
      toast.error('Something went wrong. Please try again.');
      // Fallback: simple search
      navigate(`/products?search=${encodeURIComponent(trimmedQuery)}&ai=true`);
    } finally {
      setIsAnalyzing(false);
      setIsLoading(false);
    }
  };

  // Simple fallback parser
  const parseQueryLocally = (text: string): AIFilters => {
    const words = text.toLowerCase().split(' ');
    const genderKeywords = ['women', 'woman', 'female', 'men', 'man', 'male', 'kids', 'child', 'unisex'];
    const detectedGender = genderKeywords.find(g => words.includes(g));
    // Try to detect price ranges
    let minPrice: number | undefined, maxPrice: number | undefined;
    const priceRegex = /(?:under|below|less than|up to)\s*£?(\d+)/i;
    const match = text.match(priceRegex);
    if (match) maxPrice = parseInt(match[1]);
    const minRegex = /(?:over|above|more than|from)\s*£?(\d+)/i;
    const minMatch = text.match(minRegex);
    if (minMatch) minPrice = parseInt(minMatch[1]);
    return {
      gender: detectedGender,
      minPrice,
      maxPrice,
      keywords: words.filter(w => !genderKeywords.includes(w) && !/^(under|below|less|than|up|to|over|above|more|from|£|\d+)$/i.test(w))
    };
  };

  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-4 sm:p-6 my-6 sm:my-8">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-lg sm:text-xl font-bold dark:text-white">AI Product Finder</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
        Describe what you're looking for and let AI find the perfect products
      </p>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'summer dress for women under £50', 'formal shoes for men'"
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isAnalyzing ? 'Analyzing...' : 'Searching...'}
            </>
          ) : (
            <>
              Find Now <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        💡 Try describing the style, occasion, features, or price range you want
      </p>
      {isAnalyzing && (
        <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
          🧠 AI is understanding your request...
        </div>
      )}
    </div>
  );
};

export default AIProductFinder;