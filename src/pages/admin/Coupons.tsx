import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Eye, Search,
  ChevronDown, ChevronUp, X,
  Tag, Percent, DollarSign, Truck,
  Clock, CheckCircle, AlertCircle,
  RefreshCw, Download, Copy
} from 'lucide-react';
import { couponService } from '../../services/couponService';
import { Coupon } from '../../types/coupon';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

const AdminCoupons: React.FC = () => {
  const { formatPrice } = useSettings();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Coupon['status']>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    disabledCoupons: 0,
    totalUsage: 0,
    totalDiscount: 0,
  });
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    type: 'percentage',
    value: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 100,
    perUserLimit: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'active',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const allCoupons = await couponService.getAll(); // now async
      setCoupons(allCoupons);
      setFilteredCoupons(allCoupons);
      const statsData = await couponService.getStats(); // now async
      setStats(statsData);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  // Filter coupons whenever coupons, searchTerm or filterStatus change
  useEffect(() => {
    let result = [...coupons];
    
    if (filterStatus !== 'all') {
      result = result.filter(c => c.status === filterStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.code.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredCoupons(result);
  }, [coupons, searchTerm, filterStatus]);

  const handleSubmit = async () => {
    if (!formData.code && !editingCoupon) {
      toast.error('Please enter a coupon code');
      return;
    }
    if (!formData.value || formData.value <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    try {
      if (editingCoupon) {
        const updated = await couponService.update(editingCoupon.id, formData);
        if (updated) {
          toast.success('Coupon updated successfully!');
        }
      } else {
        await couponService.create(formData as Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>);
        toast.success('Coupon created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      await loadCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const success = await couponService.delete(id);
        if (success) {
          toast.success('Coupon deleted successfully!');
          await loadCoupons();
        } else {
          toast.error('Failed to delete coupon');
        }
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 100,
      perUserLimit: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
    });
    setEditingCoupon(null);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      startDate: new Date(coupon.startDate),
      endDate: new Date(coupon.endDate),
      status: coupon.status,
    });
    setIsModalOpen(true);
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { icon: any; color: string; label: string }> = {
      percentage: { icon: Percent, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', label: 'Percentage' },
      fixed: { icon: DollarSign, color: 'text-green-600 bg-green-100 dark:bg-green-900/30', label: 'Fixed' },
      free_shipping: { icon: Truck, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', label: 'Free Shipping' },
    };
    const { icon: Icon, color, label } = config[type] || config.percentage;
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      active: { color: 'text-green-600 bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
      expired: { color: 'text-red-600 bg-red-100 dark:bg-red-900/30', icon: AlertCircle },
      disabled: { color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', icon: X },
    };
    const { color, icon: Icon } = config[status] || config.active;
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupon Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage discount coupons ({filteredCoupons.length} coupons)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadCoupons}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => {
                const data = JSON.stringify(coupons, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `coupons_export_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Coupons exported!');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Coupon
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalCoupons}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-green-600">{stats.activeCoupons}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-red-600">{stats.expiredCoupons}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Expired</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-gray-600">{stats.disabledCoupons}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Disabled</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-blue-600">{stats.totalUsage}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Usage</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-pink-600">{formatPrice(stats.totalDiscount)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Saved</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search coupons by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="disabled">Disabled</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expires</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Tag className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium">No coupons found</p>
                      <p className="text-sm mt-1">Create your first coupon to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-900 dark:text-white">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {coupon.description || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getTypeBadge(coupon.type)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {coupon.usedCount} / {coupon.usageLimit}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(coupon.endDate)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(coupon.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer with count */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredCoupons.length} of {coupons.length} coupons
            </p>
          </div>
        </div>

        {/* Add/Edit Modal (unchanged) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
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
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Coupon Code {!editingCoupon && '*'}
                    </label>
                    <input
                      type="text"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="e.g. SUMMER2024"
                      disabled={!!editingCoupon}
                    />
                    {!editingCoupon && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Leave blank to auto-generate
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="Summer Sale 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Type *
                    </label>
                    <select
                      value={formData.type || 'percentage'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={formData.value || 0}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder={formData.type === 'percentage' ? '10' : '10.00'}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Order Amount
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount || 0}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="50.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Discount
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount || 0}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="20.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit || 100}
                      onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Per User Limit
                    </label>
                    <input
                      type="number"
                      value={formData.perUserLimit || 1}
                      onChange={(e) => setFormData({ ...formData, perUserLimit: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition font-medium"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;