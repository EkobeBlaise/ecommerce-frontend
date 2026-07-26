import React, { useState } from 'react';
import { CreditCard, Smartphone, Landmark, DollarSign, Zap, Truck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface PaymentFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, onBack }) => {
  const { settings } = useSettings();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  // Get only enabled payment methods
  const enabledMethods = Object.entries(settings.paymentMethods)
    .filter(([_, method]) => method.enabled)
    .map(([id, method]) => ({ id, ...method }));

  const getMethodIcon = (id: string) => {
    const icons: Record<string, JSX.Element> = {
      visa: <CreditCard className="w-5 h-5" />,
      mastercard: <CreditCard className="w-5 h-5" />,
      paypal: <DollarSign className="w-5 h-5" />,
      applePay: <Smartphone className="w-5 h-5" />,
      googlePay: <Smartphone className="w-5 h-5" />,
      klarna: <Zap className="w-5 h-5" />,
      afterpay: <Truck className="w-5 h-5" />,
      cod: <DollarSign className="w-5 h-5" />,
      bankTransfer: <Landmark className="w-5 h-5" />
    };
    return icons[id] || <CreditCard className="w-5 h-5" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    const selectedMethod = enabledMethods.find(m => m.id === paymentMethod);
    onSubmit({ 
      method: paymentMethod, 
      label: selectedMethod?.label,
      fee: selectedMethod?.fee || 0,
      details: paymentMethod === 'cod' ? null : cardDetails 
    });
  };

  const needsCardDetails = ['visa', 'mastercard', 'paypal'].includes(paymentMethod);

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Select Payment Method</h2>
      
      <div className="space-y-3 mb-6">
        {enabledMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${
              paymentMethod === method.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex items-center gap-2">
                {getMethodIcon(method.id)}
                <span className="font-medium dark:text-white">{method.label}</span>
              </div>
            </div>
            {method.fee > 0 && (
              <span className="text-xs text-gray-500">+{method.fee}% fee</span>
            )}
          </label>
        ))}
      </div>
      
      {/* Card Details Form (only for card payments) */}
      {needsCardDetails && paymentMethod && (
        <div className="space-y-4 border-t pt-4 dark:border-gray-700">
          <h3 className="font-semibold dark:text-white">Card Details</h3>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              value={cardDetails.number}
              onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">CVC</label>
              <input
                type="text"
                placeholder="123"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                value={cardDetails.cvc}
                onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name on Card</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              value={cardDetails.name}
              onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
              required
            />
          </div>
        </div>
      )}
      
      <div className="flex gap-4 mt-6">
        <button type="button" onClick={onBack} className="flex-1 px-6 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          Back
        </button>
        <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Review Order
        </button>
      </div>
    </form>
  );
};
