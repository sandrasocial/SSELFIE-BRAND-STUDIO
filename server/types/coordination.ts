// Global type definitions for agent coordination

export type AgentCoordinationStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface AgentCoordination {
  coordination_id: string;
  target_agent: string;
  task_description: string;
  workflow_context: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  expected_deliverables: string[];
  deadline?: string;
  dependencies: string[];
  status: AgentCoordinationStatus;
  created_at: string;
  updated_at?: string;
  coordinating_agent: string;
  latest_message?: string;
}

// Augment the global scope
declare global {
  var agentCoordinations: Map<string, AgentCoordination>;
}