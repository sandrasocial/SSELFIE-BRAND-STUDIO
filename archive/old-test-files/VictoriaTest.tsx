import React from 'react';

interface VictoriaTestProps {
  title?: string;
}

const VictoriaTest: React.FC<VictoriaTestProps> = ({ title = "Victoria's Test Component" }) => {
  return (
    <div style={{
      fontFamily: 'Times New Roman, serif',
      color: '#0a0a0a',
      padding: '2rem',
      background: '#ffffff',
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'normal',
        marginBottom: '1.5rem',
      }}>
        {title}
      </h1>
      <p style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        fontSize: '1.125rem',
        lineHeight: '1.75',
        color: '#0a0a0a',
      }}>
        This is a test component created by Victoria, featuring Sandra's signature luxury editorial styling with Times New Roman headlines and minimal color palette.
      </p>
    </div>
  );
};

export default VictoriaTest;