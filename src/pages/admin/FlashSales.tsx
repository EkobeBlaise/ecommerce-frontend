import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Zap, Clock, DollarSign, Tag, Eye, ShoppingBag } from 'lucide-react';
import { flashSaleService, FlashSale } from '../../services/flashSaleService';
import { getAllProducts, type Product } from '../../services/productService';
import toast from 'react-hot-toast';

const AdminFlashSales: React.FC = () => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    salePrice: 0,
    stock: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    limitPerCustomer: 2,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sales, prods] = await Promise.all([
        flashSaleService.getAll(),
        getAllProducts(),
      ]);
      setFlashSales(sales);
      setProducts(prods);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setFormData(prev => ({
        ...prev,
        productId,
        stock: product.stock,
      }));
    }
  };

  const handleSalePriceChange = (salePrice: number) => {
    setFormData(prev => ({ ...prev, salePrice }));
  };

  const handleSave = async () => {
    if (!formData.productId) {
      toast.error('Please select a product');
      return;
    }
    if (!formData.salePrice || formData.salePrice <= 0) {
      toast.error('Please enter a valid sale price');
      return;
    }

    const product = products.find(p => p.id === formData.productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }
    if (formData.salePrice >= product.price) {
      toast.error('Sale price must be less than original price');
      return;
    }

    try {
      if (editingSale) {
        await flashSaleService.update(editingSale.id, {
          salePrice: formData.salePrice,
          stock: formData.stock,
          startDate: formData.startDate,
          endDate: formData.endDate,
          limitPerCustomer: formData.limitPerCustomer,
        });
        toast.success('Flash sale updated successfully');
      } else {
        await flashSaleService.create({
          productId: formData.productId,
          salePrice: formData.salePrice,
          stock: formData.stock,
          startDate: formData.startDate,
          endDate: formData.endDate,
          limitPerCustomer: formData.limitPerCustomer,
          isActive: true,
          productName: product.name,
          productImage: product.image,
          originalPrice: product.price,
        });
        toast.success('Flash sale created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setFormData({
      productId: '',
      salePrice: 0,
      stock: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      limitPerCustomer: 2,
    });
    setEditingSale(null);
  };

  const handleEdit = (sale: FlashSale) => {
    setEditingSale(sale);
    const product = products.find(p => p.id === sale.productId);
    if (product) setSelectedProduct(product);
    setFormData({
      productId: sale.productId,
      salePrice: sale.salePrice,
      stock: sale.stock,
      startDate: sale.startDate,
      endDate: sale.endDate,
      limitPerCustomer: sale.limitPerCustomer,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (sale: FlashSale) => {
    if (!window.confirm(`Remove "${sale.productName}" from flash sale?`)) return;
    try {
      await flashSaleService.delete(sale.id);
      toast.success('Flash sale removed');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const toggleStatus = async (sale: FlashSale) => {
    try {
      await flashSaleService.update(sale.id, { isActive: !sale.isActive });
      toast.success(`Flash sale ${!sale.isActive ? 'activated' : 'deactivated'}`);
      await loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (sale: FlashSale) => {
    const now = new Date();
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    if (!sale.isActive) return { text: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    if (now < start) return { text: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
    if (now > end) return { text: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
    return { text: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const filteredSales = flashSales.filter(sale =>
    sale.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Flash Sales Manager</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Create time-limited offers to boost sales</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition"
          >
            <Zap className="w-4 h-4" />
            Create Flash Sale
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products in flash sale..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Flash Sales Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSales.map((sale) => {
            const status = getStatusBadge(sale);
            const timeRemaining = getTimeRemaining(sale.endDate);
            return (
              <div key={sale.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="relative">
                  <img src={sale.productImage} alt={sale.productName} className="w-full h-48 object-cover" />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    -{sale.discount}%
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg dark:text-white mb-2">{sale.productName}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-red-600">${sale.salePrice}</span>
                    <span className="text-gray-400 line-through">${sale.originalPrice}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Stock Left:</span>
                      <span className="font-semibold dark:text-white">{sale.stock - sale.soldCount} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Sold:</span>
                      <span className="dark:text-white">{sale.soldCount} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Limit per Customer:</span>
                      <span className="dark:text-white">{sale.limitPerCustomer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Time Remaining:</span>
                      <span className="flex items-center gap-1 text-orange-600 font-semibold">
                        <Clock className="w-3 h-3" />
                        {timeRemaining}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t dark:border-gray-700 flex gap-2">
                    <button
                      onClick={() => handleEdit(sale)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(sale)}
                      className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {sale.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(sale)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No flash sales active</p>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="mt-4 text-red-500 hover:text-red-600"
            >
              Create your first flash sale →
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold dark:text-white">
                  {editingSale ? 'Edit Flash Sale' : 'Create New Flash Sale'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <X className="w-5 h-5 dark:text-white" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Select Product *</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={!!editingSale}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedProduct && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex gap-4">
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-20 h-20 object-cover rounded" />
                      <div>
                        <p className="font-semibold dark:text-white">{selectedProduct.name}</p>
                        <p className="text-sm text-gray-500">Original Price: ${selectedProduct.price}</p>
                        <p className="text-sm text-gray-500">Available Stock: {selectedProduct.stock}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Sale Price *</label>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => handleSalePriceChange(parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Discount</label>
                    <input
                      type="text"
                      value={selectedProduct && formData.salePrice ? `${Math.round(((selectedProduct.price - formData.salePrice) / selectedProduct.price) * 100)}%` : '0%'}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Stock for Sale</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-xs text-gray-500">Leave as product stock or set lower</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Limit per Customer</label>
                    <input
                      type="number"
                      value={formData.limitPerCustomer}
                      onChange={(e) => setFormData({ ...formData, limitPerCustomer: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition"
                >
                  {editingSale ? 'Update Flash Sale' : 'Create Flash Sale'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFlashSales;