import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/button';

interface AgentEnhancement {
  id: string;
  name: string;
  description: string;
  agentId: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'PENDING' | 'DISABLED';
  implementation: string;
}

interface PredictiveAlert {
  id: string;
  type: 'PERFORMANCE' | 'QUALITY' | 'USER_EXPERIENCE' | 'BUSINESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  suggestedActions: string[];
  affectedAgents: string[];
}

interface AgentTool {
  id: string;
  name: string;
  createdBy: string;
  description: string;
  code: string;
  usage: string;
}

export default function AgentEnhancementDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<string>('all');

  // Fetch all enhancements
  const { data: enhancementData } = useQuery({
    queryKey: ['/api/agent-enhancements'],
    refetchInterval: 30000
  });

  // Fetch predictive alerts
  const { data: alertData } = useQuery({
    queryKey: ['/api/predictive-alerts'],
    refetchInterval: 15000
  });

  // Fetch agent tools
  const { data: toolData } = useQuery({
    queryKey: ['/api/agent-tools']
  });

  // Fetch enhancement dashboard
  const { data: dashboardData } = useQuery({
    queryKey: ['/api/enhancement-dashboard'],
    refetchInterval: 60000
  });

  const agents = [
    { id: 'victoria', name: 'Victoria', role: 'UX Designer AI' },
    { id: 'maya', name: 'Maya', role: 'Dev AI' },
    { id: 'rachel', name: 'Rachel', role: 'Voice AI' },
    { id: 'ava', name: 'Ava', role: 'Automation AI' },
    { id: 'quinn', name: 'Quinn', role: 'QA AI' },
    { id: 'sophia', name: 'Sophia', role: 'Social Media AI' },
    { id: 'martha', name: 'Martha', role: 'Marketing AI' },
    { id: 'diana', name: 'Diana', role: 'Business Coach AI' },
    { id: 'wilma', name: 'Wilma', role: 'Workflow AI' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredEnhancements = selectedAgent === 'all' 
    ? enhancementData?.enhancements || []
    : enhancementData?.enhancements?.filter((e: AgentEnhancement) => e.agentId === selectedAgent) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-serif text-black">Agent Enhancement System</h2>
        <p className="text-sm text-gray-600 mt-1">
          Advanced capabilities and collaboration framework for all 9 agents
        </p>
      </div>

      {/* Overview Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 p-4 rounded">
            <div className="text-2xl font-bold text-black">{dashboardData.overview.totalEnhancements}</div>
            <div className="text-sm text-gray-600">Total Enhancements</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded">
            <div className="text-2xl font-bold text-green-600">{dashboardData.overview.activeEnhancements}</div>
            <div className="text-sm text-gray-600">Active Enhancements</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded">
            <div className="text-2xl font-bold text-red-600">{dashboardData.overview.criticalAlerts}</div>
            <div className="text-sm text-gray-600">Critical Alerts</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded">
            <div className="text-2xl font-bold text-orange-600">{dashboardData.overview.highPriorityAlerts}</div>
            <div className="text-sm text-gray-600">High Priority Alerts</div>
          </div>
        </div>
      )}

      {/* Predictive Alerts */}
      {alertData && alertData.alerts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-serif text-black mb-4">Predictive Intelligence Alerts</h3>
          <div className="space-y-4">
            {alertData.alerts.map((alert: PredictiveAlert) => (
              <div key={alert.id} className="border border-gray-200 rounded p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-gray-500">{alert.type}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-900 mb-3">{alert.message}</p>
                <div className="text-xs text-gray-600">
                  <div className="font-medium mb-1">Suggested Actions:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {alert.suggestedActions && alert.suggestedActions.map ? alert.suggestedActions.map((action, index) => (
                      <li key={index}>{action}</li>
                    )) : <li>No actions available</li>}
                  </ul>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Affected Agents: {alert.affectedAgents && alert.affectedAgents.join ? alert.affectedAgents.join(', ') : 'None'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter by Agent:</label>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
        >
          <option value="all">All Agents</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.name} ({agent.role})
            </option>
          ))}
        </select>
      </div>

      {/* Active Enhancements */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-serif text-black mb-4">
          Active Enhancements 
          {selectedAgent !== 'all' && ` - ${agents.find(a => a.id === selectedAgent)?.name}`}
        </h3>
        <div className="space-y-4">
          {filteredEnhancements.map((enhancement: AgentEnhancement) => (
            <div key={enhancement.id} className="border border-gray-200 rounded p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{enhancement.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(enhancement.priority)}`}>
                    {enhancement.priority}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-200 rounded">
                    {enhancement.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{enhancement.description}</p>
              <div className="text-xs text-gray-500">
                Agent: {agents.find(a => a.id === enhancement.agentId)?.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent-Generated Tools */}
      {toolData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-serif text-black mb-4">Agent-Generated Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolData.tools.map((tool: AgentTool) => (
              <div key={tool.id} className="border border-gray-200 rounded p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{tool.name}</h4>
                  <span className="text-xs text-gray-500">by {tool.createdBy}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                <div className="text-xs text-gray-500 mb-3">{tool.usage}</div>
                <Button
                  size="sm"
                  className="bg-black text-white hover:bg-gray-800 text-xs"
                  onClick={() => console.log(`Execute tool: ${tool.id}`)}
                >
                  Execute Tool
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {dashboardData?.recentActivity && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-serif text-black mb-4">Recent Enhancement Activity</h3>
          <div className="space-y-3">
            {dashboardData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-b-0">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                  <div className="text-xs text-gray-500">{activity.agent} • {activity.impact}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}