import React from 'react';

interface AutoRefreshTestProps {
  message?: string;
}

export const AutoRefreshTest: React.FC<AutoRefreshTestProps> = ({ 
  message = "Auto-refresh system test component" 
}) => {
  return (
    <div className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg">
      <h2 style={{ fontFamily: 'Times New Roman, serif' }} className="text-2xl font-bold mb-4">
        Visual Editor Auto-Refresh Test
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {message}
      </p>
      <div className="text-sm text-gray-500">
        Created at: {new Date().toISOString()}
      </div>
      <div className="text-sm text-gray-500">
        This component tests if the Visual Editor automatically refreshes when agents create files.
      </div>
    </div>
  );
};

export default AutoRefreshTest;