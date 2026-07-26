import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
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

const OrderHistory: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Order History</h1>
            <p className="text-gray-500 dark:text-gray-400">View all your past orders</p>
          </div>
          <Link to="/products" className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition text-sm font-medium">
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-800">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 dark:text-white">No Orders Yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't placed any orders yet.</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-700 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> {formatDate(order.createdAt)}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-pink-600">{formatPrice(order.total)}</p>
                    <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                  </div>
                  <Link 
                    to={`/my-orders/${order.id}`} 
                    className="text-pink-600 hover:text-pink-700 text-sm flex items-center gap-1 font-medium"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;