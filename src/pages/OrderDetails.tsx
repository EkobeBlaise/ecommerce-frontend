import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, Calendar, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand?: string;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
  orderNotes?: string;
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { formatPrice } = useSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    setLoading(true);
    setError('');
    try {
      const foundOrder = await orderService.getById(orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('Order not found');
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setError('Failed to load order details');
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing': return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <Clock className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
        <div className="container mx-auto px-4 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Order Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'Order not found'}</p>
          <Link to="/my-orders" className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 transition">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link to="/my-orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-4 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Orders
            </Link>
            <h1 className="text-2xl font-bold dark:text-white">Order Details</h1>
            <p className="text-gray-500">Order #{order.id.substring(0, 8)}</p>
          </div>

          {/* Order Status */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {order.trackingNumber && (
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.trackingNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Order Items ({order.items.length})</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-3 border-b last:border-0 border-gray-100 dark:border-gray-700">
                  <img src={item.image || 'https://picsum.photos/seed/' + item.id + '/80/80'} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-medium dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.brand || 'Fashion Brand'}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                    {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="dark:text-white">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="dark:text-white">{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="dark:text-white">{formatPrice(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 border-gray-200 dark:border-gray-700">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-pink-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <MapPin className="w-5 h-5" /> Shipping Address
              </h2>
              <div className="text-sm space-y-1">
                <p className="font-medium dark:text-white">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.addressLine2}</p>}
                <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.country}</p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">📞 {order.shippingAddress.phone}</p>
                <p className="text-gray-600 dark:text-gray-400">📧 {order.shippingAddress.email}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <CreditCard className="w-5 h-5" /> Payment Information
              </h2>
              <div className="text-sm space-y-2">
                <div>
                  <p className="text-gray-500">Method</p>
                  <p className="font-medium dark:text-white capitalize">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {order.orderNotes && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mt-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-2 dark:text-white">Order Notes</h2>
              <p className="text-gray-600 dark:text-gray-400">{order.orderNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;