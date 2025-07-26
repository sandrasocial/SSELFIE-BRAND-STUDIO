import React from 'react';
import { motion } from 'framer-motion';

interface WorkflowValidationProps {
  status: 'pending' | 'success' | 'error';
  message?: string;
  onRetry?: () => void;
}

export const WorkflowValidation: React.FC<WorkflowValidationProps> = ({
  status,
  message = '',
  onRetry
}) => {
  const statusStyles = {
    pending: 'text-gray-600',
    success: 'text-emerald-600',
    error: 'text-red-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto my-8 p-6 bg-white/80 backdrop-blur-sm border border-gray-200"
    >
      <div className="flex flex-col items-center space-y-4">
        <div className={`font-serif text-2xl ${statusStyles[status]}`}>
          {status === 'pending' && 'Validating Workflow...'}
          {status === 'success' && 'Workflow Validated'}
          {status === 'error' && 'Validation Error'}
        </div>
        
        {message && (
          <p className="font-serif text-gray-700 text-center">
            {message}
          </p>
        )}

        {status === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-black text-white font-serif hover:bg-gray-800 transition-colors"
          >
            Retry Validation
          </button>
        )}

        <div className="w-full border-t border-gray-200 my-4" />

        <div className="grid grid-cols-3 gap-4 w-full text-center">
          <div className="flex flex-col items-center">
            <span className="font-serif text-sm text-gray-500">Stage</span>
            <span className="font-serif text-lg">
              {status === 'pending' ? '...' : '1/3'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-serif text-sm text-gray-500">Time</span>
            <span className="font-serif text-lg">
              {status === 'pending' ? '...' : '2m'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-serif text-sm text-gray-500">Status</span>
            <span className={`font-serif text-lg ${statusStyles[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};