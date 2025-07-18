import React from 'react';

interface TestButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function TestButton({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick,
  disabled = false,
  className = ''
}: TestButtonProps) {
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
    font-weight: 300
    letter-spacing: -0.01em
    text-transform: uppercase
    transition-all duration-300
    cursor-pointer
    border-none
    outline-none
    focus:outline-none
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-black text-white
      hover:bg-gray-800
      active:bg-gray-900
    `,
    secondary: `
      bg-white text-black border border-black
      hover:bg-gray-50
      active:bg-gray-100
    `,
    outline: `
      bg-transparent text-black border border-black
      hover:bg-black hover:text-white
      active:bg-gray-900
    `
  };

  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </button>
  );
}