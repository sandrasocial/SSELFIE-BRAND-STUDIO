import { performance } from 'perf_hooks';

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  maxMemoryUsage: number;
  maxResponseTime: number;
  errorThreshold: number;
}

export const agentConfigs: Record<string, AgentConfig> = {
  victoria: {
    id: 'victoria',
    name: 'Victoria',
    role: 'Design Lead',
    capabilities: ['design_concept', 'ui_ux', 'style_guidelines'],
    maxMemoryUsage: 512 * 1024 * 1024, // 512MB
    maxResponseTime: 5000, // 5 seconds
    errorThreshold: 0.01 // 1% error rate threshold
  },
  maya: {
    id: 'maya',
    name: 'Maya',
    role: 'Technical Lead',
    capabilities: ['technical_implementation', 'code_review', 'architecture'],
    maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
    maxResponseTime: 8000, // 8 seconds
    errorThreshold: 0.005 // 0.5% error rate threshold
  },
  wilma: {
    id: 'wilma',
    name: 'Wilma',
    role: 'Workflow Optimizer',
    capabilities: ['process_optimization', 'automation', 'integration'],
    maxMemoryUsage: 256 * 1024 * 1024, // 256MB
    maxResponseTime: 3000, // 3 seconds
    errorThreshold: 0.01 // 1% error rate threshold
  }
};

export const systemLimits = {
  maxConcurrentAgents: 10,
  totalMemoryLimit: 4 * 1024 * 1024 * 1024, // 4GB
  cleanupInterval: 60 * 60 * 1000, // 1 hour
  metricsRetention: 24 * 60 * 60 * 1000 // 24 hours
};

export const errorHandling = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  errorTypes: {
    MEMORY_EXCEEDED: 'MEMORY_EXCEEDED',
    TIMEOUT: 'TIMEOUT',
    API_ERROR: 'API_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR'
  }
};

export function validateAgentResources(agentId: string): boolean {
  const config = agentConfigs[agentId];
  if (!config) return false;

  const memoryUsage = process.memoryUsage().heapUsed;
  return memoryUsage <= config.maxMemoryUsage;
}

export function getAgentConfig(agentId: string): AgentConfig | null {
  return agentConfigs[agentId] || null;
}