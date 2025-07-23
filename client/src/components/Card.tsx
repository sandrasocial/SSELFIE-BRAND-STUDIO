import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'luxury';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200 rounded-lg',
    elevated: 'bg-white shadow-lg rounded-lg border border-gray-100',
    outlined: 'bg-transparent border-2 border-gray-300 rounded-lg',
    luxury: 'bg-gradient-to-b from-primary-50 to-white border border-accent-gold/20 rounded-lg shadow-xl'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        'transition-all duration-300 ease-in-out',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};