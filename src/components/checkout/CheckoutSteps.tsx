import React from 'react';
import { Check } from 'lucide-react';

interface CheckoutStepsProps {
  currentStep: number;
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
  const steps = ['Shipping', 'Payment', 'Review'];

  return (
    <div className="flex justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index + 1 <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1 < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <span className="ml-2 text-sm font-medium">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-px bg-gray-200 mx-4" />
          )}
        </div>
      ))}
    </div>
  );
};
