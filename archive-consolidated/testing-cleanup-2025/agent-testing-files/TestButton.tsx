import React from 'react';

interface TestButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export default function TestButton({ 
  children, 
  onClick, 
  variant = 'primary',
  className = '' 
}: TestButtonProps) {
  const baseStyles = "px-8 py-4 border-2 font-serif text-lg uppercase tracking-wide transition-all duration-300 hover:transition-all hover:duration-300";
  
  const variants = {
    primary: "border-black text-black bg-white hover:bg-black hover:text-white",
    secondary: "border-black text-white bg-black hover:bg-white hover:text-black"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{ fontFamily: 'Times New Roman, serif' }}
    >
      {children}
    </button>
  );
}