import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  PlayCircle, 
  Clock,
  User,
  Zap
} from 'lucide-react';

interface TaskStep {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  description?: string;
}

interface LuxuryProgressDisplayProps {
  taskId: string;
  agentName: string;
  steps: TaskStep[];
  overallProgress: number;
  status: 'pending' | 'planning' | 'executing' | 'validating' | 'completed' | 'failed';
  className?: string;
}

export default function LuxuryProgressDisplay({ 
  taskId, 
  agentName, 
  steps, 
  overallProgress, 
  status,
  className = ""
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
    <Card className={`border-zinc-200 bg-white ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-lg font-light tracking-wide text-black">
              Task Execution
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <User className="h-3 w-3 text-zinc-500" />
              <span className="text-sm text-zinc-600 tracking-wide">
                {agentName}
              </span>
              <span className="text-xs text-zinc-400">
                • ID: {taskId.slice(-8)}
              </span>
            </div>
          </div>
          {getOverallStatusBadge()}
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs tracking-widest uppercase text-zinc-500 font-light">
              Overall Progress
            </span>
            <span className="text-sm text-zinc-600 font-serif">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <Progress 
            value={overallProgress} 
            className="h-2 bg-zinc-100"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {steps.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm text-zinc-500 tracking-wide">
              Waiting for execution steps...
            </p>
          </div>
        ) : (
          <>
            <h4 className="font-serif text-sm font-medium text-black tracking-wide uppercase border-b border-zinc-100 pb-2">
              Execution Steps
            </h4>
            
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(step.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-zinc-900">
                      {step.title}
                    </h4>
                    {step.status === 'in_progress' && step.progress !== undefined && (
                      <span className="text-xs text-zinc-500 font-serif">
                        {step.progress}%
                      </span>
                    )}
                  </div>
                  
                  {step.description && (
                    <p className="text-xs text-zinc-600 mt-1 tracking-wide">
                      {step.description}
                    </p>
                  )}
                  
                  {step.status === 'in_progress' && step.progress !== undefined && (
                    <Progress 
                      value={step.progress} 
                      className="h-1 mt-2 bg-zinc-100"
                    />
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        
        {/* Luxury Status Indicator */}
        <div className="mt-6 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className="text-xs tracking-widest uppercase text-zinc-500 font-light">
              Bridge System Active
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}