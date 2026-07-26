// src/components/checkout/CheckoutForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { createOrder } from '../../services/orderService';
import toast from 'react-hot-toast';
import { CreditCard, Truck, MapPin, User } from 'lucide-react';

interface CheckoutFormData {
  // Shipping Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  
  // Billing Information
  same_as_shipping: boolean;
  billing_first_name?: string;
  billing_last_name?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip_code?: string;
  billing_country?: string;
  
  // Payment
  payment_method: 'card' | 'paypal' | 'cash_on_delivery';
  coupon_code?: string;
  
  // Card Details (if card payment)
  card_number?: string;
  card_expiry?: string;
  card_cvc?: string;
}

export const CheckoutForm: React.FC = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutFormData>({
    defaultValues: {
      same_as_shipping: true,
      payment_method: 'card',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
    }
  });
  
  const paymentMethod = watch('payment_method');
  const subtotal = getSubtotal();
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;
  
  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    
    try {
      const shippingAddress = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        country: data.country,
      };
      
      const billingAddress = data.same_as_shipping ? shippingAddress : {
        first_name: data.billing_first_name,
        last_name: data.billing_last_name,
        address: data.billing_address,
        city: data.billing_city,
        state: data.billing_state,
        zip_code: data.billing_zip_code,
        country: data.billing_country,
      };
      
      const orderData = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image,
        })),
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: data.payment_method,
        coupon_code: data.coupon_code,
        subtotal,
        shipping,
        tax,
        total,
      };
      
      const order = await createOrder(orderData);
      
      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Order failed:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Shipping Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  {...register('first_name', { required: 'First name is required' })}
                  className="input"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  {...register('last_name', { required: 'Last name is required' })}
                  className="input"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="input"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  {...register('phone', { required: 'Phone number is required' })}
                  className="input"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  {...register('address', { required: 'Address is required' })}
                  className="input"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  {...register('city', { required: 'City is required' })}
                  className="input"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  {...register('state', { required: 'State is required' })}
                  className="input"
                />
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  {...register('zip_code', { required: 'ZIP code is required' })}
                  className="input"
                />
                {errors.zip_code && (
                  <p className="text-red-500 text-xs mt-1">{errors.zip_code.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  {...register('country', { required: 'Country is required' })}
                  className="input"
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Billing Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Billing Information</h2>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-gray-700">Same as shipping address</span>
              </label>
            </div>
            
            {!sameAsShipping && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    {...register('billing_first_name', { 
                      required: !sameAsShipping ? 'First name is required' : false 
                    })}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    {...register('billing_last_name', { 
                      required: !sameAsShipping ? 'Last name is required' : false 
                    })}
                    className="input"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    {...register('billing_address', { 
                      required: !sameAsShipping ? 'Address is required' : false 
                    })}
                    className="input"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold">Payment Method</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="card"
                  {...register('payment_method')}
                  className="w-4 h-4 text-primary-600"
                />
                <label className="text-gray-700">Credit / Debit Card</label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="paypal"
                  {...register('payment_method')}
                  className="w-4 h-4 text-primary-600"
                />
                <label className="text-gray-700">PayPal</label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="cash_on_delivery"
                  {...register('payment_method')}
                  className="w-4 h-4 text-primary-600"
                />
                <label className="text-gray-700">Cash on Delivery</label>
              </div>
              
              {paymentMethod === 'card' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number *
                    </label>
                    <input
                      {...register('card_number')}
                      placeholder="1234 5678 9012 3456"
                      className="input"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date *
                      </label>
                      <input
                        {...register('card_expiry')}
                        placeholder="MM/YY"
                        className="input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVC *
                      </label>
                      <input
                        {...register('card_cvc')}
                        placeholder="123"
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Order Summary - 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-3">
                  <img
                    src={item.image || 'https://via.placeholder.com/60'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    <p className="text-primary-600 font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code
                </label>
                <div className="flex space-x-2">
                  <input
                    {...register('coupon_code')}
                    placeholder="Enter code"
                    className="input flex-1"
                  />
                  <button type="button" className="btn-secondary">
                    Apply
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isProcessing || items.length === 0}
              className="btn-primary w-full mt-6"
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              By placing your order, you agree to our Terms and Conditions
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};