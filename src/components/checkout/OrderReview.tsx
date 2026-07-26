import React from 'react';

interface OrderReviewProps {
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingData: any;
  paymentData: any;
  onBack: () => void;
  onSubmit: () => void;
}

export const OrderReview: React.FC<OrderReviewProps> = ({
  items,
  subtotal,
  shipping,
  tax,
  total,
  shippingData,
  paymentData,
  onBack,
  onSubmit
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Review Your Order</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Order Items</h3>
          <div className="space-y-2">
            {items.map((item: any) => (
              <div key={item.id} className="flex justify-between py-2 border-b">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500 ml-2">x {item.quantity}</span>
                </div>
                <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          <div className="text-gray-600">
            <p>{shippingData.firstName} {shippingData.lastName}</p>
            <p>{shippingData.address}</p>
            <p>{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
            <p>{shippingData.country}</p>
            <p>Email: {shippingData.email}</p>
            <p>Phone: {shippingData.phone}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Payment Method</h3>
          <p className="capitalize text-gray-600">{paymentData.method}</p>
        </div>
        
        <div className="border-t pt-4">
          <div className="space-y-2">
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
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 mt-6">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};
