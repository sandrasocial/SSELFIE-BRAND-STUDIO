import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface AgentStatus {
  name: string;
  status: 'pending' | 'active' | 'working' | 'complete' | 'idle' | 'error';
  progress: number;
  mission: string;
  filesCreated: string[];
  performance: {
    tasksCompleted: number;
    averageTime: number;
    successRate: number;
  };
  currentTask?: string;
}

interface OrchestrationSession {
  id: string;
  status: 'initializing' | 'active' | 'complete' | 'paused';
  overallProgress: number;
  totalTasks: number;
  completedTasks: number;
  agents: AgentStatus[];
  startTime?: string;
}

const AgentActivityDashboard: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch all orchestration sessions
  const { data: sessionsData, refetch: refetchSessions } = useQuery({
    queryKey: ['/api/autonomous-orchestrator/sessions'],
    refetchInterval: autoRefresh ? 3000 : false, // Refresh every 3 seconds
  });

  // Fetch specific session details
  const { data: sessionData, refetch: refetchSession } = useQuery({
    queryKey: ['/api/autonomous-orchestrator/session', selectedSession],
    enabled: !!selectedSession,
    refetchInterval: autoRefresh ? 2000 : false, // Refresh every 2 seconds
  });

  const currentSession: OrchestrationSession | null = sessionData?.session || null;
  const sessions: any[] = sessionsData?.sessions || [];

  // Auto-select the most recent active session
  useEffect(() => {
    if (!selectedSession && sessions.length > 0) {
      const activeSession = sessions.find(s => s.status === 'active') || sessions[0];
      setSelectedSession(activeSession.id);
    }
  }, [sessions, selectedSession]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-100';
      case 'working': return 'text-blue-600 bg-blue-100';
      case 'active': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'idle': return 'text-zinc-500 bg-zinc-100';
      default: return 'text-zinc-400 bg-zinc-50';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'complete': return '✅';
      case 'working': return '⚡';
      case 'active': return '🔄';
      case 'error': return '❌';
      case 'idle': return '⏸️';
      default: return '⏳';
    }
  };

  const startNewOrchestration = async (missionType: string) => {
    try {
      const response = await fetch('/api/autonomous-orchestrator/deploy-all-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ missionType }),
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedSession(result.session.id);
        refetchSessions();
      }
    } catch (error) {
      console.error('Failed to start orchestration:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <h1 className="font-times text-4xl text-black tracking-widest text-center">
            A G E N T  A C T I V I T Y  D A S H B O A R D
          </h1>
          <div className="text-center text-zinc-600 font-times text-sm tracking-wider mt-2">
            AUTONOMOUS ORCHESTRATION COMMAND CENTER
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          <button
            onClick={() => startNewOrchestration('launch-readiness')}
            className="bg-black text-white px-6 py-4 text-sm tracking-wider hover:bg-zinc-800 transition-colors"
          >
            LAUNCH READINESS
          </button>
          <button
            onClick={() => startNewOrchestration('platform-optimization')}
            className="bg-black text-white px-6 py-4 text-sm tracking-wider hover:bg-zinc-800 transition-colors"
          >
            OPTIMIZE PLATFORM
          </button>
          <button
            onClick={() => startNewOrchestration('design-audit')}
            className="bg-black text-white px-6 py-4 text-sm tracking-wider hover:bg-zinc-800 transition-colors"
          >
            DESIGN AUDIT
          </button>
          <div className="flex items-center justify-center">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-zinc-300"
              />
              <span>Auto Refresh</span>
            </label>
          </div>
        </div>

        {/* Session Overview */}
        {currentSession && (
          <div className="bg-zinc-50 border border-zinc-200 p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="font-times text-2xl text-black mb-2">
                  {currentSession.overallProgress.toFixed(0)}%
                </div>
                <div className="text-zinc-600 text-sm tracking-wider">
                  OVERALL PROGRESS
                </div>
              </div>
              <div className="text-center">
                <div className="font-times text-2xl text-black mb-2">
                  {currentSession.completedTasks}/{currentSession.totalTasks}
                </div>
                <div className="text-zinc-600 text-sm tracking-wider">
                  TASKS COMPLETE
                </div>
              </div>
              <div className="text-center">
                <div className={`font-times text-2xl mb-2 ${
                  currentSession.status === 'complete' ? 'text-green-600' :
                  currentSession.status === 'active' ? 'text-blue-600' : 'text-zinc-600'
                }`}>
                  {currentSession.status.toUpperCase()}
                </div>
                <div className="text-zinc-600 text-sm tracking-wider">
                  SESSION STATUS
                </div>
              </div>
              <div className="text-center">
                <div className="font-times text-2xl text-black mb-2">
                  {currentSession.agents.length}
                </div>
                <div className="text-zinc-600 text-sm tracking-wider">
                  AGENTS DEPLOYED
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-zinc-200 h-2">
                <div 
                  className="bg-black h-2 transition-all duration-500"
                  style={{ width: `${currentSession.overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Agent Grid */}
        {currentSession && currentSession.agents && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentSession.agents.map((agent) => (
              <div
                key={agent.name}
                className="border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Agent Header */}
                <div className="p-4 border-b border-zinc-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-times text-lg text-black tracking-wider">
                      {agent.name.toUpperCase()}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(agent.status)}`}>
                      {getStatusIcon(agent.status)} {agent.status}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-200 h-1 mb-2">
                    <div 
                      className="bg-black h-1 transition-all duration-300"
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-zinc-600">{agent.progress}% Complete</div>
                </div>

                {/* Agent Details */}
                <div className="p-4">
                  <div className="text-sm text-zinc-700 mb-3 leading-relaxed">
                    {agent.mission}
                  </div>

                  {agent.currentTask && (
                    <div className="text-xs text-zinc-600 mb-3 p-2 bg-zinc-50 rounded">
                      <strong>Current:</strong> {agent.currentTask}
                    </div>
                  )}

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-zinc-50">
                      <div className="font-bold text-black">{agent.performance.tasksCompleted}</div>
                      <div className="text-zinc-600">Tasks</div>
                    </div>
                    <div className="text-center p-2 bg-zinc-50">
                      <div className="font-bold text-black">{agent.filesCreated.length}</div>
                      <div className="text-zinc-600">Files</div>
                    </div>
                  </div>

                  {/* Files Created */}
                  {agent.filesCreated.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-bold text-zinc-700 mb-1">Files Created:</div>
                      <div className="text-xs text-zinc-600 space-y-1">
                        {agent.filesCreated.slice(0, 3).map((file, index) => (
                          <div key={index} className="truncate">{file}</div>
                        ))}
                        {agent.filesCreated.length > 3 && (
                          <div className="text-zinc-500">
                            +{agent.filesCreated.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Session History */}
        {sessions.length > 0 && (
          <div className="mt-16">
            <h2 className="font-times text-2xl text-black tracking-wider mb-8 text-center">
              O R C H E S T R A T I O N  H I S T O R Y
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`border border-zinc-200 p-4 cursor-pointer transition-all ${
                    selectedSession === session.id ? 'bg-zinc-100 border-zinc-400' : 'bg-white hover:bg-zinc-50'
                  }`}
                  onClick={() => setSelectedSession(session.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-times text-sm text-black">
                      {session.id.split('-').pop()}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-600 mb-2">
                    Progress: {session.overallProgress.toFixed(0)}%
                  </div>
                  <div className="text-xs text-zinc-600">
                    Agents: {session.agentCount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!currentSession && sessions.length === 0 && (
          <div className="text-center py-16">
            <div className="font-times text-2xl text-zinc-400 mb-4 tracking-wider">
              N O  A C T I V E  O R C H E S T R A T I O N
            </div>
            <div className="text-zinc-600 mb-8">
              Start a new orchestration session to deploy all agents
            </div>
            <button
              onClick={() => startNewOrchestration('platform-optimization')}
              className="bg-black text-white px-8 py-4 text-sm tracking-wider hover:bg-zinc-800 transition-colors"
            >
              DEPLOY ALL AGENTS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentActivityDashboard;