import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'editorial';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  className = '',
  disabled = false,
  fullWidth = false,
}: ButtonProps) => {
  const baseStyles = 'font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-900 focus:ring-gray-500 border border-black',
    secondary: 'bg-white text-black border border-black hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-black hover:bg-gray-100 focus:ring-gray-500',
    editorial: 'bg-transparent text-black border-b border-black hover:border-gray-600 focus:ring-0 focus:ring-offset-0 rounded-none pb-1'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const editorialSize = variant === 'editorial' ? 'px-0 py-1 text-base' : sizes[size as keyof typeof sizes];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant as keyof typeof variants]}
        ${editorialSize}
        ${fullWidth ? 'w-full' : ''}
        ${variant === 'editorial' ? 'font-serif' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};