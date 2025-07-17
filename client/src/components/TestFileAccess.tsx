import React from 'react';

const TestFileAccess: React.FC = () => {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Times New Roman, serif',
      backgroundColor: '#ffffff',
      color: '#0a0a0a',
      textAlign: 'center'
    }}>
      <button style={{
        padding: '20px 40px',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        border: 'none',
        fontFamily: 'Times New Roman, serif',
        fontSize: '18px',
        cursor: 'pointer',
        letterSpacing: '0.5px'
      }}>
        File Access Working!
      </button>
    </div>
  );
};

export default TestFileAccess;