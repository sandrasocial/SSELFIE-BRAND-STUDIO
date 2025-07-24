// Standard component structure
import { FC } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  // specific props
}

export const ComponentName: FC<ComponentProps> = ({ 
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn("base-styles", className)}
      style={{ fontFamily: '"Times New Roman", serif' }}
    >
      {/* component content */}
    </div>
  );
};