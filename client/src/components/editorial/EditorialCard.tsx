import React from 'react';

interface EditorialCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EditorialCard({ 
  children, 
  variant = 'default',
  padding = 'lg',
  className = '' 
}: EditorialCardProps) {
  const baseClasses = 'transition-all duration-300 ease-sophisticated';
  
  const variantClasses = {
    default: 'bg-gradient-to-br from-neutral-800/30 to-neutral-900/30 rounded-4xl border border-neutral-700/20',
    elevated: 'bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 rounded-4xl border border-neutral-700/30 shadow-editorial',
    glass: 'editorial-glass rounded-4xl shadow-editorial-lg'
  };
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}