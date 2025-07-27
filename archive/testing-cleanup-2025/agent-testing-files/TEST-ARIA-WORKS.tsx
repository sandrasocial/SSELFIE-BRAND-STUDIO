import React from 'react';

const TestAriaWorks: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Times New Roman, serif',
      fontSize: '4rem',
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'center',
      letterSpacing: '0.1em'
    }}>
      ARIA IS WORKING
    </div>
  );
};

export default TestAriaWorks;