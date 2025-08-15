import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Clock, CheckCircle, AlertCircle, PlayCircle, Users } from 'lucide-react';
import TaskStatusIndicator from './TaskStatusIndicator';

interface BridgeTask {
  id: string;
  agentName: string;
  instruction: string;
  status: 'pending' | 'planning' | 'executing' | 'validating' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  progress: number;
  steps: Array<{
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress?: number;
  }>;
}

interface StatusDashboardProps {
  className?: string;
}

export default function StatusDashboard({ className = "" }: StatusDashboardProps) {
  const [activeTasks, setActiveTasks] = useState<BridgeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveTasks = async () => {
    try {
      const response = await fetch('/api/agent-bridge/active-tasks', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch active tasks');
      }
      
      const data = await response.json();
      setActiveTasks(data.tasks || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTasks();
    
    // Poll for updates every 3 seconds
    const interval = setInterval(fetchActiveTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusStats = () => {
    const stats = {
      total: activeTasks.length,
      active: activeTasks.filter(t => ['planning', 'executing', 'validating'].includes(t.status)).length,
      completed: activeTasks.filter(t => t.status === 'completed').length,
      failed: activeTasks.filter(t => t.status === 'failed').length
    };
    return stats;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'executing':
      case 'validating':
        return <PlayCircle className="h-4 w-4 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-500" />;
    }
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-zinc-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Editorial Header */}
      <header className="text-center border-b border-zinc-200 pb-8">
        <h1 className="font-serif text-4xl font-light tracking-wide uppercase text-black mb-4">
          Agent Bridge System
        </h1>
        <p className="text-zinc-600 text-sm tracking-widest uppercase font-light">
          Real-Time Coordination Dashboard
        </p>
      </header>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-zinc-200 bg-white">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-zinc-600" />
            </div>
            <div className="text-2xl font-serif font-light text-black mb-1">
              {stats.total}
            </div>
            <p className="text-xs tracking-widest uppercase text-zinc-500">
              Total Tasks
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <PlayCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-serif font-light text-black mb-1">
              {stats.active}
            </div>
            <p className="text-xs tracking-widest uppercase text-zinc-500">
              Active
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-serif font-light text-black mb-1">
              {stats.completed}
            </div>
            <p className="text-xs tracking-widest uppercase text-zinc-500">
              Completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-serif font-light text-black mb-1">
              {stats.failed}
            </div>
            <p className="text-xs tracking-widest uppercase text-zinc-500">
              Failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Tasks List */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTasks.length === 0 ? (
        <Card className="border-zinc-200 bg-white">
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-light text-zinc-600 mb-2">
              No Active Tasks
            </h3>
            <p className="text-sm text-zinc-500 tracking-wide">
              Agent Bridge System is ready for coordination
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-light tracking-wide uppercase text-black border-b border-zinc-200 pb-4">
            Active Coordination
          </h2>
          
          {activeTasks.map((task) => (
            <TaskStatusIndicator
              key={task.id}
              task={task}
              className="mb-4"
            />
          ))}
        </div>
      )}
    </div>
  );
}