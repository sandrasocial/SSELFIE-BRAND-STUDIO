import React, { useState, useEffect } from 'react';
import AutonomousNavigation from '../components/AutonomousNavigation';
import AutonomousTestStack from '../components/AutonomousTestStack';

interface AutonomousTestPageProps {
  title?: string;
}

const AutonomousTestPage: React.FC<AutonomousTestPageProps> = ({ title = "Autonomous Test" }) => {
  return (
    <div className="autonomous-test-page">
      <AutonomousNavigation />
      <main className="main-content">
        <h1>{title}</h1>
        <AutonomousTestStack />
      </main>
    </div>
  );
};

export default AutonomousTestPage;