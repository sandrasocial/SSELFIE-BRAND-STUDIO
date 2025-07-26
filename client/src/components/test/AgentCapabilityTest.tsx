import React from 'react';

interface AgentCapabilityTestProps {
  testName?: string;
}

const AgentCapabilityTest: React.FC<AgentCapabilityTestProps> = ({ 
  testName = "Agent Capability Test" 
}) => {
  const handleTestClick = () => {
    console.log('Agent capability test executed');
  };

  return (
    <div className="agent-capability-test">
      <h2>{testName}</h2>
      <div className="test-content">
        <p>This is a basic test component to verify agent capabilities.</p>
        <button 
          onClick={handleTestClick}
          className="test-button"
        >
          Run Test
        </button>
        <div className="test-results">
          <p>Status: Ready for testing</p>
          <p>Created: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AgentCapabilityTest;