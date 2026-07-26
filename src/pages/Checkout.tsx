import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useSettings } from '../context/SettingsContext';
import { couponService } from '../services/couponService';
import { emailService } from '../services/emailService';
import { orderService } from '../services/orderService';
import { 
  Truck, Shield, CreditCard, MapPin, ArrowRight, User, Mail, 
  Phone, Home, Building, Check, Lock, Clock, Smartphone, 
  Wallet, Banknote, Apple, Zap, Tag, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user, isAuthenticated, register } = useAuthStore();
  const { formatPrice } = useSettings();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Kingdom',
  });
  
  const [billingAddress, setBillingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Kingdom',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderNotes, setOrderNotes] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  // Load coupon from localStorage
  useEffect(() => {
    const savedCoupon = localStorage.getItem('applied_coupon');
    if (savedCoupon) {
      try {
        const { code, discount } = JSON.parse(savedCoupon);
        setAppliedCoupon(code);
        setCouponDiscount(discount);
        setCouponCode(code);
      } catch (e) {
        console.error('Error loading coupon:', e);
      }
    }
  }, []);

  // Save cart items to session storage before checkout
  useEffect(() => {
    if (items.length > 0) {
      sessionStorage.setItem('checkout_items', JSON.stringify(items));
    }
  }, [items]);

  // Redirect if cart is empty AND no order was just placed
  useEffect(() => {
    if (!orderPlaced && items.length === 0) {
      const savedItems = sessionStorage.getItem('checkout_items');
      if (savedItems && JSON.parse(savedItems).length > 0) {
        return;
      }
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [items.length, navigate, orderPlaced]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 39 ? 0 : 4.99;
  const tax = (subtotal - couponDiscount + shippingCost) * 0.2;
  const finalTotal = subtotal - couponDiscount + shippingCost + tax;

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const result = await couponService.apply(couponCode.toUpperCase(), subtotal);
      if (result.discount > 0) {
        setCouponDiscount(result.discount);
        setAppliedCoupon(couponCode.toUpperCase());
        localStorage.setItem('applied_coupon', JSON.stringify({ 
          code: couponCode.toUpperCase(), 
          discount: result.discount 
        }));
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
    localStorage.removeItem('applied_coupon');
    toast.success('Coupon removed');
  };

  const handleCreateAccount = async () => {
    if (!createAccount || isAuthenticated) return;
    
    try {
      await register(shippingAddress.email, accountPassword, {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
      });
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      toast.error('Failed to create account. Please try again.');
      return false;
    }
  };

  // ✅ UPDATED: Save order to database via API
  const handlePlaceOrder = async () => {
    if (isProcessing) return;
    
    // Validate shipping address
    if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.email || 
        !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) {
      toast.error('Please fill in all shipping address fields');
      return;
    }
    
    // Validate billing address if different
    if (!sameAsShipping) {
      if (!billingAddress.firstName || !billingAddress.lastName || !billingAddress.email || 
          !billingAddress.addressLine1 || !billingAddress.city || !billingAddress.postalCode) {
        toast.error('Please fill in all billing address fields');
        return;
      }
    }
    
    // Validate terms
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    
    // Validate password if creating account
    if (createAccount && !isAuthenticated && accountPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    // Validate card details if paying by card
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
      if (cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid card number');
        return;
      }
      if (cardDetails.cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return;
      }
    }
    
    setIsProcessing(true);
    
    // Create account if requested
    let accountCreated = false;
    let userId = user?.id || null;
    
    if (createAccount && !isAuthenticated) {
      try {
        const registerResult = await register(shippingAddress.email, accountPassword, {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
        });
        if (registerResult) {
          accountCreated = true;
          // Get the new user ID from auth store after registration
          const authState = useAuthStore.getState();
          if (authState.user) {
            userId = authState.user.id;
          }
          toast.success('Account created successfully!');
        } else {
          toast.error('Failed to create account. Please try again.');
          setIsProcessing(false);
          return;
        }
      } catch (error) {
        toast.error('Failed to create account. Please try again.');
        setIsProcessing(false);
        return;
      }
    }
    
    // ✅ Prepare order data for API
    const orderData = {
      userId: userId,
      isGuest: !isAuthenticated && !accountCreated,
      guestEmail: !isAuthenticated && !accountCreated ? shippingAddress.email : undefined,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
        size: item.size || '',
        color: item.color || '',
      })),
      subtotal: subtotal,
      shipping: shippingCost,
      tax: tax,
      discount: couponDiscount,
      couponCode: appliedCoupon || undefined,
      total: finalTotal,
      status: 'pending',
      shippingAddress: { ...shippingAddress },
      billingAddress: sameAsShipping ? { ...shippingAddress } : { ...billingAddress },
      paymentMethod: paymentMethod,
      paymentStatus: 'pending',
      notes: orderNotes || undefined,
    };

    try {
      // ✅ Save order to database via API
      const savedOrder = await orderService.create(orderData);
      
      console.log('✅ Order saved to database:', savedOrder);
      
      // Also save to localStorage for backward compatibility
      try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.unshift({
          ...savedOrder,
          id: savedOrder.id,
          orderNumber: savedOrder.orderNumber,
          createdAt: savedOrder.createdAt,
          updatedAt: savedOrder.updatedAt,
        });
        localStorage.setItem('orders', JSON.stringify(orders));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      
      sessionStorage.removeItem('checkout_items');
      localStorage.removeItem('applied_coupon');
      setOrderPlaced(true);
      clearCart();
      
      toast.success('Order placed successfully!');
      
      // Send order confirmation email
      try {
        await emailService.sendOrderConfirmation(
          savedOrder.id,
          shippingAddress.email,
          {
            date: new Date(),
            total: finalTotal,
            paymentMethod: paymentMethod,
            items: items.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          }
        );
        console.log('📧 Order confirmation email sent to', shippingAddress.email);
      } catch (error) {
        console.error('Failed to send order confirmation email:', error);
        // Don't block the order process if email fails
      }
      
      // Navigate to confirmation
      navigate(`/order-confirmation/${savedOrder.id}`);
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const goToStep = (newStep: number) => {
    setStep(newStep);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s/g, '').replace(/\D/g, '');
    const matches = v.match(/.{1,4}/g);
    return matches ? matches.join(' ') : v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardDetails({ ...cardDetails, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    setCardDetails({ ...cardDetails, expiryDate: value });
  };

  // Show loading if cart is empty and no order placed yet
  if (!orderPlaced && items.length === 0) {
    const savedItems = sessionStorage.getItem('checkout_items');
    if (!savedItems) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Redirecting to cart...</p>
          </div>
        </div>
      );
    }
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 dark:text-white">Checkout ({items.length} items)</h1>
          
          {/* Guest Checkout Banner */}
          {!isAuthenticated && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <User className="w-4 h-4 inline mr-2" />
                    You're checking out as a guest.
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Create an account to track orders and earn rewards
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-sm text-pink-600 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      className="w-4 h-4 rounded border-blue-300"
                    />
                    Create account
                  </label>
                </div>
              </div>
              {createAccount && !isAuthenticated && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <input
                      type="password"
                      placeholder="Create password (min 6 characters) *"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Steps */}
          <div className="flex mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1">
                <div className={`flex items-center ${s === step ? 'text-pink-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    s === step ? 'border-pink-600 bg-pink-50 dark:bg-pink-950/20' : 'border-gray-300'
                  }`}>
                    {s}
                  </div>
                  <div className="ml-2 text-sm font-medium hidden sm:block">
                    {s === 1 && 'Shipping'}
                    {s === 2 && 'Billing'}
                    {s === 3 && 'Payment'}
                    {s === 4 && 'Review'}
                  </div>
                  {s < 4 && <div className="flex-1 h-px bg-gray-200 mx-4" />}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {step === 1 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name *"
                        value={shippingAddress.firstName}
                        onChange={handleShippingChange}
                        className="w-full pl-9 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name *"
                      value={shippingAddress.lastName}
                      onChange={handleShippingChange}
                      className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      required
                    />
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email *"
                        value={shippingAddress.email}
                        onChange={handleShippingChange}
                        className="w-full pl-9 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={shippingAddress.phone}
                        onChange={handleShippingChange}
                        className="w-full pl-9 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                    <div className="relative md:col-span-2">
                      <Home className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="addressLine1"
                        placeholder="Address Line 1 *"
                        value={shippingAddress.addressLine1}
                        onChange={handleShippingChange}
                        className="w-full pl-9 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      name="addressLine2"
                      placeholder="Address Line 2 (Optional)"
                      value={shippingAddress.addressLine2}
                      onChange={handleShippingChange}
                      className="md:col-span-2 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City *"
                      value={shippingAddress.city}
                      onChange={handleShippingChange}
                      className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      required
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State/Province"
                      value={shippingAddress.state}
                      onChange={handleShippingChange}
                      className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="Postal Code *"
                      value={shippingAddress.postalCode}
                      onChange={handleShippingChange}
                      className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      required
                    />
                    <select
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleShippingChange}
                      className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                    </select>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => goToStep(2)}
                      className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 transition"
                    >
                      Continue to Billing →
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" /> Billing Address
                  </h2>
                  
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Same as shipping address</span>
                  </label>

                  {!sameAsShipping && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name *"
                        value={billingAddress.firstName}
                        onChange={handleBillingChange}
                        className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name *"
                        value={billingAddress.lastName}
                        onChange={handleBillingChange}
                        className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email *"
                        value={billingAddress.email}
                        onChange={handleBillingChange}
                        className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={billingAddress.phone}
                        onChange={handleBillingChange}
                        className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      />
                      <input
                        type="text"
                        name="addressLine1"
                        placeholder="Address Line 1 *"
                        value={billingAddress.addressLine1}
                        onChange={handleBillingChange}
                        className="md:col-span-2 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      />
                      <input
                        type="text"
                        name="addressLine2"
                        placeholder="Address Line 2 (Optional)"
                        value={billingAddress.addressLine2}
                        onChange={handleBillingChange}
                        className="md:col-span-2 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      />
                      <input
                        type="text"
                        name="city"
                        placeholder="City *"
                        value={billingAddress.city}
                        onChange={handleBillingChange}
                        className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State/Province"
                        value={billingAddress.state}
                        onChange={handleBillingChange}
                        className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      />
                      <input
                        type="text"
                        name="postalCode"
                        placeholder="Postal Code *"
                        value={billingAddress.postalCode}
                        onChange={handleBillingChange}
                        className="p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => goToStep(1)}
                      className="px-6 py-2 border rounded-full font-semibold hover:bg-gray-50 transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => goToStep(3)}
                      className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 transition"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Payment Method
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      paymentMethod === 'card' ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/20' : ''
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <CreditCard className="w-5 h-5" />
                      <span className="text-sm">Card</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      paymentMethod === 'apple_pay' ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/20' : ''
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="apple_pay"
                        checked={paymentMethod === 'apple_pay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <Apple className="w-5 h-5" />
                      <span className="text-sm">Apple Pay</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      paymentMethod === 'google_pay' ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/20' : ''
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="google_pay"
                        checked={paymentMethod === 'google_pay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <Smartphone className="w-5 h-5" />
                      <span className="text-sm">Google Pay</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      paymentMethod === 'paypal' ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/20' : ''
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="font-semibold text-blue-600 text-sm">PayPal</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      paymentMethod === 'zelle' ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/20' : ''
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="zelle"
                        checked={paymentMethod === 'zelle'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <Zap className="w-5 h-5 text-purple-600" />
                      <span className="text-sm">Zelle</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      paymentMethod === 'klarna' ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/20' : ''
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="klarna"
                        checked={paymentMethod === 'klarna'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="font-semibold text-pink-600 text-sm">Klarna</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 col-span-1 sm:col-span-2 ${
                      paymentMethod === 'afterpay' ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/20' : ''
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="afterpay"
                        checked={paymentMethod === 'afterpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <Wallet className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-semibold text-teal-600">Afterpay</span>
                      <span className="text-xs text-gray-500">Pay in 4 installments</span>
                    </label>
                  </div>

                  {/* Card Details Form */}
                  {paymentMethod === 'card' && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="text-sm font-semibold mb-3">Card Details</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Card Number"
                          value={cardDetails.cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        />
                        <input
                          type="text"
                          placeholder="Name on Card"
                          value={cardDetails.cardName}
                          onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiryDate}
                            onChange={handleExpiryChange}
                            maxLength={5}
                            className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          />
                          <input
                            type="password"
                            placeholder="CVV"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                            maxLength={4}
                            className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment method specific messages */}
                  {paymentMethod !== 'card' && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        You will be redirected to complete your payment securely.
                      </p>
                    </div>
                  )}

                  {/* Order Notes */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Special instructions for delivery..."
                      className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => goToStep(2)}
                      className="px-6 py-2 border rounded-full font-semibold hover:bg-gray-50 transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => goToStep(4)}
                      className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 transition"
                    >
                      Review Order →
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-semibold mb-4">Review Your Order</h2>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <img 
                          src={item.image || 'https://picsum.photos/seed/' + item.id + '/64/64'} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/64/64';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium dark:text-white">{item.name}</h3>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                          {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                        </div>
                        <p className="font-semibold dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Section in Review */}
                  {appliedCoupon && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Coupon applied: <strong>{appliedCoupon}</strong>
                        <span className="text-xs">(-{formatPrice(couponDiscount)})</span>
                      </span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Payment method summary */}
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm flex items-center gap-2">
                      <span className="text-gray-600">Payment:</span>
                      <span className="font-medium capitalize">
                        {paymentMethod === 'card' ? 'Credit/Debit Card' : 
                         paymentMethod === 'apple_pay' ? 'Apple Pay' :
                         paymentMethod === 'google_pay' ? 'Google Pay' :
                         paymentMethod === 'paypal' ? 'PayPal' :
                         paymentMethod === 'zelle' ? 'Zelle' :
                         paymentMethod === 'klarna' ? 'Klarna' :
                         paymentMethod === 'afterpay' ? 'Afterpay' : 'Card'}
                      </span>
                    </p>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="w-4 h-4 mt-1"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        I agree to the{' '}
                        <a href="/terms" className="text-pink-600 hover:underline">Terms & Conditions</a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-pink-600 hover:underline">Privacy Policy</a>
                      </span>
                    </label>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => goToStep(3)}
                      className="px-6 py-2 border rounded-full font-semibold hover:bg-gray-50 transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || !acceptTerms}
                      className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          Place Order <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-96">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 sticky top-24 border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Order Summary</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal ({items.length} items)</span>
                    <span className="dark:text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="dark:text-white">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax (20%)</span>
                    <span className="dark:text-white">{formatPrice(tax)}</span>
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
                      <span className="text-pink-600">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Coupon Input in Sidebar */}
                {!appliedCoupon && (
                  <div className="mt-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 p-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout</span>
                    <Truck className="w-4 h-4 ml-2" />
                    <span>Free returns</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>SSL Encrypted</span>
                    <Check className="w-4 h-4 text-green-500 ml-2" />
                    <span>PCI Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Estimated delivery: 3-5 business days</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Visa • Mastercard • Amex • PayPal • Apple Pay • Google Pay • Zelle • Klarna
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;