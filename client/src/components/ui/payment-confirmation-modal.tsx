import React, { useState } from 'react';

export interface PaymentConfirmationData {
  plan: string;
  amount: number;
  email: string;
  currency?: string;
}

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: PaymentConfirmationData;
  isProcessing?: boolean;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  data,
  isProcessing = false
}) => {
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

  if (!isOpen) return null;

  const formatAmount = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatPlanName = (plan: string) => {
    return plan.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-md w-full rounded-sm shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
          <h3 className="text-xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
            Confirm Your Purchase
          </h3>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-neutral-100">
              <span className="text-neutral-600 text-sm font-medium">Plan</span>
              <span className="text-black font-medium">{formatPlanName(data.plan)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-neutral-100">
              <span className="text-neutral-600 text-sm font-medium">Email</span>
              <span className="text-black text-sm">{data.email}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-neutral-100">
              <span className="text-neutral-600 text-sm font-medium">Amount</span>
              <span className="text-black font-medium text-lg">
                {formatAmount(data.amount, data.currency)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-neutral-600 text-sm font-medium">Billing</span>
              <span className="text-black text-sm">Monthly subscription</span>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAgreedToTerms}
                onChange={(e) => setHasAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-black border-neutral-300 rounded focus:ring-black focus:ring-2"
              />
              <span className="text-sm text-neutral-600 leading-relaxed">
                I agree to the{' '}
                <a 
                  href="/terms" 
                  target="_blank" 
                  className="text-black underline hover:no-underline"
                >
                  Terms of Service
                </a>
                {' '}and{' '}
                <a 
                  href="/privacy" 
                  target="_blank" 
                  className="text-black underline hover:no-underline"
                >
                  Privacy Policy
                </a>
                . I understand this is a recurring monthly subscription that can be cancelled anytime.
              </span>
            </label>
          </div>

          {/* Important Notice */}
          <div className="bg-neutral-50 p-4 rounded-sm mb-6">
            <div className="flex items-start space-x-2">
              <span className="text-lg">🔒</span>
              <div>
                <p className="text-sm text-neutral-700 font-medium mb-1">
                  Secure Payment
                </p>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Your payment is processed securely by Stripe. Your card information is never stored on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-neutral-50 px-6 py-4 flex space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 border border-neutral-300 text-neutral-700 px-4 py-2 text-sm font-medium uppercase tracking-wider hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!hasAgreedToTerms || isProcessing}
            className="flex-1 bg-black text-white px-4 py-2 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};