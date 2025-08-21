import React, { useState, useEffect } from 'react';
import AutonomousNavigation from '../components/AutonomousNavigation';
import AutonomousTestStack from '../components/AutonomousTestStack';

interface AutonomousTestPageProps {
  title?: string;
}

const AutonomousTestPage: React.FC<AutonomousTestPageProps> = ({ 
  title = "Autonomous Test Page" 
}) => {
  return (
    <div className="autonomous-test-page">
      <AutonomousNavigation />
      <div className="content">
        <h1>{title}</h1>
        <AutonomousTestStack />
      </div>
    </div>
  );
};

export default AutonomousTestPage;