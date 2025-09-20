import React from 'react';

interface EditorialButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function EditorialButton({ 
  variant = 'primary',
  size = 'md',
  children, 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  ...props 
}: EditorialButtonProps) {
  const baseClasses = 'editorial-headline font-light tracking-wide transition-all duration-300 ease-sophisticated rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-neutral-800/40 text-neutral-200 border border-neutral-700/30 hover:bg-neutral-800/60',
    ghost: 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30'
  };
  
  const sizeClasses = {
    sm: 'px-6 py-2 text-xs',
    md: 'px-8 py-4 text-sm',
    lg: 'px-10 py-5 text-base'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}