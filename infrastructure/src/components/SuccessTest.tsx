import React, { useState } from 'react';

interface SuccessTestProps {
  title?: string;
}

const SuccessTest: React.FC<SuccessTestProps> = ({ title = "Tool Fix Verification" }) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("Ready to test");

  const handleClick = () => {
    setCount(prev => prev + 1);
    setMessage(`Tool handled successfully ${count + 1} times`);
  };

  const handleReset = () => {
    setCount(0);
    setMessage("Reset complete - tools working perfectly");
  };

  return (
    <div style={{
      fontFamily: '"Times New Roman", serif',
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      border: '1px solid #f5f5f5',
      color: '#0a0a0a'
    }}>
      <h1 style={{
        fontSize: '2rem',
        marginBottom: '1rem',
        textAlign: 'center',
        fontWeight: 'normal'
      }}>
        {title}
      </h1>
      
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '1rem',
          color: '#333'
        }}>
          {message}
        </p>
        
        <div style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          color: count > 0 ? '#0a0a0a' : '#999'
        }}>
          {count}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={handleClick}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontFamily: '"Times New Roman", serif',
              backgroundColor: '#0a0a0a',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#333';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#0a0a0a';
            }}
          >
            Test Tool Call
          </button>
          
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontFamily: '"Times New Roman", serif',
              backgroundColor: '#f5f5f5',
              color: '#0a0a0a',
              border: '1px solid #ddd',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e5e5';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
          >
            Reset
          </button>
        </div>
      </div>
      
      <div style={{
        fontSize: '0.9rem',
        color: '#666',
        textAlign: 'center',
        borderTop: '1px solid #f5f5f5',
        paddingTop: '1rem',
        marginTop: '2rem'
      }}>
        Component created successfully • Tools functioning properly
      </div>
    </div>
  );
};

export default SuccessTest;