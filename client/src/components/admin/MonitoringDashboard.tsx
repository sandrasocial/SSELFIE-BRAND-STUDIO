import { FC } from 'react';
export const MonitoringDashboard: FC = () => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div className="col-span-full">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-semibold mb-4">
            System Performance Dashboard
          </h2>
        </div>
      </div>
      
      {/* System Stats */}
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
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-3">Agent Performance</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Active Agents</span>
            <span className="text-blue-600">5</span>
          </div>
          <div className="flex justify-between">
            <span>Response Time</span>
            <span className="text-green-600">Fast</span>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="col-span-full md:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-3">Resource Usage</h3>
        <p className="text-gray-600">System performance monitoring dashboard</p>
      </div>
    </div>
  );
};