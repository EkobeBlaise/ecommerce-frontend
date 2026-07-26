import React from 'react';

interface PriceBreakdownProps {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  subtotal,
  shipping,
  tax,
  discount,
  total
}) => {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Shipping</span>
        <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax (10%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>-${discount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-lg pt-2 border-t">
        <span>Total</span>
        <span className="text-blue-600">${total.toFixed(2)}</span>
      </div>
    </div>
  );
};
