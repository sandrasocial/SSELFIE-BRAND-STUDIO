// SSELFIE Studio Agent Bridge System - Type Definitions
// Luxury agent-to-agent communication bridge with technical execution integration

export interface AgentTask {
  taskId: string;
  agentName: 'elena' | 'aria' | 'zara' | 'maya' | 'victoria' | 'rachel' | 'ava' | 'quinn' | string;
  instruction: string;
  conversationContext: string[];  // Full conversation history
  priority: 'high' | 'medium' | 'low';
  completionCriteria: string[];
  qualityGates: string[];
  estimatedDuration: number;
  createdAt: Date;
}

export interface ReplitExecution {
  taskId: string;
  status: 'received' | 'planning' | 'executing' | 'validating' | 'complete' | 'failed';
  progress: number;
  context: AgentTask;
  implementations: {
    filesCreated: string[];
    filesModified: string[];
    componentsBuilt: string[];
  };
  rollbackPlan: string[];
  validationResults: ValidationResult[];
  completedAt?: Date;
}

export interface ValidationResult {
  gate: string;
  passed: boolean;
  details: string;
  performance?: number;
}

// Task submission request interface
export interface TaskSubmissionRequest {
  agentName: string;
  instruction: string;
  conversationContext: string[];
  priority?: 'high' | 'medium' | 'low';
  completionCriteria: string[];
  qualityGates?: string[];
  estimatedDuration: number;
}

// Task status response interface
export interface TaskStatusResponse {
  success: boolean;
  taskId: string;
  status: ReplitExecution['status'];
  progress: number;
  estimatedCompletion: Date;
  validationResults?: ValidationResult[];
  error?: string;
}