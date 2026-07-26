import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Image as ImageIcon } from 'lucide-react';
import { getAllProducts, addProduct, updateProduct, getAllCategories, type Product, type Category } from '../../../services/productService';
import toast from 'react-hot-toast';

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id && id !== 'new';
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    oldPrice: 0,
    image: '',
    categoryId: 0,
    rating: 4.5,
    reviews: 0,
    badge: '',
    badgeColor: 'red',
    isNew: false,
    description: '',
    stock: 100,
  });

  useEffect(() => {
    loadCategories();
    if (isEditing && id) {
      loadProduct(parseInt(id));
    }
  }, [isEditing, id]);

  const loadCategories = () => {
    const allCategories = getAllCategories();
    setCategories(allCategories);
    if (allCategories.length > 0 && !formData.categoryId) {
      setFormData(prev => ({ ...prev, categoryId: allCategories[0].id }));
    }
  };

  const loadProduct = (productId: number) => {
    const allProducts = getAllProducts();
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice || 0,
        image: product.image,
        categoryId: product.categoryId || 0,
        rating: product.rating,
        reviews: product.reviews,
        badge: product.badge || '',
        badgeColor: product.badgeColor || 'red',
        isNew: product.isNew || false,
        description: product.description || '',
        stock: product.stock,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCategory = categories.find(c => c.id === formData.categoryId);
    
    const productData = {
      ...formData,
      category: selectedCategory?.name || "Women's Wear",
      categoryId: formData.categoryId,
      sold: 0,
    };
    
    if (isEditing && id) {
      updateProduct(parseInt(id), productData);
      toast.success('Product updated successfully');
    } else {
      addProduct(productData);
      toast.success('Product added successfully');
    }
    navigate('/admin/womens-fashion');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/admin/womens-fashion')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold dark:text-white">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Original Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.oldPrice}
                  onChange={(e) => setFormData({ ...formData, oldPrice: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              {formData.image && (
                <div className="mt-2">
                  <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover rounded" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Badge</label>
                <select
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">None</option>
                  <option value="Designer">Designer</option>
                  <option value="SALE">SALE</option>
                  <option value="NEW">NEW</option>
                  <option value="Exclusive">Exclusive</option>
                  <option value="BESTSELLER">BESTSELLER</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="dark:text-gray-300">Mark as New Arrival</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/admin/womens-fashion')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
