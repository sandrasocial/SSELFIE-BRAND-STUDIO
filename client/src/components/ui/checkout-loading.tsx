import * as React from 'react';
import { LuxuryLoading, LuxurySkeleton } from './luxury-loading-fixed.js';

interface CheckoutLoadingProps {
  variant?: 'processing' | 'validation' | 'skeleton';
}

export const CheckoutLoading: React.FC<CheckoutLoadingProps> = ({ 
  variant = 'processing' 
}) => {
  if (variant === 'skeleton') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded-sm w-2/3 mx-auto" />
        <div className="space-y-4">
          <div className="h-4 bg-neutral-200 rounded-sm w-full" />
          <div className="h-4 bg-neutral-200 rounded-sm w-3/4" />
          <div className="h-4 bg-neutral-200 rounded-sm w-5/6" />
        </div>
        <div className="h-12 bg-neutral-200 rounded-sm w-full" />
      </div>
    );
  }

  const loadingText = variant === 'validation' 
    ? 'Validating payment details...' 
    : 'Processing your payment...';

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <LuxuryLoading 
        variant="spinner" 
        size="lg" 
        className="mb-4" 
      />
      <div className="text-center">
        <p className="text-sm text-neutral-600 font-light tracking-wide uppercase">
          {loadingText}
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          This may take a few moments. Please don't close this window.
        </p>
      </div>
    </div>
  );
};

export function PaymentProgressIndicator({ 
  step 
}: { 
  step: 'validation' | 'processing' | 'complete';
}) {
  const steps = [
    { key: 'validation', label: 'Validating' },
    { key: 'processing', label: 'Processing' },
    { key: 'complete', label: 'Complete' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="flex items-center justify-center space-x-4 py-4">
      {steps.map((stepItem, index) => (
        <div key={stepItem.key} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
            ${index <= currentStepIndex 
              ? 'bg-black text-white' 
              : 'bg-neutral-200 text-neutral-500'
            }
            ${index === currentStepIndex ? 'animate-pulse' : ''}
          `}>
            {index + 1}
          </div>
          <span className={`
            ml-2 text-sm font-light
            ${index <= currentStepIndex ? 'text-black' : 'text-neutral-500'}
          `}>
            {stepItem.label}
          </span>
          {index < steps.length - 1 && (
            <div className={`
              ml-4 w-8 h-0.5
              ${index < currentStepIndex ? 'bg-black' : 'bg-neutral-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  );
};