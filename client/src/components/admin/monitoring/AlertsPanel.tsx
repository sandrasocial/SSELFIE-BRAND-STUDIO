import { FC } from 'react';
export const AlertsPanel: FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-3">Alerts</h3>
      <div className="space-y-2">
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-sm text-green-800">All systems operational</div>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-sm text-blue-800">Build completed successfully</div>
        </div>
      </div>
    </div>
  );
};