import React, { useState } from 'react';

interface AdminTestButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const AdminTestButton: React.FC<AdminTestButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
}) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    onClick?.();
    setTimeout(() => setClicked(false), 200);
  };

  const getVariantClasses = () => {
    const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white focus:ring-purple-500 shadow-lg hover:shadow-xl`;
      case 'secondary':
        return `${baseClasses} bg-white border-2 border-gray-300 hover:border-purple-500 text-gray-700 hover:text-purple-600 focus:ring-purple-500`;
      case 'danger':
        return `${baseClasses} bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl`;
      default:
        return `${baseClasses} bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm rounded-md';
      case 'md':
        return 'px-4 py-2 text-base rounded-lg';
      case 'lg':
        return 'px-6 py-3 text-lg rounded-xl';
      default:
        return 'px-4 py-2 text-base rounded-lg';
    }
  };

  const buttonClasses = `
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${clicked ? 'transform scale-95' : ''}
    ${loading ? 'opacity-75' : ''}
    inline-flex items-center justify-center
    relative overflow-hidden
  `;

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          <span className="relative z-10">🚀 Admin Test Button</span>
          {variant === 'primary' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          )}
        </>
      )}
    </button>
  );
};

export default AdminTestButton;