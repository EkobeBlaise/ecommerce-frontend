import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { CreditCard, Smartphone, Landmark, Truck, DollarSign, Zap, Check, X, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentMethodsManager: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [editingFee, setEditingFee] = useState<string | null>(null);
  const [feeValue, setFeeValue] = useState(0);

  const paymentMethodsList = [
    { id: 'visa', label: 'Visa / Mastercard', icon: <CreditCard className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600' },
    { id: 'mastercard', label: 'Mastercard', icon: <CreditCard className="w-6 h-6" />, color: 'bg-red-100 text-red-600' },
    { id: 'paypal', label: 'PayPal', icon: <DollarSign className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600' },
    { id: 'applePay', label: 'Apple Pay', icon: <Smartphone className="w-6 h-6" />, color: 'bg-gray-100 text-gray-600' },
    { id: 'googlePay', label: 'Google Pay', icon: <Smartphone className="w-6 h-6" />, color: 'bg-green-100 text-green-600' },
    { id: 'klarna', label: 'Klarna', icon: <Zap className="w-6 h-6" />, color: 'bg-pink-100 text-pink-600' },
    { id: 'afterpay', label: 'Afterpay', icon: <Truck className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600' },
    { id: 'cod', label: 'Cash on Delivery', icon: <DollarSign className="w-6 h-6" />, color: 'bg-green-100 text-green-600' },
    { id: 'bankTransfer', label: 'Bank Transfer', icon: <Landmark className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600' }
  ];

  const togglePaymentMethod = (methodId: string) => {
    const method = settings.paymentMethods[methodId as keyof typeof settings.paymentMethods];
    if (method) {
      updateSettings({
        ...settings,
        paymentMethods: {
          ...settings.paymentMethods,
          [methodId]: { ...method, enabled: !method.enabled }
        }
      });
      toast.success(`${method.label} ${!method.enabled ? 'enabled' : 'disabled'}`);
    }
  };

  const updateFee = (methodId: string, fee: number) => {
    const method = settings.paymentMethods[methodId as keyof typeof settings.paymentMethods];
    if (method) {
      updateSettings({
        ...settings,
        paymentMethods: {
          ...settings.paymentMethods,
          [methodId]: { ...method, fee }
        }
      });
      setEditingFee(null);
      toast.success(`Fee updated for ${method.label}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethodsList.map((method) => {
          const methodConfig = settings.paymentMethods[method.id as keyof typeof settings.paymentMethods];
          if (!methodConfig) return null;
          
          return (
            <div
              key={method.id}
              className={`border rounded-xl p-4 transition-all ${
                methodConfig.enabled 
                  ? 'bg-white dark:bg-gray-800 border-green-300 dark:border-green-700' 
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${method.color}`}>
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white">{methodConfig.label}</h3>
                    {methodConfig.fee > 0 && (
                      <p className="text-xs text-gray-500">+{methodConfig.fee}% transaction fee</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => togglePaymentMethod(method.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    methodConfig.enabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      methodConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
                <span className="text-sm text-gray-500">Transaction Fee</span>
                {editingFee === method.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={feeValue}
                      onChange={(e) => setFeeValue(parseFloat(e.target.value))}
                      className="w-20 px-2 py-1 border rounded text-sm dark:bg-gray-700"
                      step="0.5"
                      min="0"
                      max="10"
                    />
                    <span className="text-sm">%</span>
                    <button
                      onClick={() => updateFee(method.id, feeValue)}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingFee(null)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{methodConfig.fee}%</span>
                    <button
                      onClick={() => {
                        setEditingFee(method.id);
                        setFeeValue(methodConfig.fee);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          💡 Note: Only enabled payment methods will appear at checkout. You can also set transaction fees for each method.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodsManager;
