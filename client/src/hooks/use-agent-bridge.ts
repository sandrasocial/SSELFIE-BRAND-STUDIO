// SSELFIE Studio - Agent Bridge Hook
// Manages Bridge state and API communication

import { useState, useCallback, useEffect } from 'react';

interface AgentBridgeState {
  [agentName: string]: {
    enabled: boolean;
    status: 'idle' | 'processing' | 'complete' | 'error';
    currentTaskId?: string;
  };
}

interface TaskStatus {
  taskId: string;
  agentName: string;
  status: 'planning' | 'executing' | 'validating' | 'complete' | 'failed';
  progress: number;
  currentStep?: string;
  estimatedCompletion?: string;
  validationResults?: Array<{
    gate: string;
    passed: boolean;
    details: string;
  }>;
}

interface AgentBridgeHook {
  bridgeStates: AgentBridgeState;
  currentTask: TaskStatus | null;
  toggleBridge: (agentName: string) => void;
  submitToBridge: (params: {
    agentName: string;
    instruction: string;
    conversationContext: string[];
    priority?: 'low' | 'medium' | 'high';
    completionCriteria?: string[];
    qualityGates?: string[];
  }) => Promise<{ success: boolean; taskId?: string; error?: string }>;
  monitorProgress: (taskId: string) => void;
  dismissCurrentTask: () => void;
}

export const useAgentBridge = (): AgentBridgeHook => {
  const [bridgeStates, setBridgeStates] = useState<AgentBridgeState>({});
  const [currentTask, setCurrentTask] = useState<TaskStatus | null>(null);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);

  // Load bridge states from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('agent-bridge-states');
    if (saved) {
      try {
        setBridgeStates(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load bridge states:', error);
      }
    }
  }, []);

  // Save bridge states to localStorage when they change
  useEffect(() => {
    localStorage.setItem('agent-bridge-states', JSON.stringify(bridgeStates));
  }, [bridgeStates]);

  const toggleBridge = useCallback((agentName: string) => {
    setBridgeStates(prev => ({
      ...prev,
      [agentName]: {
        enabled: !prev[agentName]?.enabled,
        status: 'idle',
        currentTaskId: undefined
      }
    }));
  }, []);

  const submitToBridge = useCallback(async (params: {
    agentName: string;
    instruction: string;
    conversationContext: string[];
    priority?: 'low' | 'medium' | 'high';
    completionCriteria?: string[];
    qualityGates?: string[];
  }) => {
    try {
      // Update agent status to processing
      setBridgeStates(prev => ({
        ...prev,
        [params.agentName]: {
          ...prev[params.agentName],
          status: 'processing'
        }
      }));

      const response = await fetch('/api/agent-bridge/submit-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'sandra-admin-2025'
        },
        body: JSON.stringify({
          agentName: params.agentName,
          instruction: params.instruction,
          conversationContext: params.conversationContext,
          priority: params.priority || 'high',
          completionCriteria: params.completionCriteria || [
            'Implementation complete',
            'TypeScript compilation passes',
            'Luxury design standards met'
          ],
          qualityGates: params.qualityGates || [
            'luxury_standards',
            'performance_optimized',
            'mobile_responsive'
          ],
          estimatedDuration: 15
        })
      });

      const result = await response.json();

      if (result.success && result.taskId) {
        // Update bridge state with task ID
        setBridgeStates(prev => ({
          ...prev,
          [params.agentName]: {
            ...prev[params.agentName],
            currentTaskId: result.taskId
          }
        }));

        // Start monitoring progress
        monitorProgress(result.taskId);

        return { success: true, taskId: result.taskId };
      } else {
        // Update status to error
        setBridgeStates(prev => ({
          ...prev,
          [params.agentName]: {
            ...prev[params.agentName],
            status: 'error'
          }
        }));

        return { success: false, error: result.error || 'Failed to submit task' };
      }
    } catch (error) {
      // Update status to error
      setBridgeStates(prev => ({
        ...prev,
        [params.agentName]: {
          ...prev[params.agentName],
          status: 'error'
        }
      }));

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }, []);

  const monitorProgress = useCallback((taskId: string) => {
    // Clear existing interval
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }

    const checkProgress = async () => {
      try {
        const response = await fetch(`/api/agent-bridge/task-status/${taskId}`, {
          headers: {
            'X-Admin-Token': 'sandra-admin-2025'
          }
        });

        const taskStatus = await response.json();

        if (taskStatus.success) {
          setCurrentTask({
            taskId,
            agentName: taskStatus.agentName || 'Unknown',
            status: taskStatus.status,
            progress: taskStatus.progress || 0,
            currentStep: taskStatus.currentStep,
            estimatedCompletion: taskStatus.estimatedCompletion,
            validationResults: taskStatus.validationResults
          });

          // Update bridge state
          setBridgeStates(prev => {
            const agentName = taskStatus.agentName || Object.keys(prev).find(name => 
              prev[name].currentTaskId === taskId
            );
            
            if (agentName) {
              return {
                ...prev,
                [agentName]: {
                  ...prev[agentName],
                  status: taskStatus.status === 'complete' ? 'complete' : 
                           taskStatus.status === 'failed' ? 'error' : 'processing'
                }
              };
            }
            return prev;
          });

          // Stop monitoring if task is complete or failed
          if (taskStatus.status === 'complete' || taskStatus.status === 'failed') {
            if (monitoringInterval) {
              clearInterval(monitoringInterval);
              setMonitoringInterval(null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to check task progress:', error);
      }
    };

    // Initial check
    checkProgress();

    // Set up interval for continued monitoring
    const interval = setInterval(checkProgress, 3000); // Check every 3 seconds
    setMonitoringInterval(interval);
  }, [monitoringInterval]);

  const dismissCurrentTask = useCallback(() => {
    setCurrentTask(null);
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      setMonitoringInterval(null);
    }
  }, [monitoringInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval]);

  return {
    bridgeStates,
    currentTask,
    toggleBridge,
    submitToBridge,
    monitorProgress,
    dismissCurrentTask
  };
};