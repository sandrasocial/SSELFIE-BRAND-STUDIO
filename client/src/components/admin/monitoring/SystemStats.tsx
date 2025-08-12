import { FC } from 'react';
export const SystemStats: FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-3">System Stats</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Server Status</span>
          <span className="text-green-600">Online</span>
        </div>
        <div className="flex justify-between">
          <span>Build Status</span>
          <span className="text-green-600">Successful</span>
        </div>
        <div className="flex justify-between">
          <span>Database</span>
          <span className="text-green-600">Connected</span>
        </div>
      </div>
    </div>
  );
};