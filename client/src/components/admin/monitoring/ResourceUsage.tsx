import { FC } from 'react';
export const ResourceUsage: FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-3">Resource Usage</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span>CPU Usage</span>
            <span>32%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: '32%'}}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span>Memory Usage</span>
            <span>45%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{width: '45%'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};