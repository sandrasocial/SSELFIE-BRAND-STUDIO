import React from 'react';

interface LuxuryHeadingProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LuxuryHeading: React.FC<LuxuryHeadingProps> = ({ 
  children, 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-lg md:text-xl',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
    xl: 'text-3xl md:text-4xl'
  };

  return (
    <h2 
      className={`
        font-['Times_New_Roman'] 
        leading-tight 
        tracking-[-0.01em]
        text-luxury-black
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </h2>
  );
};

interface EditorialTextProps {
  children: React.ReactNode;
  variant?: 'body' | 'caption' | 'detail';
  className?: string; 
}

export const EditorialText: React.FC<EditorialTextProps> = ({
  children,
  variant = 'body',
  className = ''
}) => {
  const variantClasses = {
    body: 'text-base leading-relaxed',
    caption: 'text-sm leading-snug',
    detail: 'text-xs uppercase tracking-widest'
  };

  return (
    <p 
      className={`
        font-['Times_New_Roman']
        text-luxury-black
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </p>
  );
};

interface EditorialDividerProps {
  className?: string;
}

export const EditorialDivider: React.FC<EditorialDividerProps> = ({
  className = ''
}) => {
  return (
    <hr 
      className={`
        border-t
        border-accent-line
        my-8
        ${className}
      `}
    />
  );
};

interface EditorialContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const EditorialContainer: React.FC<EditorialContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div 
      className={`
        max-w-4xl
        mx-auto
        px-4
        md:px-8
        py-12
        md:py-16
        bg-pure-white
        ${className}
      `}
    >
      {children}
    </div>
  );
};