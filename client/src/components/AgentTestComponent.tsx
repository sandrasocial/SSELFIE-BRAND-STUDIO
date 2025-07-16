import React from 'react';

interface AgentTestComponentProps {
  message: string;
}

export const AgentTestComponent: React.FC<AgentTestComponentProps> = ({ message }) => {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900">Agent Test Component</h3>
      <p className="text-gray-600">{message}</p>
      <p className="text-xs text-gray-400 mt-2">
        Created by: AgentCodebaseIntegration System
      </p>
    </div>
  );
};

export default AgentTestComponent;
