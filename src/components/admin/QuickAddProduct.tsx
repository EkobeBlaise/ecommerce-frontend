import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { categoryManagementNewService } from '../../services/categoryManagementNewService';
import toast from 'react-hot-toast';

interface QuickAddProductProps {
  onProductAdded: () => void;
}

const QuickAddProduct: React.FC<QuickAddProductProps> = ({ onProductAdded }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    sku: '',
    category: '',
    subcategory: '',
    gender: 'unisex',
    stock: '',
    image: '',
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await categoryManagementNewService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.image) {
      toast.error('Name, price, and image are required');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        image: formData.image,
        images: [formData.image],
        description: formData.description || '',
        gender: formData.gender,
        category: formData.category,
        subcategory: formData.subcategory,
        stock_quantity: parseInt(formData.stock) || 0,
        sku: formData.sku || `SKU-${Date.now()}`,
        status: 'active',
        tags: [formData.category, formData.gender].filter(Boolean),
        isNew: true,
        isSale: false,
        isTrending: false,
        isBestseller: false,
        variants: [],
      };

      await productService.add(productData);
      toast.success('Product added successfully!');
      setFormData({
        name: '',
        price: '',
        sku: '',
        category: '',
        subcategory: '',
        gender: 'unisex',
        stock: '',
        image: '',
        description: '',
      });
      onProductAdded();
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
          Product Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
          placeholder="Enter product name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
            Price ($) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
            SKU
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            placeholder="SKU-001"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
          >
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="kids">Kids</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
            Stock
          </label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
            Subcategory
          </label>
          <input
            type="text"
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            placeholder="e.g. Dresses"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
          Image URL *
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
          placeholder="https://example.com/image.jpg"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none resize-none"
          placeholder="Enter product description..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50 text-sm"
      >
        {loading ? 'Adding...' : 'Add Product'}
      </button>
    </form>
  );
};

export default QuickAddProduct;