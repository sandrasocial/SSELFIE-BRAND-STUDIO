import React, { useState } from 'react';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const systemStats = {
    totalUsers: 1247,
    activeModels: 89,
    imagesGenerated: 15463,
    serverUptime: '99.8%'
  };

  const recentUsers = [
    { id: 1, email: 'user1@example.com', joinDate: '2024-01-15', status: 'active' },
    { id: 2, email: 'user2@example.com', joinDate: '2024-01-14', status: 'active' },
    { id: 3, email: 'user3@example.com', joinDate: '2024-01-13', status: 'pending' },
  ];

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'users', name: 'Users' },
    { id: 'models', name: 'AI Models' },
    { id: 'system', name: 'System' },
    { id: 'analytics', name: 'Analytics' }
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-times font-light text-black mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">
            Manage your SSELFIE platform and monitor system performance
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Users
                </h3>
                <p className="text-2xl font-light text-black mt-2">
                  {systemStats.totalUsers.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-white p-6 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Active Models
                </h3>
                <p className="text-2xl font-light text-black mt-2">
                  {systemStats.activeModels}
                </p>
              </div>
              
              <div className="bg-white p-6 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Images Generated
                </h3>
                <p className="text-2xl font-light text-black mt-2">
                  {systemStats.imagesGenerated.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-white p-6 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Server Uptime
                </h3>
                <p className="text-2xl font-light text-black mt-2">
                  {systemStats.serverUptime}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-medium text-black">Recent Users</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Join Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.joinDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-black hover:text-gray-600">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== 'overview' && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <h3 className="text-lg font-medium text-black mb-2">
              {tabs.find(t => t.id === activeTab)?.name} Panel
            </h3>
            <p className="text-gray-600">
              This section is under development. Advanced admin features coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;