import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Package } from 'lucide-react';
import { categoryManagementNewService } from '../../services/categoryManagementNewService';
import { Category, CategoryGroup, SubCategory } from '../../types/categoryTypes';
import toast from 'react-hot-toast';

type ViewMode = 'categories' | 'groups' | 'subcategories';
type GenderFilter = 'all' | 'women' | 'men' | 'kids';

const Categories: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  
  // Data
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategoryGroups, setAllCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  
  // Selected items
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'category' | 'group' | 'subcategory'>('category');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    groupId: '',
    icon: '',
    gender: 'women' as 'women' | 'men' | 'kids' | 'unisex',
  });

  // Load data when gender filter changes
  useEffect(() => {
    loadData();
  }, [genderFilter]);

  // Load data when selected category changes (for groups/subcategories)
  useEffect(() => {
    if (selectedCategoryId) {
      loadGroupsAndSubs();
    }
  }, [selectedCategoryId]);

  // Load data when selected group changes (for subcategories)
  useEffect(() => {
    if (selectedGroupId) {
      loadSubs();
    }
  }, [selectedGroupId]);

  // ----- Load Functions (async) -----
  const loadData = async () => {
    setLoading(true);
    try {
      // Load all categories
      const cats = await categoryManagementNewService.getCategories();
      setAllCategories(cats);
      
      // Filter by gender
      let filteredCats: Category[];
      if (genderFilter === 'all') {
        filteredCats = cats;
      } else {
        filteredCats = cats.filter(c => c.gender === genderFilter);
      }
      setCategories(filteredCats);
      
      // Reset selected category if needed
      if (filteredCats.length > 0) {
        const firstCatId = selectedCategoryId && filteredCats.some(c => c.id === selectedCategoryId)
          ? selectedCategoryId
          : filteredCats[0].id;
        setSelectedCategoryId(firstCatId);
        // Load groups for the selected category
        await loadGroupsAndSubs(firstCatId);
      } else {
        setSelectedCategoryId('');
        setCategoryGroups([]);
        setAllCategoryGroups([]);
        setSubCategories([]);
        setAllSubCategories([]);
        setSelectedGroupId('');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupsAndSubs = async (categoryId?: string) => {
    try {
      const catId = categoryId || selectedCategoryId;
      if (!catId) return;
      
      const groups = await categoryManagementNewService.getCategoryGroups(catId);
      setCategoryGroups(groups);
      setAllCategoryGroups(groups);
      
      if (groups.length > 0) {
        const firstGroupId = selectedGroupId && groups.some(g => g.id === selectedGroupId)
          ? selectedGroupId
          : groups[0].id;
        setSelectedGroupId(firstGroupId);
        await loadSubs(firstGroupId);
      } else {
        setSelectedGroupId('');
        setSubCategories([]);
        setAllSubCategories([]);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    }
  };

  const loadSubs = async (groupId?: string) => {
    try {
      const gId = groupId || selectedGroupId;
      if (!gId) {
        setSubCategories([]);
        setAllSubCategories([]);
        return;
      }
      const subs = await categoryManagementNewService.getSubCategoriesByGroup(gId);
      setSubCategories(subs);
      setAllSubCategories(subs);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      toast.error('Failed to load subcategories');
    }
  };

  // ----- Handlers -----
  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    await loadGroupsAndSubs(categoryId);
  };

  const handleGroupSelect = async (groupId: string) => {
    setSelectedGroupId(groupId);
    await loadSubs(groupId);
  };

  // ----- Modal Handlers -----
  const openAddModal = (type: 'category' | 'group' | 'subcategory') => {
    setModalType(type);
    setEditingItem(null);
    setFormData({
      name: '',
      slug: '',
      categoryId: type === 'group' ? selectedCategoryId : '',
      groupId: type === 'subcategory' ? selectedGroupId : '',
      icon: '',
      gender: 'women',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any, type: 'category' | 'group' | 'subcategory') => {
    setModalType(type);
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug || '',
      categoryId: item.categoryId || selectedCategoryId,
      groupId: item.categoryGroupId || selectedGroupId,
      icon: item.icon || '',
      gender: item.gender || 'women',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    const slug = formData.slug || formData.name.toLowerCase().replace(/ /g, '-');

    try {
      if (modalType === 'category') {
        if (editingItem) {
          await categoryManagementNewService.updateCategory(editingItem.id, {
            name: formData.name.trim(),
            slug,
            gender: formData.gender,
          });
          toast.success('Category updated successfully!');
        } else {
          await categoryManagementNewService.addCategory({
            name: formData.name.trim(),
            slug,
            gender: formData.gender,
            isActive: true,
            displayOrder: categories.length + 1,
          });
          toast.success('Category added successfully!');
        }
      } else if (modalType === 'group') {
        if (!formData.categoryId) {
          toast.error('Please select a parent category');
          return;
        }
        if (editingItem) {
          await categoryManagementNewService.updateCategoryGroup(editingItem.id, {
            name: formData.name.trim(),
            slug,
            icon: formData.icon,
          });
          toast.success('Group updated successfully!');
        } else {
          await categoryManagementNewService.addCategoryGroup({
            name: formData.name.trim(),
            slug,
            categoryId: formData.categoryId,
            icon: formData.icon || 'Tag',
            isActive: true,
            displayOrder: categoryGroups.length + 1,
          });
          toast.success('Group added successfully!');
        }
      } else {
        if (!formData.groupId) {
          toast.error('Please select a parent group');
          return;
        }
        if (editingItem) {
          await categoryManagementNewService.updateSubCategory(editingItem.id, {
            name: formData.name.trim(),
            slug,
          });
          toast.success('Sub-category updated successfully!');
        } else {
          await categoryManagementNewService.addSubCategory({
            name: formData.name.trim(),
            slug,
            categoryGroupId: formData.groupId,
            categoryId: selectedCategoryId,
            isActive: true,
            displayOrder: subCategories.length + 1,
          });
          toast.success('Sub-category added successfully!');
        }
      }
      
      resetForm();
      setIsModalOpen(false);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: string, type: 'category' | 'group' | 'subcategory') => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    
    try {
      if (type === 'category') {
        await categoryManagementNewService.deleteCategory(id);
        toast.success('Category deleted successfully!');
      } else if (type === 'group') {
        await categoryManagementNewService.deleteCategoryGroup(id);
        toast.success('Group deleted successfully!');
      } else {
        await categoryManagementNewService.deleteSubCategory(id);
        toast.success('Sub-category deleted successfully!');
      }
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      categoryId: '',
      groupId: '',
      icon: '',
      gender: 'women',
    });
    setEditingItem(null);
  };

  // ----- Helpers -----
  const getGenderBadge = (gender: string) => {
    const colors: Record<string, string> = {
      women: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30',
      men: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      kids: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      unisex: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    };
    const color = colors[gender] || colors.unisex;
    return <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>{gender || 'unisex'}</span>;
  };

  const getGenderLabel = (gender: string): string => {
    const labels: Record<string, string> = {
      all: '🌐 All Genders',
      women: '👩 Women',
      men: '👨 Men',
      kids: '🧒 Kids',
    };
    return labels[gender] || gender;
  };

  const getIcon = (name: string): string => {
    const icons: Record<string, string> = {
      'Clothing': '👕',
      'Shoes': '👟',
      'Accessories': '👜',
      'Sports': '⚽',
      'Designer': '👗',
      'Jewelry': '💍',
      'Bags': '👜',
      'Electronics': '📱',
      'Home & Living': '🏠',
      'Books': '📚',
      'Beauty': '💄',
      'NEW IN': '✨',
      'Girls': '👧',
      'Boys': '👦',
      'Baby': '🍼',
      'Streetwear': '🔥',
      'Women': '👩',
      'Men': '👨',
      'Kids': '🧒',
    };
    return icons[name] || '📦';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Determine which items to show based on viewMode
  let items: any[] = [];
  let itemType: 'category' | 'group' | 'subcategory' = 'category';
  if (viewMode === 'categories') {
    items = categories;
    itemType = 'category';
  } else if (viewMode === 'groups') {
    items = allCategoryGroups;
    itemType = 'group';
  } else {
    items = allSubCategories;
    itemType = 'subcategory';
  }

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage Categories → Groups → Sub-Categories (3-Level Hierarchy)
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              ✨ Currently viewing: <strong>{getGenderLabel(genderFilter)}</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as GenderFilter)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none text-sm"
            >
              <option value="all">🌐 All Genders</option>
              <option value="women">👩 Women</option>
              <option value="men">👨 Men</option>
              <option value="kids">🧒 Kids</option>
            </select>
            
            <button
              onClick={() => openAddModal('category')}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
            <button
              onClick={() => openAddModal('group')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Group
            </button>
            <button
              onClick={() => openAddModal('subcategory')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Sub-Category
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div 
            className={`bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border-2 cursor-pointer transition ${
              viewMode === 'categories' ? 'border-pink-500' : 'border-gray-200 dark:border-gray-800'
            }`}
            onClick={() => setViewMode('categories')}
          >
            <p className="text-sm text-gray-500">📁 Categories</p>
            <p className="text-2xl font-bold dark:text-white">{categories.length}</p>
          </div>
          <div 
            className={`bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border-2 cursor-pointer transition ${
              viewMode === 'groups' ? 'border-blue-500' : 'border-gray-200 dark:border-gray-800'
            }`}
            onClick={() => setViewMode('groups')}
          >
            <p className="text-sm text-gray-500">📂 Groups</p>
            <p className="text-2xl font-bold dark:text-white">{allCategoryGroups.length}</p>
          </div>
          <div 
            className={`bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border-2 cursor-pointer transition ${
              viewMode === 'subcategories' ? 'border-green-500' : 'border-gray-200 dark:border-gray-800'
            }`}
            onClick={() => setViewMode('subcategories')}
          >
            <p className="text-sm text-gray-500">📄 Sub-Categories</p>
            <p className="text-2xl font-bold dark:text-white">{allSubCategories.length}</p>
          </div>
        </div>

        {/* Filters for groups/subcategories */}
        <div className="flex flex-wrap gap-4 mb-6">
          {viewMode === 'groups' && categories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter by Category:</span>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.gender ? `(${c.gender})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {viewMode === 'subcategories' && categoryGroups.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter by Group:</span>
              <select
                value={selectedGroupId}
                onChange={(e) => handleGroupSelect(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
              >
                {categoryGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Grid of items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {safeItems.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No {viewMode} found. 
                {viewMode === 'categories' && ' Add your first category!'}
                {viewMode === 'groups' && ' Select a category and add a group!'}
                {viewMode === 'subcategories' && ' Select a group and add a sub-category!'}
              </p>
              <button
                onClick={() => openAddModal(viewMode === 'categories' ? 'category' : viewMode === 'groups' ? 'group' : 'subcategory')}
                className="mt-2 text-pink-600 hover:underline"
              >
                Add {viewMode === 'categories' ? 'Category' : viewMode === 'groups' ? 'Group' : 'Sub-Category'}
              </button>
            </div>
          ) : (
            safeItems.map((item: any) => {
              const isCategory = viewMode === 'categories';
              const isGroup = viewMode === 'groups';
              
              // Get parent category name for groups
              let parentCategoryName = '';
              if (isGroup) {
                const parent = allCategories.find(c => c.id === item.categoryId);
                parentCategoryName = parent ? `${parent.name}` : 'No parent';
              }
              
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 hover:shadow-md transition border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getIcon(item.name)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            /{item.slug || item.name.toLowerCase().replace(/ /g, '-')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {isCategory && item.gender && getGenderBadge(item.gender)}
                        {isGroup && item.icon && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                            {item.icon}
                          </span>
                        )}
                        {isGroup && parentCategoryName && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                            📁 {parentCategoryName}
                          </span>
                        )}
                        {!isCategory && !isGroup && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                            📂 {allCategoryGroups.find(g => g.id === item.categoryGroupId)?.name || 'No parent'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => openEditModal(item, itemType)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, itemType)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal (unchanged) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 animate-slideUp border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingItem ? `Edit ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}` : `Add New ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                    placeholder={`Enter ${modalType} name`}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slug (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                    placeholder="e.g. new-category"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave blank to auto-generate from name
                  </p>
                </div>

                {modalType === 'group' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parent Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {modalType === 'subcategory' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parent Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.groupId}
                      onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                    >
                      <option value="">Select Group</option>
                      {categoryGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {modalType === 'group' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                      placeholder="e.g. Sparkles, Shirt, Crown"
                    />
                  </div>
                )}

                {modalType === 'category' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                    >
                      <option value="women">👩 Women</option>
                      <option value="men">👨 Men</option>
                      <option value="kids">🧒 Kids</option>
                      <option value="unisex">👤 Unisex</option>
                    </select>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    💡 New {modalType} will automatically appear in product forms and search results.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingItem ? `Update ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}` : `Add ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;