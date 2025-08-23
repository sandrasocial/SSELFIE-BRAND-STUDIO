import React from 'react';

interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
}) => {
  const baseStyles = `
    font-family: 'Times New Roman', serif
    font-weight: 400
    letter-spacing: 0.5px
    transition: all 0.3s ease
    border: none
    cursor: pointer
    text-align: center
    position: relative
    overflow: hidden
    text-transform: uppercase
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
  `.replace(/\s+/g, ' ').trim();

  const variants = {
    primary: `
      bg-black text-white
      hover:bg-gray-900
      active:bg-black
      shadow-lg hover:shadow-xl
    `,
    secondary: `
      bg-white text-black border-2 border-black
      hover:bg-gray-50
      active:bg-white
      shadow-md hover:shadow-lg
    `,
    outline: `
      bg-transparent text-black border border-black
      hover:bg-black hover:text-white
      active:bg-gray-900 active:text-white
    `
  };

  const sizes = {
    sm: 'px-6 py-2 text-sm min-h-[40px]',
    md: 'px-8 py-3 text-base min-h-[48px]',
    lg: 'px-12 py-4 text-lg min-h-[56px]'
  };

  const combinedClassName = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      <span className="relative z-10 tracking-wide">
        {children}
      </span>
      
      {/* Premium shine effect */}
      <div className={`
        absolute inset-0 
        bg-gradient-to-r from-transparent via-white/10 to-transparent
        transform -skew-x-12 -translate-x-full
        ${!disabled ? 'group-hover:translate-x-full' : ''}
        transition-transform duration-700 ease-out
        pointer-events-none
      `} />
    </button>
  );
};

// Usage examples for different contexts
export const PremiumButtonVariants = {
  // CTA Button for hero sections
  Hero: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <PremiumButton variant="primary" size="lg" onClick={onClick} fullWidth>
      {children}
    </PremiumButton>
  ),
  
  // Gallery navigation
  Gallery: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <PremiumButton variant="outline" size="md" onClick={onClick}>
      {children}
    </PremiumButton>
  ),
  
  // Form submissions
  Form: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <PremiumButton variant="secondary" size="md" type="submit" onClick={onClick} disabled={disabled}>
      {children}
    </PremiumButton>
  )
};

export default PremiumButton;