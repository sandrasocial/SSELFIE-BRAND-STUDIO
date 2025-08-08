import React from 'react';

interface SimpleSuccessTestProps {
  message?: string;
  isVisible?: boolean;
}

const SimpleSuccessTest: React.FC<SimpleSuccessTestProps> = ({ 
  message = "Test completed successfully!", 
  isVisible = true 
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '4px',
      fontFamily: 'Times New Roman, serif',
      color: '#333'
    }}>
      <h2 style={{ 
        marginTop: 0, 
        marginBottom: '10px',
        color: '#000'
      }}>
        ✅ Success Test
      </h2>
      <p style={{ margin: 0 }}>
        {message}
      </p>
    </div>
  );
};

export default SimpleSuccessTest;