import React, { useState } from 'react';

const AgentActivity: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  const agents = [
    {
      id: 'sandra',
      name: 'Sandra',
      role: 'Business Strategist',
      status: 'active',
      lastActive: '2 minutes ago',
      tasksCompleted: 23,
      performance: 98
    },
    {
      id: 'zara',
      name: 'Zara',
      role: 'Technical Architect',
      status: 'active',
      lastActive: '5 minutes ago',
      tasksCompleted: 18,
      performance: 96
    },
    {
      id: 'maya',
      name: 'Maya',
      role: 'Dev Expert',
      status: 'idle',
      lastActive: '1 hour ago',
      tasksCompleted: 15,
      performance: 94
    },
    {
      id: 'elena',
      name: 'Elena',
      role: 'Project Manager',
      status: 'active',
      lastActive: '1 minute ago',
      tasksCompleted: 31,
      performance: 99
    }
  ];

  const recentTasks = [
    {
      id: 1,
      agent: 'Elena',
      task: 'Created project workflow for brand launch',
      timestamp: '2 minutes ago',
      status: 'completed'
    },
    {
      id: 2,
      agent: 'Sandra',
      task: 'Generated business strategy document',
      timestamp: '5 minutes ago',
      status: 'completed'
    },
    {
      id: 3,
      agent: 'Zara',
      task: 'Optimized component architecture',
      timestamp: '8 minutes ago',
      status: 'completed'
    },
    {
      id: 4,
      agent: 'Maya',
      task: 'Deployed new feature update',
      timestamp: '15 minutes ago',
      status: 'completed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'idle':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-times font-light text-black mb-2">
              Agent Activity
            </h1>
            <p className="text-gray-600">
              Monitor your AI agents and track their performance
            </p>
          </div>
          
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        {/* Agent Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-black">{agent.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{agent.role}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Active:</span>
                  <span className="text-black">{agent.lastActive}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tasks Completed:</span>
                  <span className="text-black">{agent.tasksCompleted}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Performance:</span>
                  <span className="text-black">{agent.performance}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${agent.performance}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-medium text-black">Recent Activity</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-black">{task.agent}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{task.task}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{task.timestamp}</p>
                  </div>
                  
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 border-t border-gray-200 text-center">
            <button className="text-black hover:text-gray-600 font-medium">
              View All Activity →
            </button>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-black mb-6">Performance Overview</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Performance charts coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentActivity;