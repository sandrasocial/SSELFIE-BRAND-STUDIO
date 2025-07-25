import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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
    description?: string;
  }>;
}

interface BridgeSubmissionResult {
  success: boolean;
  taskId?: string;
  error?: string;
}

interface TaskStatusResult {
  success: boolean;
  task?: BridgeTask;
  error?: string;
}

export function useAgentBridge() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTasks, setActiveTasks] = useState<Map<string, BridgeTask>>(new Map());
  const { toast } = useToast();

  const submitTask = useCallback(async (
    agentName: string,
    instruction: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    context?: {
      conversationContext?: string[];
      completionCriteria?: string[];
      qualityGates?: string[];
    }
  ): Promise<BridgeSubmissionResult> => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/agent-bridge/submit-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          agentName,
          instruction,
          conversationContext: context?.conversationContext || [],
          priority,
          completionCriteria: context?.completionCriteria || [
            'Task completed successfully',
            'Implementation meets luxury standards',
            'TypeScript compilation passes'
          ],
          qualityGates: context?.qualityGates || [
            'luxury_standards',
            'performance_optimized',
            'mobile_responsive'
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit task');
      }

      if (data.success && data.taskId) {
        toast({
          title: "Task Submitted",
          description: `${agentName} will begin working on your request`,
        });
        
        return { success: true, taskId: data.taskId };
      } else {
        throw new Error(data.error || 'Task submission failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [toast]);

  const getTaskStatus = useCallback(async (taskId: string): Promise<TaskStatusResult> => {
    try {
      const response = await fetch(`/api/agent-bridge/task-status/${taskId}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get task status');
      }

      if (data.success && data.task) {
        // Update local task cache
        setActiveTasks(prev => new Map(prev.set(taskId, data.task)));
        return { success: true, task: data.task };
      } else {
        throw new Error(data.error || 'Task status not available');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }, []);

  const validateTask = useCallback(async (taskId: string): Promise<BridgeSubmissionResult> => {
    try {
      const response = await fetch(`/api/agent-bridge/validate-task/${taskId}`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate task');
      }

      if (data.success) {
        toast({
          title: "Task Validated",
          description: "Task validation completed successfully",
        });
        
        return { success: true, taskId };
      } else {
        throw new Error(data.error || 'Task validation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  const getActiveTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/agent-bridge/active-tasks', {
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const tasksMap = new Map<string, BridgeTask>();
        (data.tasks || []).forEach((task: BridgeTask) => {
          tasksMap.set(task.id, task);
        });
        setActiveTasks(tasksMap);
        return data.tasks || [];
      } else {
        throw new Error(data.error || 'Failed to fetch active tasks');
      }
    } catch (error) {
      console.error('Error fetching active tasks:', error);
      return [];
    }
  }, []);

  const getHealthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/agent-bridge/health', {
        credentials: 'include'
      });

      const data = await response.json();
      return response.ok ? data : null;
    } catch (error) {
      console.error('Error fetching health status:', error);
      return null;
    }
  }, []);

  return {
    submitTask,
    getTaskStatus,
    validateTask,
    getActiveTasks,
    getHealthStatus,
    activeTasks: Array.from(activeTasks.values()),
    isSubmitting
  };
}