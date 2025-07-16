import React from 'react';

export default function AgentTestComponent() {
  return (
    <div className="bg-white p-6">
      <h3 className="text-xl mb-4">Agent Test Component</h3>
      <p className="text-gray-600">
        This component was created by the agent file system test on {new Date().toISOString()}
      </p>
      <div className="mt-4 text-sm text-green-600">
        ✅ If you can see this file, agents CAN create real files!
      </div>
    </div>
  );
}