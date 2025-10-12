import { FC, ReactNode } from 'react';
interface EditorialTextProps {
  children: ReactNode;
  size?: 'sm' | 'base' | 'lg';
  weight?: 'normal' | 'medium' | 'bold';
  italic?: boolean;
}

export const EditorialText: FC<EditorialTextProps> = ({
  children,
  size = 'base',
  weight = 'normal',
  italic = false
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
    `}>
      {children}
    </p>
  );
}