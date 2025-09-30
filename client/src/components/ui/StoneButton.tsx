import React from 'react';

interface StoneButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Centralized Button Component - Stone Color System
 * Based on app_v2 ProfileScreen and SettingsScreen patterns
 * Follows APP-STYLEGUIDE specifications
 */
export function StoneButton({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick, 
  disabled = false, 
  className = '', 
  type = 'button',
  ...props 
}: StoneButtonProps) {
  
  // Base classes following stone system
  const baseClasses = "inline-flex items-center justify-center font-light tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-400/50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Variant styles per APP-STYLEGUIDE
  const variantClasses = {
    primary: "bg-stone-950 text-stone-50 hover:bg-stone-900 active:bg-stone-800 border border-stone-900",
    secondary: "bg-stone-100 text-stone-900 hover:bg-stone-200 active:bg-stone-300 border border-stone-300",
    ghost: "bg-transparent text-stone-700 hover:bg-stone-100 active:bg-stone-200 border border-stone-300 hover:border-stone-400"
  };
  
  // Size classes following 4px grid system
  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-lg",
    md: "px-4 py-3 text-base rounded-xl", 
    lg: "px-6 py-4 text-lg rounded-2xl"
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

export default StoneButton;