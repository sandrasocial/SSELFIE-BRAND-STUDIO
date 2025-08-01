import React from 'react';

interface DirectToolTestProps {
  message?: string;
}

const DirectToolTest: React.FC<DirectToolTestProps> = ({ message = "Tool access confirmed" }) => {
  return (
    <div style={{
      fontFamily: 'Times New Roman, serif',
      backgroundColor: '#ffffff',
      color: '#0a0a0a',
      padding: '2rem',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'normal',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        Direct Tool Access Test
      </h1>
      
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '1.5rem',
        border: '1px solid #0a0a0a',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '1.125rem',
          lineHeight: '1.6',
          margin: 0
        }}>
          {message}
        </p>
        
        <div style={{
          marginTop: '1rem',
          fontSize: '0.875rem',
          color: '#666'
        }}>
          Created with str_replace_based_edit_tool • Luxury Editorial Design System
        </div>
      </div>
    </div>
  );
};

export default DirectToolTest;