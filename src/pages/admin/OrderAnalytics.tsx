import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, 
  Calendar, Download, Filter, BarChart3,
  PieChart, LineChart, Package, Users
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useSettings } from '../../context/SettingsContext';

const OrderAnalytics: React.FC = () => {
  const { formatPrice } = useSettings();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // ✅ Get all orders from API
      const allOrders = await orderService.getAll();
      
      // Ensure allOrders is an array
      const ordersArray = Array.isArray(allOrders) ? allOrders : [];
      
      // Calculate stats
      const totalOrders = ordersArray.length;
      const totalRevenue = ordersArray.reduce((sum, o) => sum + (o.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      setStats({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        pendingOrders: ordersArray.filter(o => o.status === 'pending').length,
        processingOrders: ordersArray.filter(o => o.status === 'processing').length,
        shippedOrders: ordersArray.filter(o => o.status === 'shipped').length,
        deliveredOrders: ordersArray.filter(o => o.status === 'delivered').length,
        cancelledOrders: ordersArray.filter(o => o.status === 'cancelled').length,
        refundedOrders: ordersArray.filter(o => o.status === 'refunded').length,
      });

      // Calculate monthly data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      
      const monthlyRevenue = months.map((month, index) => {
        const monthOrders = ordersArray.filter(o => {
          const date = new Date(o.createdAt);
          return date.getFullYear() === currentYear && date.getMonth() === index;
        });
        const revenue = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        return { month, revenue, orders: monthOrders.length };
      });
      setMonthlyData(monthlyRevenue);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: formatPrice(stats.totalRevenue), 
      icon: DollarSign, 
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30' 
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: Package, 
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
    },
    { 
      title: 'Avg Order Value', 
      value: formatPrice(stats.averageOrderValue), 
      icon: TrendingUp, 
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' 
    },
    { 
      title: 'Conversion Rate', 
      value: '12.5%', 
      icon: Users, 
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' 
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Analytics</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your order performance and trends</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button 
              onClick={async () => {
                try {
                  const orders = await orderService.getAll();
                  const data = JSON.stringify(orders, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Export error:', error);
                }
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pink-500" />
            Monthly Revenue
          </h2>
          <div className="h-64 flex items-end gap-2">
            {monthlyData.map((data, index) => {
              const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
              const height = (data.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center">
                    <div 
                      className="w-full max-w-[40px] bg-gradient-to-t from-pink-500 to-pink-400 rounded-t transition-all duration-500 hover:from-pink-600 hover:to-pink-500"
                      style={{ height: `${Math.max(height, 5)}%`, minHeight: '20px' }}
                    >
                      <div className="text-center text-xs text-white font-medium mt-1">
                        ${data.revenue.toFixed(0)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{data.month}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-pink-500" />
              Order Status Breakdown
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Pending', value: stats.pendingOrders, color: 'bg-yellow-500' },
                { label: 'Processing', value: stats.processingOrders, color: 'bg-blue-500' },
                { label: 'Shipped', value: stats.shippedOrders, color: 'bg-purple-500' },
                { label: 'Delivered', value: stats.deliveredOrders, color: 'bg-green-500' },
                { label: 'Cancelled', value: stats.cancelledOrders, color: 'bg-red-500' },
                { label: 'Refunded', value: stats.refundedOrders, color: 'bg-gray-500' },
              ].map((item, index) => {
                const total = stats.totalOrders || 1;
                const percentage = (item.value / total) * 100;
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                      <span className="text-gray-900 dark:text-white font-medium">{item.value} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-500" />
              Key Insights
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 12% from last month</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Growth</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 8.5% from last month</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Customer Retention</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">67%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Returning customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderAnalytics;