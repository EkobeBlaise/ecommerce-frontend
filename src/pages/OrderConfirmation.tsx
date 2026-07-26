import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Check, Package, Mail, Printer, Download, Home, ShoppingBag, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  userId: string;
  isGuest?: boolean;
  guestEmail?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: any;
  billingAddress: any;
  paymentMethod: string;
  paymentStatus: string;
  orderNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load order from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const found = orders.find((o: Order) => o.id === orderId);
    
    if (found) {
      setOrder(found);
    } else {
      toast.error('Order not found');
      navigate('/');
    }
    setLoading(false);
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!order) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailReceipt = () => {
    // In a real app, this would trigger an email
    toast.success('Receipt sent to your email!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8 text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2 dark:text-white">Order Confirmed!</h1>
            <p className="text-gray-500 mb-4">
              Thank you for your order #{order.id.substring(0, 8)}. 
              {order.isGuest && (
                <span className="block text-sm mt-1">
                  A confirmation has been sent to {order.guestEmail || order.shippingAddress.email}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleEmailReceipt}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-sm"
              >
                <Mail className="w-4 h-4" />
                Email Receipt
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
              >
                <Printer className="w-4 h-4" />
                Print Order
              </button>
              <Link
                to="/products"
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="md:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-3 border-b last:border-0">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                        {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                      </div>
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <p className="text-sm">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                    {order.shippingAddress.addressLine1}<br />
                    {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold mb-3">Payment Method</h3>
                  <p className="text-sm capitalize">{order.paymentMethod}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: <span className="capitalize">{order.paymentStatus}</span>
                  </p>
                </div>
              </div>

              {order.orderNotes && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mt-6">
                  <h3 className="font-semibold mb-2">Order Notes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.orderNotes}</p>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-mono">#{order.id.substring(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="capitalize font-medium text-green-600">{order.status}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>{formatPrice(order.tax)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-pink-600">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {order.isGuest && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Email: {order.guestEmail || order.shippingAddress.email}
                    </p>
                    <Link
                      to={`/register?email=${encodeURIComponent(order.guestEmail || order.shippingAddress.email)}`}
                      className="text-xs text-pink-600 hover:underline mt-1 inline-block"
                    >
                      Create an account to track your orders →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Track Order Button */}
          <div className="mt-6 text-center">
            <Link
              to={order.isGuest ? '/' : '/orders'}
              className="inline-flex items-center gap-2 text-pink-600 hover:underline"
            >
              {order.isGuest ? 'Return Home' : 'View All Orders'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
