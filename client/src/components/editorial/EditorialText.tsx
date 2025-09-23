import { FC, ReactNode } from 'react';

interface EditorialTextProps {
  children: ReactNode;
  size?: 'sm' | 'base' | 'lg';
  weight?: 'normal' | 'medium' | 'bold';
  italic?: boolean;
  variant?: 'body' | 'caption' | 'small';
  className?: string;
}

export const EditorialText: FC<EditorialTextProps> = ({
  children,
  size = 'base',
  weight = 'normal',
  italic = false,
  variant = 'body',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-sm md:text-base',
    base: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    bold: 'font-bold'
  };

  let variantClasses = '';
  if (variant === 'caption') {
    variantClasses = 'text-xs md:text-sm tracking-wider uppercase font-light mb-2';
  } else if (variant === 'small') {
    variantClasses = 'text-xs font-mono';
  } else {
    variantClasses = '';
  }
  return (
    <p className={`font-serif ${sizeClasses[size]} ${weightClasses[weight]} ${italic ? 'italic' : ''} text-zinc-800 leading-relaxed mb-6 ${variantClasses} ${className}`}>
      {children}
    </p>
  );
}