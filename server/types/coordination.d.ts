declare global {
  interface AgentCoordination {
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

  type AgentCoordinationStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

  var agentCoordinations: Map<string, AgentCoordination>;
}