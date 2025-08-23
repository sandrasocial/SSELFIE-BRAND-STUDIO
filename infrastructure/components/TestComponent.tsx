import React, { useState } from 'react';

interface TestComponentProps {
  title?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ title = "Tool Test Component" }) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("Tools are working! 🎉");

  const handleClick = () => {
    setCount(prev => prev + 1);
    setMessage(`Button clicked ${count + 1} times!`);
  };

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '20px auto',
      textAlign: 'center',
      backgroundColor: '#f9f9f9'
    }}>
      <h2 style={{ color: '#333', marginBottom: '16px' }}>
        {title}
      </h2>
      
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '16px' }}>
        {message}
      </p>
      
      <button
        onClick={handleClick}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          fontSize: '16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '16px'
        }}
      >
        Click Me! (Count: {count})
      </button>
      
      <div style={{ fontSize: '14px', color: '#888' }}>
        <p>✅ Direct file system access confirmed</p>
        <p>✅ React component created successfully</p>
        <p>✅ TypeScript support active</p>
        <p>✅ Interactive state management working</p>
      </div>
    </div>
  );
};

export default TestComponent;