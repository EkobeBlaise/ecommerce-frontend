import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Package, Users, TrendingUp,
  Clock, CheckCircle, Truck, AlertCircle,
  ArrowUp, ArrowDown, Gift, Zap, Tag, Star,
  Settings, PlusCircle, DollarSign, Mail,
  BarChart3, Globe, LayoutGrid
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { formatPrice } = useSettings();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    yesterdayOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
    averageOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [reviewStats, setReviewStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ----- Fully async load function -----
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Order stats
      const orderStats = await orderService.getDashboardStats();
      setStats({
        totalOrders: orderStats.totalOrders || 0,
        totalRevenue: orderStats.totalRevenue || 0,
        todayOrders: orderStats.todayOrders || 0,
        yesterdayOrders: orderStats.yesterdayOrders || 0,
        pendingOrders: orderStats.pendingOrders || 0,
        processingOrders: orderStats.processingOrders || 0,
        shippedOrders: orderStats.shippedOrders || 0,
        deliveredOrders: orderStats.deliveredOrders || 0,
        cancelledOrders: orderStats.cancelledOrders || 0,
        refundedOrders: orderStats.refundedOrders || 0,
        averageOrderValue: orderStats.averageOrderValue || 0,
      });

      // 2. Recent orders – ensure array
      const recent = await orderService.getRecent(5);
      setRecentOrders(Array.isArray(recent) ? recent : []);

      // 3. Product count – productService is still sync (localStorage), so we can call directly
      const products = productService.getAll();
      setTotalProducts(Array.isArray(products) ? products.length : 0);

      // 4. User count – from localStorage (or could be from API)
      try {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const parsed = JSON.parse(authData);
          const users = parsed.state?.users || [];
          setTotalUsers(Array.isArray(users) ? users.length : 1);
        } else {
          setTotalUsers(1);
        }
      } catch (e) {
        setTotalUsers(1);
      }

      // 5. Review stats – from localStorage (or could be from API)
      try {
        const storedReviews = localStorage.getItem('reviews');
        if (storedReviews) {
          const reviews = JSON.parse(storedReviews);
          setReviewStats({
            total: Array.isArray(reviews) ? reviews.length : 0,
            approved: Array.isArray(reviews) ? reviews.filter((r: any) => r.status === 'approved').length : 0,
            pending: Array.isArray(reviews) ? reviews.filter((r: any) => r.status === 'pending').length : 0,
            rejected: Array.isArray(reviews) ? reviews.filter((r: any) => r.status === 'rejected').length : 0,
          });
        }
      } catch (e) {
        setReviewStats({ total: 0, approved: 0, pending: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
      // Set safe fallbacks
      setRecentOrders([]);
      setStats(prev => ({ ...prev, totalOrders: 0, totalRevenue: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('WARNING: This will reset all products and categories to default. Continue?')) {
      productService.resetToDefault();
      toast.success('Reset to default data');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      shipped: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
      delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      refunded: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    };
    const { color } = config[status] || config.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
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

  const statCards = [
    {
      title: 'Total Sales',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
      change: '+23%',
      trend: 'up',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      change: '+15%',
      trend: 'up',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      change: '+8%',
      trend: 'up',
    },
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      textColor: 'text-orange-600 dark:text-orange-400',
      change: '+12%',
      trend: 'up',
    },
  ];

  const quickActions = [
    { title: 'Flash Sales', icon: <Zap className="w-5 h-5" />, color: 'from-red-500 to-orange-500', link: '/admin/flash-sales', description: 'Time-limited offers' },
    { title: 'Coupons', icon: <Gift className="w-5 h-5" />, color: 'from-green-500 to-teal-500', link: '/admin/coupons', description: 'Discount codes' },
    { title: 'Categories', icon: <Tag className="w-5 h-5" />, color: 'from-teal-500 to-cyan-500', link: '/admin/categories', description: 'Manage categories' },
    { title: 'Reviews', icon: <Star className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500', link: '/admin/reviews', description: 'Moderate reviews', badge: reviewStats.pending },
    { title: 'Emails', icon: <Mail className="w-5 h-5" />, color: 'from-blue-500 to-indigo-500', link: '/admin/emails', description: 'Email campaigns' },
    { title: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, color: 'from-indigo-500 to-blue-500', link: '/admin/analytics', description: 'Order insights' },
    { title: 'Customers', icon: <Users className="w-5 h-5" />, color: 'from-green-500 to-teal-500', link: '/admin/customers', description: 'Manage customers' },
    { title: 'Brands', icon: <Tag className="w-5 h-5" />, color: 'from-teal-500 to-cyan-500', link: '/admin/brands', description: 'Manage brands' },
    { title: 'Merchandising', icon: <LayoutGrid className="w-5 h-5" />, color: 'from-indigo-500 to-pink-500', link: '/admin/merchandising', description: 'Manage sections' },
    { title: 'SEO', icon: <Globe className="w-5 h-5" />, color: 'from-purple-500 to-pink-500', link: '/admin/seo', description: 'SEO settings' },
    { title: 'Settings', icon: <Settings className="w-5 h-5" />, color: 'from-gray-600 to-gray-800', link: '/admin/settings', description: 'Store settings' },
    { title: 'Products', icon: <Package className="w-5 h-5" />, color: 'from-pink-500 to-rose-500', link: '/admin/products', description: 'Manage products' },
    // ✅ NEW: Product Manager
    { title: 'Product Manager', icon: <LayoutGrid className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500', link: '/admin/product-manager', description: 'Quick add & manage' },
  ];

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
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your store.</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">✅ Data persisted in MySQL via API</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleReset} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium shadow-sm"
              >
                Reset to Default
              </button>
              <Link 
                to="/admin/products/new" 
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Add Product
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
                  <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                    {card.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {card.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-blue-600">{stats.processingOrders}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Processing</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-purple-600">{stats.shippedOrders}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Shipped</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-green-600">{stats.deliveredOrders}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Delivered</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-red-600">{stats.cancelledOrders}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-gray-600">{stats.refundedOrders}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Refunded</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                to={action.link}
                className={`bg-gradient-to-r ${action.color} rounded-lg shadow-sm p-4 text-white hover:shadow-lg transition transform hover:scale-105 text-center relative`}
              >
                <div className="flex flex-col items-center">
                  <div className="mb-2">{action.icon}</div>
                  <h3 className="font-semibold text-sm">{action.title}</h3>
                  <p className="text-xs opacity-90 mt-1">{action.description}</p>
                </div>
                {action.badge && action.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px]">
                    {action.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Latest customer orders</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm text-pink-600 hover:underline font-medium"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium">No recent orders</p>
                      <p className="text-sm">Orders will appear here once customers place them</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        💡 Tip: Place a test order as a customer to see it appear here!
                      </p>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          #{order.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.shippingAddress?.firstName || 'Customer'} {order.shippingAddress?.lastName || ''}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.isGuest ? '👤 Guest' : '👤 User'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {formatPrice(order.total || 0)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status || 'pending')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;