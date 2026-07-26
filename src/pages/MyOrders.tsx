import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Calendar, DollarSign } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../store/authStore';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  createdAt: Date;
  status: string;
  total: number;
  items: any[];
}

const MyOrders: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { formatPrice } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Get all orders from API
      const allOrders = await orderService.getAll();
      
      // Filter by user ID if authenticated
      let userOrders = allOrders;
      if (isAuthenticated && user) {
        userOrders = allOrders.filter((order: any) => order.userId === user.id);
      }
      
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
        <div className="container mx-auto px-4 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Please Log In</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Sign in to view your order history.</p>
          <Link to="/login" className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 transition">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
        <div className="container mx-auto px-4 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2 dark:text-white">No Orders Yet</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't placed any orders yet</p>
          <Link to="/products" className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 transition">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">My Orders ({orders.length})</h1>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">#{order.id.substring(0, 8)}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{order.items?.length || 0} items</td>
                    <td className="p-4">
                      <Link 
                        to={`/my-orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" /> View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;