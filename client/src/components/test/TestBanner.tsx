import React from 'react';

interface TestBannerProps {
  message?: string;
}

const TestBanner: React.FC<TestBannerProps> = ({ message = 'Luxury Test Banner' }) => {
  return (
    <div className="test-banner" style={{
      backgroundColor: '#f8f9fa',
      padding: '20px',
      margin: '10px 0',
      borderRadius: '4px',
      textAlign: 'center',
      fontFamily: 'Times New Roman, serif'
    }}>
      <h2>{message}</h2>
    </div>
  );
};

export default TestBanner;