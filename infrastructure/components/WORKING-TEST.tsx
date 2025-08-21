// WORKING-TEST.tsx - Tool Enforcement Verification
// Created by Zara for Sandra's SSELFIE Platform

import React from 'react';

interface WorkingTestProps {
  message?: string;
}

export const WorkingTest: React.FC<WorkingTestProps> = ({ 
  message = "Tool Enforcement Verified"
}) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">
        {message}
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        Zara successfully created this file using str_replace_based_edit_tool
      </p>
    </div>
  );
};

export default WorkingTest;