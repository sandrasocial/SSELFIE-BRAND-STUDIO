import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const LuxuryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`luxury-button ${variant}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

LuxuryButton.displayName = 'LuxuryButton';

export default LuxuryButton;