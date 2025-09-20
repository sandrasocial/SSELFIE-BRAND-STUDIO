import React from 'react';

interface EditorialHeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export function EditorialHeading({ level = 1, children, className = '' }: EditorialHeadingProps) {
  const baseClasses = 'editorial-headline editorial-text-header';
  
  const levelClasses = {
    1: 'text-display-xl',
    2: 'text-display-lg',
    3: 'text-heading-1',
    4: 'text-heading-2',
    5: 'text-body-lg',
    6: 'text-body'
  };
  
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Component className={`${baseClasses} ${levelClasses[level]} ${className}`}>
      {children}
    </Component>
  );
}

interface EditorialTextProps {
  variant?: 'body' | 'caption' | 'small';
  children: React.ReactNode;
  className?: string;
}

export function EditorialText({ variant = 'body', children, className = '' }: EditorialTextProps) {
  const variantClasses = {
    body: 'editorial-text-body text-body',
    caption: 'editorial-text-caption text-caption',
    small: 'editorial-text-caption text-xs'
  };
  
  return (
    <p className={`editorial-body ${variantClasses[variant]} ${className}`}>
      {children}
    </p>
  );
}