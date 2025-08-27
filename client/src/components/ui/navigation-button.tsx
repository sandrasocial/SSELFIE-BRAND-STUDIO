import React from 'react';

interface NavigationButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'back';
  disabled?: boolean;
  className?: string;
}

export function NavigationButton({ 
  children, 
  onClick, 
  href, 
  variant = 'primary', 
  disabled = false,
  className = '' 
}: NavigationButtonProps) {
  const baseStyles = `
    touch-manipulation
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 1.5vw, 8px);
    padding: clamp(12px, 3vw, 16px) clamp(24px, 6vw, 32px);
    min-height: 44px;
    font-size: clamp(10px, 2.5vw, 11px);
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid;
    transition: all 300ms ease;
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
    opacity: ${disabled ? '0.6' : '1'};
    user-select: none;
    -webkit-user-select: none;
  `;

  const variantStyles = {
    primary: `
      border-color: #ffffff;
      color: #0a0a0a;
      background: #ffffff;
    `,
    secondary: `
      border-color: #ffffff;
      color: #ffffff;
      background: transparent;
    `,
    back: `
      border-color: rgba(255, 255, 255, 0.3);
      color: rgba(255, 255, 255, 0.8);
      background: transparent;
      font-size: clamp(9px, 2vw, 10px);
      padding: clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px);
    `
  };

  const hoverStyles = {
    primary: {
      background: 'transparent',
      color: '#ffffff'
    },
    secondary: {
      background: '#ffffff',
      color: '#0a0a0a'
    },
    back: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff'
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    const target = e.target as HTMLElement;
    Object.assign(target.style, hoverStyles[variant]);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    const target = e.target as HTMLElement;
    // Reset to original styles based on variant
    if (variant === 'primary') {
      target.style.background = '#ffffff';
      target.style.color = '#0a0a0a';
    } else if (variant === 'secondary') {
      target.style.background = 'transparent';
      target.style.color = '#ffffff';
    } else if (variant === 'back') {
      target.style.background = 'transparent';
      target.style.color = 'rgba(255, 255, 255, 0.8)';
    }
  };

  const combinedStyle = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        style={{ 
          ...Object.fromEntries(
            combinedStyle
              .split(';')
              .map(s => s.trim())
              .filter(s => s)
              .map(s => {
                const [key, value] = s.split(':').map(s => s.trim());
                return [key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), value];
              })
          )
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="touch-manipulation"
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ 
        ...Object.fromEntries(
          combinedStyle
            .split(';')
            .map(s => s.trim())
            .filter(s => s)
            .map(s => {
              const [key, value] = s.split(':').map(s => s.trim());
              return [key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), value];
            })
        )
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className="touch-manipulation"
    >
      {children}
    </button>
  );
}