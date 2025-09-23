import { FC, ReactNode } from 'react';
interface EditorialTextProps {
  children: ReactNode;
  size?: 'sm' | 'base' | 'lg';
  weight?: 'normal' | 'medium' | 'bold';
  italic?: boolean;
  className?: string;
  variant?: string;
}

export const EditorialText: FC<EditorialTextProps> = ({
  children,
  size = 'base',
  weight = 'normal',
  italic = false,
  className = '',
  variant
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

  return (
    <p className={`
      font-serif
      ${sizeClasses[size]}
      ${weightClasses[weight]}
      ${italic ? 'italic' : ''}
      text-zinc-800
      leading-relaxed
      mb-6
      ${className}
    `}>
      {children}
    </p>
  );
}