import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/Button';
import { 
  CheckCircle, 
  AlertCircle, 
  PlayCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  User,
  Calendar
} from 'lucide-react';

interface TaskStep {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  description?: string;
}

interface BridgeTask {
  id: string;
  agentName: string;
  instruction: string;
  status: 'pending' | 'planning' | 'executing' | 'validating' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  progress: number;
  steps: TaskStep[];
}

interface TaskStatusIndicatorProps {
  task: BridgeTask;
  className?: string;
}

export default function TaskStatusIndicator({ task, className = "" }: TaskStatusIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'executing':
      case 'validating':
        return <PlayCircle className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'planning':
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      case 'executing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Executing</Badge>;
      case 'validating':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Validating</Badge>;
      case 'planning':
        return <Badge className="bg-zinc-100 text-zinc-800 border-zinc-200">Planning</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Medium</Badge>;
      case 'low':
        return <Badge className="bg-zinc-100 text-zinc-800 border-zinc-200 text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-emerald-600" />;
      case 'in_progress':
        return <PlayCircle className="h-3 w-3 text-blue-600 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Clock className="h-3 w-3 text-zinc-400" />;
    }
  };

  return (
    <Card className={`border-zinc-200 bg-white transition-shadow hover:shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              {getStatusIcon(task.status)}
              <CardTitle className="font-serif text-lg font-light text-black truncate">
                {task.agentName}
              </CardTitle>
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
            
            <p className="text-sm text-zinc-600 mb-3">
              {task.instruction}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-zinc-500">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span className="tracking-wide uppercase">{task.agentName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatTime(task.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>ID: {task.id.slice(-8)}</span>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="ml-4 h-8 w-8 p-0"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs tracking-widest uppercase text-zinc-500">
              Progress
            </span>
            <span className="text-xs text-zinc-600">
              {Math.round(task.progress)}%
            </span>
          </div>
          <Progress 
            value={task.progress} 
            className="h-1.5 bg-zinc-100"
          />
        </div>
      </CardHeader>
      
      {/* Expanded Details */}
      {expanded && (
        <CardContent className="pt-0 border-t border-zinc-100">
          <div className="mt-4">
            <h4 className="font-serif text-sm font-medium text-black mb-3 tracking-wide uppercase">
              Execution Steps
            </h4>
            
            {task.steps.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">
                No execution steps available
              </p>
            ) : (
              <div className="space-y-3">
                {task.steps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStepIcon(step.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-zinc-900">
                          {step.title}
                        </span>
                        {step.status === 'in_progress' && step.progress !== undefined && (
                          <span className="text-xs text-zinc-500">
                            {step.progress}%
                          </span>
                        )}
                      </div>
                      
                      {step.description && (
                        <p className="text-xs text-zinc-600 mt-1">
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
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}