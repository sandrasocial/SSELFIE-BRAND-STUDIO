import React, { useState } from 'react';
import { Link } from 'wouter';

export function UnifiedAgentInterface() {
  const [activeTab, setActiveTab] = useState('overview');

  const agents = [
    { name: 'Elena', role: 'Strategic Best Friend', status: 'active', specialty: 'Leadership & Analysis' },
    { name: 'Zara', role: 'Technical Architect', status: 'active', specialty: 'UI/UX & Performance' },
    { name: 'Maya', role: 'AI Photographer', status: 'active', specialty: 'Image Generation' },
    { name: 'Victoria', role: 'Social Media', status: 'active', specialty: 'Content & Engagement' },
    { name: 'Rachel', role: 'Email Marketing', status: 'active', specialty: 'Communication' },
  ];

  return (
    <div className="bg-white border border-gray-200">
      {/* Header */}
      <div className="bg-black text-white p-6">
        <h2 className="text-xl font-serif font-medium">Unified Agent Interface</h2>
        <p className="text-gray-300 text-sm mt-1">Coordinate and monitor all AI agents</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {['overview', 'coordination', 'performance', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 text-sm font-medium border-b-2 capitalize ${
                activeTab === tab
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div key={agent.name} className="border border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-lg">{agent.name}</h3>
                    <div className={`w-3 h-3 rounded-full ${
                      agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{agent.role}</p>
                  <p className="text-xs text-gray-500">{agent.specialty}</p>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-xs px-3 py-1 bg-black text-white hover:bg-gray-800 transition-colors">
                      VIEW
                    </button>
                    <button className="text-xs px-3 py-1 border border-gray-300 hover:bg-gray-50 transition-colors">
                      CONFIGURE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'coordination' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 border border-gray-200">
              <h3 className="font-medium mb-4">Active Workflows</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium">User Onboarding Enhancement</p>
                    <p className="text-xs text-gray-500">Elena → Zara → Maya</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">IN PROGRESS</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium">Email Campaign Optimization</p>
                    <p className="text-xs text-gray-500">Rachel → Victoria</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">COMPLETED</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 border border-gray-200">
                <h3 className="font-medium mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/admin/consulting-agents">
                    <button className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                      Launch Consulting Agent Session
                    </button>
                  </Link>
                  <button className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                    Create New Workflow
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                    Schedule Agent Meeting
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 border border-gray-200">
                <h3 className="font-medium mb-4">Agent Communication</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Messages Today:</span>
                    <span className="font-medium">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Conversations:</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Response Time:</span>
                    <span className="font-medium">1.3s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 border border-gray-200">
                <div className="text-2xl font-bold text-green-600">98.7%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center p-4 bg-gray-50 border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">1.2s</div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
              <div className="text-center p-4 bg-gray-50 border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">847</div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 border border-gray-200">
                <div className="text-2xl font-bold text-orange-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 border border-gray-200">
              <h3 className="font-medium mb-4">Global Agent Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto-coordination</label>
                    <p className="text-xs text-gray-500">Allow agents to coordinate automatically</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Debug Mode</label>
                    <p className="text-xs text-gray-500">Enhanced logging for troubleshooting</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Performance Monitoring</label>
                    <p className="text-xs text-gray-500">Track detailed performance metrics</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}