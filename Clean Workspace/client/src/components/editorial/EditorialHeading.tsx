import { FC, ReactNode } from 'react';
interface EditorialHeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
}

export const EditorialHeading: FC<EditorialHeadingProps> = ({
  children,
  level = 1,
  className = ''
}) => {
  const baseClasses = 'font-serif font-bold text-zinc-900 mb-6 leading-tight';
  
  const sizeClasses = {
    1: 'text-4xl md:text-5xl lg:text-6xl',
    2: 'text-3xl md:text-4xl lg:text-5xl',
    3: 'text-2xl md:text-3xl lg:text-4xl',
    4: 'text-xl md:text-2xl lg:text-3xl'
  };

  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Component className={`${baseClasses} ${sizeClasses[level]} ${className}`}>
      {children}
    </Component>
  );
}