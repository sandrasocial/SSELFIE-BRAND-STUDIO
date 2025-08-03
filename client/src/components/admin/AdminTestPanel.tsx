import React, { useState, useEffect } from 'react';

const AdminTestPanel: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString());
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 font-times">
          Admin Test Panel
        </h2>
        
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            🤖 Agent Identity
          </h3>
          <p className="text-gray-700 font-medium">
            Zara - Dev AI & Technical Mastermind
          </p>
          <p className="text-sm text-gray-600 mt-1">
            SSELFIE Studio's Luxury Code Architect
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            ⏰ Live Timestamp
          </h3>
          <p className="text-xl font-mono text-gray-900 font-bold">
            {currentTime}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            ✅ System Status
          </h3>
          <p className="text-green-700 font-medium">
            Admin Panel Active & Operational
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTestPanel;