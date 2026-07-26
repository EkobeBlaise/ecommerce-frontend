import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, Calendar, ArrowLeft, Search } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useSettings } from '../context/SettingsContext';
import { Order } from '../types/order';

const OrderTracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { formatPrice } = useSettings();

  const trackOrder = async () => {
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Try to find by ID directly
      let foundOrder = await orderService.getById(orderId);
      
      // If not found, search by partial ID
      if (!foundOrder) {
        const allOrders = await orderService.getAll();
        foundOrder = allOrders.find(o => o.id.includes(orderId)) || null;
      }
      
      if (foundOrder) {
        setOrder(foundOrder);
        setError('');
      } else {
        setOrder(null);
        setError('Order not found. Please check your order ID and try again.');
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Error searching for order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      trackOrder();
    }
  }, [orderId]);

  const getStatusStep = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Clock, description: 'Your order has been received and is awaiting processing' },
      { key: 'processing', label: 'Processing', icon: Package, description: 'Your order is being prepared for shipment' },
      { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order is on the way to you' },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Your order has been delivered successfully' },
    ];
    
    let currentStepIndex = steps.findIndex(s => s.key === status);
    if (currentStepIndex === -1) currentStepIndex = 0;
    
    return { steps, currentStepIndex };
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
    return config[status]?.color || config.pending.color;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const { steps, currentStepIndex } = getStatusStep(order?.status || 'pending');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold dark:text-white">Track Your Order</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your order ID to track your package</p>
          </div>

          {/* Search Form */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID (e.g., ORD-1749483847291-A1B2C3)"
                className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
              />
              <button
                onClick={trackOrder}
                disabled={loading}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Track Order
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              💡 You can find your order ID in your confirmation email or in your account orders page.
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <>
              {/* Order Info */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
                    <p className="font-mono font-semibold text-gray-900 dark:text-white">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                    <p className="text-gray-900 dark:text-white">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="font-semibold text-pink-600">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                {order.trackingNumber && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
                    <p className="font-mono text-sm text-blue-600 dark:text-blue-400">{order.trackingNumber}</p>
                  </div>
                )}
              </div>

              {/* Tracking Timeline */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Status</h2>
                <div className="relative">
                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.key} className="relative flex items-start mb-8 last:mb-0">
                        {index < steps.length - 1 && (
                          <div className={`absolute left-4 top-8 w-0.5 h-12 ${
                            isCompleted ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`} />
                        )}
                        
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <h3 className={`font-semibold ${
                            isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {step.label}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                          {isCurrent && (
                            <span className="inline-block mt-1 text-xs text-pink-600 dark:text-pink-400 font-medium">
                              Current Status
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <img src={item.image || 'https://picsum.photos/seed/' + item.id + '/48/48'} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 flex flex-wrap gap-3">
                  <Link 
                    to={`/my-orders/${order.id}`}
                    className="text-pink-600 hover:underline text-sm flex items-center gap-1"
                  >
                    View Full Order Details →
                  </Link>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mt-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-pink-500" />
                    Shipping Address
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="mt-1">📧 {order.shippingAddress.email}</p>
                    {order.shippingAddress.phone && <p>📱 {order.shippingAddress.phone}</p>}
                  </div>
                </div>
              )}

              {/* Back to Home */}
              <div className="mt-6 text-center">
                <Link 
                  to="/"
                  className="text-pink-600 hover:underline text-sm flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>
            </>
          )}

          {/* No Order Found - Show Help */}
          {!order && !loading && !error && !orderId && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-800">
              <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Track Your Order</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Enter your order ID above to track your package.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                You can find your order ID in your confirmation email.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;