import React from 'react';
import { Sliders, X } from 'lucide-react';

interface FilterOptions {
  gender: string;
  category: string;
  brand: string;
  priceRange: [number, number];
  discount: number;
  sortBy: string;
}

interface ProductFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const genders = [
  { value: 'all', label: 'All' },
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'kids', label: 'Kids' },
];

const categories = [
  { value: 'all', label: 'All' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'sports', label: 'Sports' },
  { value: 'designer', label: 'Designer' },
];

const brands = [
  { value: 'all', label: 'All' },
  { value: 'nike', label: 'Nike' },
  { value: 'adidas', label: 'Adidas' },
  { value: 'zara', label: 'Zara' },
  { value: 'hm', label: 'H&M' },
  { value: 'gucci', label: 'Gucci' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rating' },
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, onFilterChange, onClose, isMobile }) => {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      gender: 'all',
      category: 'all',
      brand: 'all',
      priceRange: [0, 1000],
      discount: 0,
      sortBy: 'newest',
    });
  };

  const hasActiveFilters = filters.gender !== 'all' || filters.category !== 'all' || filters.brand !== 'all' || filters.discount > 0;

  return (
    <div className={`bg-white dark:bg-gray-900 ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      {isMobile && (
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <div className="p-4 space-y-6">
        {/* Sort By */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4" /> Sort By
          </h3>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div>
          <h3 className="font-semibold mb-2">Gender</h3>
          <div className="flex flex-wrap gap-2">
            {genders.map(gender => (
              <button
                key={gender.value}
                onClick={() => updateFilter('gender', gender.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  filters.gender === gender.value
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                }`}
              >
                {gender.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <h3 className="font-semibold mb-2">Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => updateFilter('category', cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  filters.category === cat.value
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div>
          <h3 className="font-semibold mb-2">Brand</h3>
          <div className="flex flex-wrap gap-2">
            {brands.map(brand => (
              <button
                key={brand.value}
                onClick={() => updateFilter('brand', brand.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  filters.brand === brand.value
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                }`}
              >
                {brand.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="font-semibold mb-2">Price Range</h3>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
              className="w-1/2 p-2 border border-gray-300 rounded-lg dark:bg-gray-800"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 1000])}
              className="w-1/2 p-2 border border-gray-300 rounded-lg dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Discount */}
        <div>
          <h3 className="font-semibold mb-2">Minimum Discount</h3>
          <div className="flex gap-2">
            {[0, 10, 20, 30, 40, 50].map(discount => (
              <button
                key={discount}
                onClick={() => updateFilter('discount', discount)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  filters.discount === discount
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                }`}
              >
                {discount}%+
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full py-2 text-center text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
};
