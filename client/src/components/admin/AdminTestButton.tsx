import React, { useState } from 'react';

interface AdminTestButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const AdminTestButton: React.FC<AdminTestButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  children = '🚀 Admin Test Button',
}) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (disabled || loading) return;
    
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
  `.trim();

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
          Processing...
        </div>
      ) : (
        <span className="relative z-10">{children}</span>
      )}
    </button>
  );
};

export default AdminTestButton;