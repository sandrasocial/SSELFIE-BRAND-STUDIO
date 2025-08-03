import React from 'react';

interface TestAgentFixProps {
  message?: string;
}

const TestAgentFix: React.FC<TestAgentFixProps> = ({ message = "Agent Fix Test Component" }) => {
  const handleClick = () => {
    console.log('TestAgentFix component clicked!');
  };

  return (
    <div className="test-agent-fix">
      <h2>TestAgentFix Component</h2>
      <p>{message}</p>
      <button onClick={handleClick} className="test-button">
        Click me to test
      </button>
      <div className="test-info">
        <p>This is a simple test component to verify functionality.</p>
        <p>Status: ✅ Component rendered successfully</p>
      </div>
      
      <style>{`
        .test-agent-fix {
          padding: 20px;
          border: 2px solid #007acc;
          border-radius: 8px;
          margin: 20px;
          background-color: #f5f5f5;
          font-family: Arial, sans-serif;
        }
        
        .test-button {
          background-color: #007acc;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin: 10px 0;
        }
        
        .test-button:hover {
          background-color: #005999;
        }
        
        .test-info {
          margin-top: 15px;
          padding: 10px;
          background-color: #e8f4f8;
          border-radius: 4px;
        }
        
        .test-info p {
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
};

export default TestAgentFix;