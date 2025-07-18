`typescript
// client/src/components/TestButton.tsx
import React from 'react';

interface TestButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
}

export default function TestButton({ children = "Test Button", onClick }: TestButtonProps) {
  const handleClick = () => {
    console.log("Victoria's test button clicked - file writing confirmed!");
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className="test-button"
      style={{
        fontFamily: 'Times New Roman, serif',
        fontSize: '1.2rem',
        fontWeight: 200,
        textTransform: 'uppercase',
        letterSpacing: '-0.01em',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        border: 'none',
        padding: '16px 32px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
        e.currentTarget.style.color = '#0a0a0a';
        e.currentTarget.style.border = '1px solid #0a0a0a';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#0a0a0a';
        e.currentTarget.style.color = '#ffffff';
        e.currentTarget.style.border = 'none';
      }}
    >
      {children}
    </button>
  );
}