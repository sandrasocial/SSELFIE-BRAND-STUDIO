import React from 'react';
import { cn } from '@/lib/utils';
import { editorialClasses } from '@/styles/typography';

export interface TypographyProps {
  variant?: 'headline' | 'subheadline' | 'body' | 'caption' | 'quote' | 'accent';
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  children,
  className,
  as: Component = getDefaultComponent(variant),
  ...props
}) => {
  return (
    <Component
      className={cn(editorialClasses[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
};

function getDefaultComponent(variant: TypographyProps['variant']): keyof JSX.IntrinsicElements {
  switch (variant) {
    case 'headline':
      return 'h1';
    case 'subheadline':
      return 'h2';
    case 'caption':
      return 'span';
    case 'quote':
      return 'blockquote';
    case 'accent':
      return 'span';
    default:
      return 'p';
  }
}