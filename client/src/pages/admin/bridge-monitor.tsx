import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { EditorialImageBreak } from '@/components/editorial-image-break';

interface Agent {
  name: string;
  role: string;
  status: 'Active' | 'Processing' | 'Standby';
  lastActivity: string;
}

interface BridgeTask {
  id: string;
  agentName: string;
  instruction: string;
  status: 'Planning' | 'Executing' | 'Completed' | 'Failed';
  progress: number;
  createdAt: string;
}

export default function BridgeMonitor() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<BridgeTask[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchBridgeData = async () => {
    setRefreshing(true);
    try {
      // Fetch active tasks
      const tasksResponse = await fetch('/api/agent-bridge/active-tasks', {
        credentials: 'include'
      });
      
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
      }

      // Set agent directory
      setAgents([
        { name: 'Elena', role: 'Strategic Coordinator', status: 'Active', lastActivity: '2 minutes ago' },
        { name: 'Aria', role: 'Luxury Design Specialist', status: 'Standby', lastActivity: '5 minutes ago' },
        { name: 'Zara', role: 'Technical Architect', status: 'Active', lastActivity: '1 minute ago' },
        { name: 'Maya', role: 'AI Photography Expert', status: 'Processing', lastActivity: 'Now' },
        { name: 'Victoria', role: 'UX Specialist', status: 'Standby', lastActivity: '3 minutes ago' },
        { name: 'Rachel', role: 'Voice Specialist', status: 'Active', lastActivity: '1 minute ago' },
        { name: 'Ava', role: 'Automation Specialist', status: 'Standby', lastActivity: '7 minutes ago' },
        { name: 'Quinn', role: 'Quality Assurance', status: 'Standby', lastActivity: '4 minutes ago' },
        { name: 'Sophia', role: 'Social Media Manager', status: 'Standby', lastActivity: '6 minutes ago' },
        { name: 'Martha', role: 'Marketing Specialist', status: 'Standby', lastActivity: '8 minutes ago' },
        { name: 'Diana', role: 'Business Coach', status: 'Standby', lastActivity: '5 minutes ago' },
        { name: 'Wilma', role: 'Workflow Designer', status: 'Standby', lastActivity: '9 minutes ago' },
        { name: 'Olga', role: 'Repository Expert', status: 'Standby', lastActivity: '10 minutes ago' }
      ]);
      
    } catch (error) {
      console.error('Failed to fetch bridge data:', error);
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchBridgeData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchBridgeData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/admin-dashboard">
                <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-black font-light">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-3xl font-light tracking-wide text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Bridge Monitor
                </h1>
                <p className="text-sm tracking-[0.3em] uppercase text-zinc-500 mt-1">
                  Agent Coordination System
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBridgeData}
              disabled={refreshing}
              className="border-zinc-300 font-light"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </nav>

      {/* Editorial Hero Image */}
      <EditorialImageBreak
        src="/assets/gallery/Image-43.jpg"
        alt="Agent Bridge System Overview"
        height="small"
        overlay={true}
        overlayText="AI Agent Coordination System"
      />

      <div className="max-w-5xl mx-auto px-8 py-16">
        
        {/* System Status - Minimal */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-2xl font-light text-black mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            System Status
          </h2>
          <div className="text-zinc-600" style={{ fontFamily: 'Times New Roman, serif' }}>
            Bridge System Online • Last Updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>

        {/* Agent Directory - Clean List */}
        <div className="mb-16">
          <h3 className="font-serif text-xl font-light text-black mb-8 text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
            Agent Directory
          </h3>
          
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.name} className="flex items-center justify-between py-4 border-b border-zinc-100 last:border-b-0">
                <div>
                  <div className="font-serif text-lg font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {agent.name}
                  </div>
                  <div className="text-sm text-zinc-600" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {agent.role}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {agent.status}
                  </div>
                  <div className="text-xs text-zinc-500" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {agent.lastActivity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Tasks - Simple List */}
        <div className="mb-16">
          <h3 className="font-serif text-xl font-light text-black mb-8 text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
            Active Tasks
          </h3>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-zinc-600" style={{ fontFamily: 'Times New Roman, serif' }}>
                No active tasks at this time
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {tasks.map((task) => (
                <div key={task.id} className="border border-zinc-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-serif text-lg font-light text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {task.agentName}
                      </div>
                      <div className="text-zinc-600 mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {task.instruction}
                      </div>
                      <div className="text-xs text-zinc-500" style={{ fontFamily: 'Times New Roman, serif' }}>
                        Task ID: {task.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-black mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {task.status}
                      </div>
                      <div className="text-xs text-zinc-500" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {task.progress}% Complete
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar - Minimal */}
                  <div className="w-full bg-zinc-100 h-1">
                    <div 
                      className="bg-black h-1 transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="text-center pt-8 border-t border-zinc-200">
          <Link 
            href="/admin-dashboard"
            className="text-sm tracking-[0.2em] uppercase border-b border-transparent hover:border-black transition-colors duration-300"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}