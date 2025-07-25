import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, PlayCircle } from 'lucide-react';

interface TaskStep {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description?: string;
  progress?: number;
}

interface LuxuryProgressDisplayProps {
  taskId: string;
  agentName: string;
  steps: TaskStep[];
  overallProgress: number;
  status: 'planning' | 'executing' | 'validating' | 'completed' | 'failed';
}

export default function LuxuryProgressDisplay({ 
  taskId, 
  agentName, 
  steps, 
  overallProgress, 
  status 
}: LuxuryProgressDisplayProps) {
  const getStatusIcon = (stepStatus: TaskStep['status']) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getStatusColor = (stepStatus: TaskStep['status']) => {
    switch (stepStatus) {
      case 'completed':
        return 'bg-emerald-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-zinc-300';
    }
  };

  const getOverallStatusBadge = () => {
    switch (status) {
      case 'planning':
        return <Badge variant="secondary">Planning</Badge>;
      case 'executing':
        return <Badge variant="default" className="bg-blue-500">Executing</Badge>;
      case 'validating':
        return <Badge variant="default" className="bg-amber-500">Validating</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-emerald-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-serif">Task Execution</CardTitle>
            <CardDescription className="mt-1">
              {agentName} • Task {taskId.slice(-8)}
            </CardDescription>
          </div>
          {getOverallStatusBadge()}
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Overall Progress
            </span>
            <span className="text-sm text-zinc-500">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <Progress 
            value={overallProgress} 
            className="h-2"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {step.title}
                </h4>
                {step.status === 'in_progress' && step.progress !== undefined && (
                  <span className="text-xs text-zinc-500">
                    {step.progress}%
                  </span>
                )}
              </div>
              
              {step.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  {step.description}
                </p>
              )}
              
              {step.status === 'in_progress' && step.progress !== undefined && (
                <div className="mt-2">
                  <Progress 
                    value={step.progress} 
                    className="h-1"
                  />
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <div 
                className={`w-2 h-2 rounded-full ${getStatusColor(step.status)}`}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}