import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, X, Plus, Trash2, 
  ChevronDown, ChevronUp, Eye,
  Sun, Shirt, Heart, Footprints, Gem, Star, Sparkles, TrendingUp, Tag, Award,
  Activity, Flame, Gamepad2
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryManagementNewService } from '../../services/categoryManagementNewService';
import { Product, ProductVariant } from '../../types/product';
import toast from 'react-hot-toast';
import api from '../../services/api';

// Baby Icon component (custom)
const BabyIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M12 12c-4 0-7 2-7 6v2h14v-2c0-4-3-6-7-6z" />
    <path d="M4 6l2-2" />
    <path d="M20 6l-2-2" />
    <path d="M4 2l1 2" />
    <path d="M20 2l-1 2" />
  </svg>
);

// Icon mapping for category groups
const iconMap: Record<string, any> = {
  'spring-summer': Sun,
  'all-clothing': Shirt,
  'discover-more': Heart,
  'shoes': Footprints,
  'accessories': Gem,
  'designer': Star,
  'highlights': Sparkles,
  'trending': TrendingUp,
  'sale': Tag,
  'brands': Award,
  'sports': Activity,
  'streetwear': Flame,
  'new-in': Sparkles,
  'clothing': Shirt,
  'toys': Gamepad2,
  'activities': Activity,
  'girls': Heart,
  'boys': Star,
  'baby': BabyIcon,
};

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  // Category data
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Selected IDs - 3-Level Hierarchy
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');
  
  // UI State
  const [showVariants, setShowVariants] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string>('');
  
  // Form data
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    oldPrice: 0,
    images: [''],
    description: '',
    gender: 'women',
    category_id: '',
    category_group_id: '',
    sub_category_id: '',
    brand_id: '',
    brand: '',
    stock_quantity: 0,
    sku: '',
    status: 'draft',
    variants: [],
    tags: [],
    rating: 0,
    reviews: 0,
    isNew: false,
    isSale: false,
    isTrending: false,
    isSizeInclusive: false,
    isMaternity: false,
    isAdaptive: false,
    season: 'summer' as 'spring' | 'summer' | 'fall' | 'winter',
    verified: false,
    yearsInBusiness: 1,
    country: '',
    moq: 1,
    moqUnit: 'piece(s)',
    sold: 0,
    reorderRate: 0,
  });

  const [tagInput, setTagInput] = useState('');

  // ==================== LOAD FUNCTIONS ====================

  const loadBrands = async () => {
    try {
      const response = await api.get('/brands');
      const brandsList = response.data.data;
      setBrands(brandsList);
    } catch (error) {
      console.error('Error loading brands:', error);
      setBrands([]);
    }
  };

  const loadAllData = async () => {
  setLoading(true);
  try {
    // Load categories from API
    const cats = await categoryManagementNewService.getCategories();
    setCategories(cats);
    console.log('📋 Categories loaded:', cats.length);
    
    // Load brands from API
    await loadBrands();
    
    // If editing, load product data
    if (isEditing && id) {
      const product = await productService.getById(id);
      if (product) {
        // ✅ Parse tags if they are a JSON string
        let tagsArray: string[] = [];
        if (product.tags) {
          if (Array.isArray(product.tags)) {
            tagsArray = product.tags;
          } else if (typeof product.tags === 'string') {
            try {
              const parsed = JSON.parse(product.tags);
              if (Array.isArray(parsed)) {
                tagsArray = parsed;
              } else {
                // Fallback: split by comma
                tagsArray = product.tags.split(',').map(t => t.trim()).filter(Boolean);
              }
            } catch (e) {
              // Not valid JSON, split by comma
              tagsArray = product.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
          }
        }

        setSelectedCategoryId(product.category_id || '');
        setSelectedGroupId(product.category_group_id || '');
        setSelectedSubCategoryId(product.sub_category_id || '');
        
        setFormData({
          ...product,
          images: product.images && product.images.length > 0 ? product.images : [product.image || ''],
          verified: product.verified || false,
          yearsInBusiness: product.yearsInBusiness || 1,
          country: product.country || '',
          moq: product.moq || 1,
          moqUnit: product.moqUnit || 'piece(s)',
          sold: product.sold || 0,
          reorderRate: product.reorderRate || 0,
          tags: tagsArray, // ✅ Ensure tags is always an array
        });
        
        setTagInput(tagsArray.join(', ')); // ✅ Use the parsed array
        
        // Load groups and subcategories for the selected category
        if (product.category_id) {
          const groups = await categoryManagementNewService.getCategoryGroups(product.category_id);
          setCategoryGroups(groups);
          
          if (product.category_group_id) {
            const subs = await categoryManagementNewService.getSubCategoriesByGroup(product.category_group_id);
            setSubCategories(subs);
          }
        }
      } else {
        toast.error('Product not found');
        navigate('/admin/products');
      }
    }
    
    setIsDataLoaded(true);
  } catch (error) {
    console.error('Error loading data:', error);
    toast.error('Failed to load data');
  } finally {
    setLoading(false);
  }
};

  // ==================== EFFECTS ====================

  // Initial data load - runs once
  useEffect(() => {
    loadAllData();
  }, [id, isEditing]);

  // Load category groups when category changes
  useEffect(() => {
    const loadGroups = async () => {
      if (selectedCategoryId && isDataLoaded) {
        try {
          const groups = await categoryManagementNewService.getCategoryGroups(selectedCategoryId);
          setCategoryGroups(groups);
          setSelectedGroupId('');
          setSelectedSubCategoryId('');
          setSubCategories([]);
          
          const category = categories.find(c => c.id === selectedCategoryId);
          if (category) {
            setFormData(prev => ({
              ...prev,
              category_id: selectedCategoryId,
              gender: category.slug as 'women' | 'men' | 'kids',
            }));
          }
        } catch (error) {
          console.error('Error loading groups:', error);
        }
      }
    };
    loadGroups();
  }, [selectedCategoryId, categories, isDataLoaded]);

  // Load sub-categories when group changes
  useEffect(() => {
    const loadSubs = async () => {
      if (selectedGroupId && isDataLoaded) {
        try {
          const subs = await categoryManagementNewService.getSubCategoriesByGroup(selectedGroupId);
          setSubCategories(subs);
          setSelectedSubCategoryId('');
          
          const group = categoryGroups.find(g => g.id === selectedGroupId);
          if (group) {
            setFormData(prev => ({
              ...prev,
              category_group_id: selectedGroupId,
            }));
          }
        } catch (error) {
          console.error('Error loading subcategories:', error);
        }
      }
    };
    loadSubs();
  }, [selectedGroupId, categoryGroups, isDataLoaded]);

  // Update redirect path when all three selected
  useEffect(() => {
    if (selectedCategoryId && selectedGroupId && selectedSubCategoryId) {
      const category = categories.find(c => c.id === selectedCategoryId);
      const group = categoryGroups.find(g => g.id === selectedGroupId);
      const sub = subCategories.find(s => s.id === selectedSubCategoryId);
      if (category && group && sub) {
        setRedirectPath(`/${category.slug}/${group.slug}/${sub.slug}`);
        setFormData(prev => ({
          ...prev,
          sub_category_id: selectedSubCategoryId,
        }));
      }
    } else {
      setRedirectPath('');
    }
  }, [selectedCategoryId, selectedGroupId, selectedSubCategoryId, categories, categoryGroups, subCategories]);

  // ==================== HANDLERS ====================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    const images = [...(formData.images || [''])];
    images[index] = value;
    setFormData(prev => ({ ...prev, images }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || ['']), ''],
    }));
  };

  const removeImage = (index: number) => {
    const images = formData.images?.filter((_, i) => i !== index) || [''];
    if (images.length === 0) images.push('');
    setFormData(prev => ({ ...prev, images }));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const variants = [...(formData.variants || [])];
    variants[index] = { ...variants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { 
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        size: '', 
        color: '', 
        sku: '', 
        stock: 0,
      }],
    }));
  };

  const removeVariant = (index: number) => {
    const variants = formData.variants?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({ ...prev, variants }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const input = e.target.value;
  setTagInput(input);
  const tagsArray = input.split(',').map(t => t.trim()).filter(Boolean);
  setFormData(prev => ({ ...prev, tags: tagsArray }));
};

  const handleGenerateAI = async () => {
    if (!formData.name?.trim()) {
      toast.error('Please enter a product name first.');
      return;
    }
    if (!selectedCategoryId) {
      toast.error('Please select a category.');
      return;
    }
    if (!selectedGroupId) {
      toast.error('Please select a category group.');
      return;
    }

    const category = categories.find(c => c.id === selectedCategoryId);
    
    setAiGenerating(true);
    try {
      const response = await api.post('/ai/generate-description', {
        name: formData.name,
        category: category?.name || '',
        gender: category?.slug || 'unisex',
        brand: formData.brand || '',
        keywords: formData.tags?.join(', ') || ''
      });

      if (response.data.success) {
        const description = response.data.data.description;
        setFormData(prev => ({ ...prev, description }));
        toast.success('✨ AI description generated!');
      } else {
        toast.error(response.data.message || 'Failed to generate description.');
      }
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      toast.error(error.response?.data?.message || 'AI generation failed.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.name?.trim()) {
    toast.error('Product name is required');
    return;
  }
  if (!formData.price || formData.price <= 0) {
    toast.error('Valid price is required');
    return;
  }
  if (!formData.sku?.trim()) {
    toast.error('SKU is required');
    return;
  }
  if (!selectedCategoryId) {
    toast.error('Please select a category');
    return;
  }
  if (!selectedGroupId) {
    toast.error('Please select a category group');
    return;
  }
  if (!selectedSubCategoryId) {
    toast.error('Please select a sub-category');
    return;
  }
  
  const images = formData.images?.filter(img => img.trim()) || [];
  if (images.length === 0) {
    toast.error('At least one image is required');
    return;
  }
  
  setSaving(true);
  
  try {
    const category = categories.find(c => c.id === selectedCategoryId);
    const group = categoryGroups.find(g => g.id === selectedGroupId);
    const sub = subCategories.find(s => s.id === selectedSubCategoryId);
    
    const productData = {
    name: formData.name.trim(),
    price: formData.price,
    oldPrice: formData.oldPrice || undefined,
    image: images[0],
    images: images,
    description: formData.description?.trim() || '',
    gender: category?.slug as 'women' | 'men' | 'kids',
    category: category?.name || '',           // Top-level category name (e.g., "Women")
    categoryGroup: group?.name || '',         // ✅ Group name (e.g., "Clothing")
    subcategory: sub?.name || '',             // ✅ Subcategory name (e.g., "Shirts & Blouses")
    brand: formData.brand?.trim() || '',
    brand_id: formData.brand_id || '',
    stock_quantity: formData.stock_quantity || 0,
    sku: formData.sku.trim(),
    status: formData.status || 'draft',
    variants: formData.variants || [],
    tags: formData.tags || [],
    rating: formData.rating || 0,
    reviews: formData.reviews || 0,
    isNew: formData.isNew || false,
    isSale: formData.isSale || false,
    isTrending: formData.isTrending || false,
    isSizeInclusive: formData.isSizeInclusive || false,
    isMaternity: formData.isMaternity || false,
    isAdaptive: formData.isAdaptive || false,
    season: formData.season || 'summer',
    verified: formData.verified || false,
    yearsInBusiness: formData.yearsInBusiness || 1,
    country: formData.country || '',
    moq: formData.moq || 1,
    moqUnit: formData.moqUnit || 'piece(s)',
    sold: formData.sold || 0,
    reorderRate: formData.reorderRate || 0,
  };
    let savedProduct;
    if (isEditing && id) {
      savedProduct = await productService.update(id, productData);
      if (savedProduct) {
        toast.success('✅ Product updated successfully!');
      } else {
        toast.error('Failed to update product');
        setSaving(false);
        return;
      }
    } else {
      savedProduct = await productService.add(productData);
      toast.success('✅ Product created successfully!');
    }

    // ✅ FIX: Navigate to the Product Detail page using the server-generated slug
    // The route in App.tsx is: /:categorySlug/:groupSlug/:subSlug/:productId
    if (savedProduct) {
      navigate(`/${category?.slug}/${group?.slug}/${sub?.slug}/${savedProduct.slug}`);
    } else {
      navigate('/admin/products');
    }
  } catch (error) {
    console.error('Error saving product:', error);
    toast.error('Failed to save product');
  } finally {
    setSaving(false);
  }
};

  const getTotalStock = () => {
    if (formData.variants && formData.variants.length > 0) {
      return formData.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return formData.stock_quantity || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEditing ? 'Update product details' : 'Create a new product for your store'}
            </p>
            {redirectPath && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                📍 Will appear at: <strong>{redirectPath}</strong>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              {/* Category Selection - Level 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category (Gender) <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Group Selection - Level 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  required
                  disabled={!selectedCategoryId}
                >
                  <option value="">Select Category Group</option>
                  {categoryGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Category Selection - Level 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sub-Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSubCategoryId}
                  onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  required
                  disabled={!selectedGroupId}
                >
                  <option value="">Select Sub-Category</option>
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || 0}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Original Price (for sale)</label>
                <input
                  type="number"
                  name="oldPrice"
                  value={formData.oldPrice || 0}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                />
                {formData.oldPrice && formData.oldPrice > 0 && formData.price && (
                  <p className="text-xs text-green-500 mt-1">
                    💰 Discount: {Math.round(((formData.oldPrice - formData.price) / formData.oldPrice) * 100)}% off
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  placeholder="e.g. PRD-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity || 0}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                />
                {formData.variants && formData.variants.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Total stock from variants: {getTotalStock()}
                  </p>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                <select
                  name="brand_id"
                  value={formData.brand_id || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  placeholder="Or enter brand name manually"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status || 'draft'}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Season</label>
                <select
                  name="season"
                  value={formData.season || 'summer'}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                >
                  <option value="spring">🌱 Spring</option>
                  <option value="summer">☀️ Summer</option>
                  <option value="fall">🍂 Fall</option>
                  <option value="winter">❄️ Winter</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={aiGenerating || !formData.name}
                    className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center gap-1.5"
                  >
                    {aiGenerating ? (
                      <>
                        <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none resize-none"
                  placeholder="Enter product description or click 'Generate with AI'..."
                />
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Supplier Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country || ''}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                >
                  <option value="">Select Country</option>
                  <option value="CN">🇨🇳 China</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="UK">🇬🇧 United Kingdom</option>
                  <option value="DE">🇩🇪 Germany</option>
                  <option value="FR">🇫🇷 France</option>
                  <option value="IT">🇮🇹 Italy</option>
                  <option value="ES">🇪🇸 Spain</option>
                  <option value="IN">🇮🇳 India</option>
                  <option value="JP">🇯🇵 Japan</option>
                  <option value="KR">🇰🇷 South Korea</option>
                  <option value="VN">🇻🇳 Vietnam</option>
                  <option value="TH">🇹🇭 Thailand</option>
                  <option value="BR">🇧🇷 Brazil</option>
                  <option value="TR">🇹🇷 Turkey</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Years in Business
                </label>
                <input
                  type="number"
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness || 1}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  min="0"
                  max="50"
                />
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="verified"
                    checked={formData.verified || false}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium">✅ Verified Supplier</span>
                </label>
              </div>
            </div>
          </div>

          {/* MOQ & Sales */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">MOQ & Sales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  MOQ (Minimum Order Quantity)
                </label>
                <input
                  type="number"
                  name="moq"
                  value={formData.moq || 1}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  MOQ Unit
                </label>
                <select
                  name="moqUnit"
                  value={formData.moqUnit || 'piece(s)'}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                >
                  <option value="piece(s)">piece(s)</option>
                  <option value="pair(s)">pair(s)</option>
                  <option value="set(s)">set(s)</option>
                  <option value="unit(s)">unit(s)</option>
                  <option value="box(es)">box(es)</option>
                  <option value="carton(s)">carton(s)</option>
                  <option value="dozen(s)">dozen(s)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Units Sold
                </label>
                <input
                  type="number"
                  name="sold"
                  value={formData.sold || 0}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reorder Rate (%)
                </label>
                <input
                  type="number"
                  name="reorderRate"
                  value={formData.reorderRate || 0}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  min="0"
                  max="100"
                />
                {formData.reorderRate && formData.reorderRate > 0 && (
                  <p className="text-xs text-green-500 mt-1">
                    ✔ Reorder rate: {formData.reorderRate}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setShowImages(!showImages)}
              className="flex items-center justify-between w-full text-left"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Images</h2>
              {showImages ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            
            {showImages && (
              <div className="mt-4 space-y-3">
                {(formData.images || ['']).map((image, index) => (
                  <div key={`image-${index}`} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                        placeholder={`Image URL ${index + 1}`}
                      />
                    </div>
                    {image && (
                      <div className="w-16 h-16 flex-shrink-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Product ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/64';
                          }}
                        />
                      </div>
                    )}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImage}
                  className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-500 transition flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Image
                </button>
              </div>
            )}
          </div>

          {/* Variants Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setShowVariants(!showVariants)}
              className="flex items-center justify-between w-full text-left"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Variants</h2>
              {showVariants ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            
            {showVariants && (
              <div className="mt-4 space-y-4">
                {(formData.variants || []).map((variant, index) => (
                  <div key={variant.id || `variant-${index}`} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Variant {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Size (e.g. M, L, XL)"
                        value={variant.size || ''}
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                        className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Color"
                        value={variant.color || ''}
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                        className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="SKU"
                        value={variant.sku || ''}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={variant.stock || 0}
                        onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                        min="0"
                        className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVariant}
                  className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-500 transition flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </button>
              </div>
            )}
          </div>

          {/* Tags & Additional Info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags & Additional Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagsChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  placeholder="Enter tags separated by commas"
                />
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span key={`tag-${index}`} className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={formData.isNew || false}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                  />
                  <span className="text-sm">✨ Mark as New</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="isSale"
                    checked={formData.isSale || false}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                  />
                  <span className="text-sm">🔥 Mark as Sale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="isTrending"
                    checked={formData.isTrending || false}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                  />
                  <span className="text-sm">📈 Mark as Trending</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="isBestseller"
                    checked={formData.isBestseller || false}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                  />
                  <span className="text-sm">⭐ Mark as Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="isSizeInclusive"
                    checked={formData.isSizeInclusive || false}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm">👗 Size Inclusive</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="isMaternity"
                    checked={formData.isMaternity || false}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                  />
                  <span className="text-sm">🤰 Maternity</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="isAdaptive"
                    checked={formData.isAdaptive || false}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm">♿ Adaptive Fashion</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 -mx-4 px-4 sm:mx-0 sm:px-0 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition text-gray-700 dark:text-white order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;