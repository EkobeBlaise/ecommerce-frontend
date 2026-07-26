import React, { useState } from 'react';
import { Percent } from 'lucide-react';

interface CouponInputProps {
  onApply: (code: string, discount: number) => void;
}

export const CouponInput: React.FC<CouponInputProps> = ({ onApply }) => {
  const [code, setCode] = useState('');

  const handleApply = () => {
    if (code === 'SAVE10') {
      onApply(code, 10);
    } else if (code === 'SAVE20') {
      onApply(code, 20);
    } else {
      alert('Invalid coupon code');
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Coupon Code</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="flex-1 input"
        />
        <button onClick={handleApply} className="btn-secondary">
          Apply
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">Try: SAVE10 or SAVE20</p>
    </div>
  );
};
