import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BridgeTask {
  id: string;
  status: 'pending' | 'planning' | 'executing' | 'validating' | 'completed' | 'failed';
  agentName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  steps: Array<{
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    description?: string;
    progress?: number;
  }>;
  result?: any;
  error?: string;
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
    description: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    context?: Record<string, any>
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
          description,
          priority,
          context: context || {}
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.taskId) {
        // Start monitoring the task
        monitorTask(result.taskId);
        
        toast({
          title: "Task Submitted",
          description: `${agentName} will begin working on your request.`,
        });
        
        return { success: true, taskId: result.taskId };
      } else {
        throw new Error(result.error || 'Failed to submit task');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
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
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.task) {
        // Update local task state
        setActiveTasks(prev => new Map(prev.set(taskId, result.task)));
        return { success: true, task: result.task };
      } else {
        throw new Error(result.error || 'Failed to get task status');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, []);

  const monitorTask = useCallback((taskId: string) => {
    const pollInterval = setInterval(async () => {
      const status = await getTaskStatus(taskId);
      
      if (status.success && status.task) {
        const task = status.task;
        
        // Stop polling if task is completed or failed
        if (task.status === 'completed' || task.status === 'failed') {
          clearInterval(pollInterval);
          
          if (task.status === 'completed') {
            toast({
              title: "Task Completed",
              description: `${task.agentName} has finished the task successfully.`,
            });
          } else {
            toast({
              title: "Task Failed",
              description: task.error || "The task encountered an error.",
              variant: "destructive",
            });
          }
        }
      } else {
        // If we can't get status, stop polling
        clearInterval(pollInterval);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 10 minutes to prevent infinite polling
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 600000);
  }, [getTaskStatus, toast]);

  const validateTask = useCallback(async (taskId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/agent-bridge/validate-task/${taskId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getHealth = useCallback(async (): Promise<{ success: boolean; status?: string; error?: string }> => {
    try {
      const response = await fetch('/api/agent-bridge/health', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    // State
    isSubmitting,
    activeTasks: Array.from(activeTasks.values()),
    
    // Actions
    submitTask,
    getTaskStatus,
    validateTask,
    getHealth,
    
    // Utilities
    getTask: (taskId: string) => activeTasks.get(taskId),
  };
}