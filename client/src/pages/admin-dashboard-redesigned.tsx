import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface AgentStatus {
  id: string;
  name: string;
  role: string;
  currentTask: string;
  status: 'idle' | 'working' | 'completed' | 'blocked';
  progress: number;
  lastUpdated: string;
  tasksCompleted: number;
  estimatedCompletion?: string;
}

interface TaskAssignment {
  id: string;
  title: string;
  agentId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  createdAt: string;
  completedAt?: string;
  description: string;
}

export default function WorkflowVisibilityDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  // Mock data - replace with real API calls
  const agents: AgentStatus[] = [
    {
      id: 'aria',
      name: 'Aria',
      role: 'Visionary Designer',
      currentTask: 'Admin Dashboard Hero Section',
      status: 'working',
      progress: 75,
      lastUpdated: '2 minutes ago',
      tasksCompleted: 12,
      estimatedCompletion: '15 minutes'
    },
    {
      id: 'zara',
      name: 'Zara',
      role: 'Technical Architect',
      currentTask: 'Visual Editor Optimization',
      status: 'working',
      progress: 40,
      lastUpdated: '5 minutes ago',
      tasksCompleted: 8,
      estimatedCompletion: '30 minutes'
    },
    {
      id: 'ava',
      name: 'Ava',
      role: 'Automation Specialist',
      currentTask: 'Email Sequence Setup',
      status: 'completed',
      progress: 100,
      lastUpdated: '1 hour ago',
      tasksCompleted: 15
    },
    {
      id: 'quinn',
      name: 'Quinn',
      role: 'Quality Assurance',
      currentTask: 'Component Testing',
      status: 'blocked',
      progress: 20,
      lastUpdated: '30 minutes ago',
      tasksCompleted: 6
    }
  ];

  const recentTasks: TaskAssignment[] = [
    {
      id: '1',
      title: 'Luxury Hero Section Design',
      agentId: 'aria',
      priority: 'high',
      status: 'in_progress',
      createdAt: '2 hours ago',
      description: 'Create editorial-style hero section for admin dashboard'
    },
    {
      id: '2',
      title: 'Visual Editor Performance',
      agentId: 'zara',
      priority: 'urgent',
      status: 'in_progress',
      createdAt: '3 hours ago',
      description: 'Optimize visual editor for faster loading'
    },
    {
      id: '3',
      title: 'Welcome Email Automation',
      agentId: 'ava',
      priority: 'medium',
      status: 'completed',
      createdAt: '4 hours ago',
      completedAt: '1 hour ago',
      description: 'Set up automated welcome sequence for new users'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'text-black bg-gray-100';
      case 'completed': return 'text-black bg-white border border-black';
      case 'blocked': return 'text-black bg-gray-200';
      case 'idle': return 'text-gray-600 bg-white border border-gray-300';
      default: return 'text-gray-600 bg-white';
    }
  };

  const getPrioritySymbol = (priority: string) => {
    switch (priority) {
      case 'urgent': return '●●●';
      case 'high': return '●●○';
      case 'medium': return '●○○';
      case 'low': return '○○○';
      default: return '○○○';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Header */}
      <div className="border-b border-black px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 
            className="text-6xl font-serif text-black uppercase tracking-wide mb-4"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Workflow Command Center
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Real-time agent orchestration and task visibility
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Agent Status Overview */}
          <div className="lg:col-span-2">
            <h2 
              className="text-4xl font-serif text-black uppercase tracking-wide mb-8"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Agent Status Board
            </h2>
            
            <div className="space-y-6">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`border border-black p-8 transition-all duration-300 cursor-pointer ${
                    selectedAgent === agent.id ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-serif mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {agent.name}
                      </h3>
                      <p className={`text-sm uppercase tracking-wide ${selectedAgent === agent.id ? 'text-gray-300' : 'text-gray-600'}`}>
                        {agent.role}
                      </p>
                    </div>
                    <div className={`px-3 py-1 text-xs uppercase tracking-wide ${
                      selectedAgent === agent.id ? 'text-black bg-white' : getStatusColor(agent.status)
                    }`}>
                      {agent.status}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className={`text-lg mb-2 ${selectedAgent === agent.id ? 'text-white' : 'text-black'}`}>
                      {agent.currentTask}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className={`w-full h-1 ${selectedAgent === agent.id ? 'bg-gray-700' : 'bg-gray-200'} mb-2`}>
                      <div 
                        className={`h-1 transition-all duration-500 ${
                          selectedAgent === agent.id ? 'bg-white' : 'bg-black'
                        }`}
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className={selectedAgent === agent.id ? 'text-gray-300' : 'text-gray-600'}>
                        {agent.progress}% Complete
                      </span>
                      <span className={selectedAgent === agent.id ? 'text-gray-300' : 'text-gray-600'}>
                        Updated {agent.lastUpdated}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className={selectedAgent === agent.id ? 'text-gray-300' : 'text-gray-600'}>
                      {agent.tasksCompleted} tasks completed today
                    </span>
                    {agent.estimatedCompletion && (
                      <span className={selectedAgent === agent.id ? 'text-gray-300' : 'text-gray-600'}>
                        ETA: {agent.estimatedCompletion}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Assignment Panel */}
          <div>
            <h2 
              className="text-4xl font-serif text-black uppercase tracking-wide mb-8"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Recent Tasks
            </h2>

            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 p-6 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-black">
                      {task.title}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {getPrioritySymbol(task.priority)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {task.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      {agents.find(a => a.id === task.agentId)?.name}
                    </span>
                    <span>
                      {task.completedAt ? `Completed ${task.completedAt}` : `Created ${task.createdAt}`}
                    </span>
                  </div>
                  
                  <div className={`inline-block mt-3 px-2 py-1 text-xs uppercase tracking-wide ${
                    task.status === 'completed' ? 'bg-black text-white' :
                    task.status === 'in_progress' ? 'bg-gray-100 text-black' :
                    task.status === 'blocked' ? 'bg-gray-200 text-black' :
                    'bg-white border border-gray-300 text-gray-600'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-12">
              <h3 
                className="text-2xl font-serif text-black uppercase tracking-wide mb-6"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full border border-black text-black hover:bg-black hover:text-white transition-colors px-6 py-3 text-left uppercase tracking-wide">
                  Assign New Task
                </button>
                <button className="w-full border border-black text-black hover:bg-black hover:text-white transition-colors px-6 py-3 text-left uppercase tracking-wide">
                  View Agent Logs
                </button>
                <button className="w-full border border-black text-black hover:bg-black hover:text-white transition-colors px-6 py-3 text-left uppercase tracking-wide">
                  Performance Analytics
                </button>
                <button className="w-full border border-black text-black hover:bg-black hover:text-white transition-colors px-6 py-3 text-left uppercase tracking-wide">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview Stats */}
        <div className="mt-16 border-t border-black pt-12">
          <h2 
            className="text-4xl font-serif text-black uppercase tracking-wide mb-8 text-center"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            System Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-serif text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                41
              </div>
              <div className="text-sm uppercase tracking-wide text-gray-600">
                Tasks Completed Today
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-serif text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                2.3
              </div>
              <div className="text-sm uppercase tracking-wide text-gray-600">
                Avg Hours Per Task
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-serif text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                94%
              </div>
              <div className="text-sm uppercase tracking-wide text-gray-600">
                System Uptime
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-serif text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                3
              </div>
              <div className="text-sm uppercase tracking-wide text-gray-600">
                Active Agents
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}