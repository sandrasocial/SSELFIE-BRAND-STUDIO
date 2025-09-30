import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { StoneButton } from './StoneButton.js';

interface StoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  className?: string;
}

/**
 * Centralized Modal Component - Stone Color System
 * Based on app_v2 component patterns and APP-STYLEGUIDE
 * Follows sophisticated stone styling with proper backdrop
 */
export function StoneModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className = '',
  ...props
}: StoneModalProps) {
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // Size classes following APP-STYLEGUIDE spacing
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl', 
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };
  
  return (
    <div 
      className="fixed inset-0 bg-stone-950/95 backdrop-blur-lg flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        className={`bg-stone-50 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-stone-200">
            {title && (
              <h2 
                id="modal-title"
                className="text-xl font-light text-stone-900 tracking-wide" 
                style={{fontFamily: 'Times New Roman, serif'}}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default StoneModal;