import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Heart, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useSettings } from '../context/SettingsContext';
import { couponService } from '../services/couponService';
import toast from 'react-hot-toast';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, savedForLater, removeItem, updateQuantity, saveForLater, moveToCart } = useCartStore();
  const { formatPrice } = useSettings();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 39 ? 0 : 4.99;
  const total = subtotal - couponDiscount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const result = await couponService.apply(couponCode, subtotal);
      if (result.discount > 0) {
        setCouponDiscount(result.discount);
        setAppliedCoupon(couponCode);
        toast.success(`Coupon applied! You saved ${formatPrice(result.discount)}`);
      } else {
        toast.error(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0 && savedForLater.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Your cart is empty</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't added anything yet</p>
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
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Shopping Cart ({items.length} items)</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <img 
                    src={item.image || 'https://picsum.photos/seed/' + item.id + '/96/96'} 
                    alt={item.name} 
                    className="w-24 h-24 object-cover rounded" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/96/96';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.brand || 'Fashion Brand'}</p>
                    {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                    {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        className="border rounded-lg px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                      >
                        {[1, 2, 3, 4, 5].map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => saveForLater(item.id)}
                        className="text-sm text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
                      >
                        <Heart className="w-4 h-4" /> Save for later
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                    {item.oldPrice && (
                      <p className="text-sm text-gray-400 line-through">{formatPrice(item.oldPrice * item.quantity)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Saved for Later */}
            {savedForLater.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Saved for Later ({savedForLater.length})</h2>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                  {savedForLater.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <img 
                        src={item.image || 'https://picsum.photos/seed/' + item.id + '/80/80'} 
                        alt={item.name} 
                        className="w-20 h-20 object-cover rounded" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/80/80';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold dark:text-white">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.brand || 'Fashion Brand'}</p>
                        <button
                          onClick={() => moveToCart(item.id)}
                          className="text-sm text-pink-600 hover:underline mt-2 transition"
                        >
                          Move to cart
                        </button>
                      </div>
                      <p className="font-semibold dark:text-white">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 sticky top-24 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Order Summary</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="dark:text-white">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2 border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="dark:text-white">Total</span>
                    <span className="text-pink-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Coupon Input */}
              <div className="mt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Coupon applied: <strong>{appliedCoupon}</strong>
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 p-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-4 bg-pink-600 text-white py-3 rounded-full font-semibold hover:bg-pink-700 transition flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                Free shipping on orders over £39
              </p>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>Visa</span>
                  <span>•</span>
                  <span>Mastercard</span>
                  <span>•</span>
                  <span>Amex</span>
                  <span>•</span>
                  <span>PayPal</span>
                  <span>•</span>
                  <span>Apple Pay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;