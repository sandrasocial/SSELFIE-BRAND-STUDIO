import React from 'react';

// Luxury editorial heading component
export const EditorialHeading: React.FC<{
  children: React.ReactNode;
  size?: 'lg' | 'xl' | '2xl' | '3xl';
  align?: 'left' | 'center' | 'right';
}> = ({ children, size = '2xl', align = 'left' }) => {
  const sizeClasses = {
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
    '3xl': 'text-3xl md:text-4xl'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <h2 className={`font-times-new-roman ${sizeClasses[size]} ${alignClasses[align]} font-normal tracking-tight text-gray-900 dark:text-gray-100 mb-6`}>
      {children}
    </h2>
  );
}