import React from 'react';

export const LuxuryHeading = ({ 
  children,
  size = 'large',
  className = ''
}: {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) => {
  const sizeClasses = {
    small: 'text-xl md:text-2xl',
    medium: 'text-2xl md:text-3xl',
    large: 'text-3xl md:text-4xl lg:text-5xl'
  };

  return (
    <h1 className={`
      font-editorial 
      tracking-luxury
      text-luxury-black
      leading-tight
      ${sizeClasses[size]}
      ${className}
    `}>
      {children}
    </h1>
  );
};

export const EditorialText = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p className={`
      font-editorial
      text-soft-gray
      leading-relaxed
      text-lg
      ${className}
    `}>
      {children}
    </p>
  );
};

export const LuxuryCard = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`
      bg-pure-white
      border border-accent-line
      p-8 md:p-12
      ${className}
    `}>
      {children}
    </div>
  );
};

export const EditorialGrid = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`
      grid
      grid-cols-1
      md:grid-cols-2
      lg:grid-cols-3
      gap-8
      ${className}
    `}>
      {children}
    </div>
  );
};

export const LuxuryButton = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  [key: string]: any;
}) => {
  const variants = {
    primary: 'bg-luxury-black text-pure-white hover:bg-soft-gray',
    secondary: 'bg-transparent border border-luxury-black text-luxury-black hover:bg-editorial-gray'
  };

  return (
    <button
      className={`
        font-editorial
        px-8
        py-3
        tracking-luxury
        transition-colors
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export const EditorialDivider = ({
  className = ''
}: {
  className?: string;
}) => {
  return (
    <hr className={`
      border-0 
      border-t 
      border-accent-line
      my-12
      ${className}
    `} />
  );
};