import React from 'react';

export function MonitoringDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* System Status */}
      <div className="bg-gray-50 p-6 border border-gray-200">
        <h3 className="text-lg font-serif font-medium mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">API Services</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">HEALTHY</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Database</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">CONNECTED</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Agent System</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">ACTIVE</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Image Generation</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">MONITORING</span>
          </div>
        </div>
      </div>

      {/* User Metrics */}
      <div className="bg-gray-50 p-6 border border-gray-200">
        <h3 className="text-lg font-serif font-medium mb-4">User Activity</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Active Users</span>
            <span className="text-lg font-medium">127</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">New Signups Today</span>
            <span className="text-lg font-medium">8</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Premium Users</span>
            <span className="text-lg font-medium">23</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Training Sessions</span>
            <span className="text-lg font-medium">45</span>
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-gray-50 p-6 border border-gray-200">
        <h3 className="text-lg font-serif font-medium mb-4">Agent Performance</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Elena (Strategy)</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">OPTIMAL</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Zara (Technical)</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">OPTIMAL</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Maya (Photography)</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">OPTIMAL</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Response Time</span>
            <span className="text-lg font-medium">1.2s</span>
          </div>
        </div>
      </div>
    </div>
  );
}