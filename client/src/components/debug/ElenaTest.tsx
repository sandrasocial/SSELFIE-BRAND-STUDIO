import React from 'react';

interface ElenaTestProps {
  title?: string;
}

const ElenaTest: React.FC<ElenaTestProps> = ({ title = 'Debug Test Component' }) => {
  return (
    <div className="elena-test-container">
      <h2>{title}</h2>
      <div className="debug-content">
        <p>SSELFIE Studio Debug Component</p>
        <ul>
          <li>Luxury Brand Consistency Check</li>
          <li>Premium Positioning Validation</li>
          <li>Mobile Responsive Testing</li>
        </ul>
      </div>
    </div>
  );
};

export default ElenaTest;