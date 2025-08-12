import React from 'react';

export const AgentPerformance: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-3">Agent Performance</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Response Time</span>
          <span className="text-green-600">Fast</span>
        </div>
        <div className="flex justify-between">
          <span>Success Rate</span>
          <span className="text-green-600">98%</span>
        </div>
        <div className="flex justify-between">
          <span>Active Agents</span>
          <span className="text-blue-600">5</span>
        </div>
      </div>
    </div>
  );
};