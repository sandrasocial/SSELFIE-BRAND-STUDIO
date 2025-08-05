/**
 * HYBRID INTELLIGENCE SYSTEM - MAIN EXPORTS
 * Export all hybrid intelligence components for easy integration
 */

export { LocalStreamingEngine } from './local-streaming-engine';
export { SmartDecisionRouter } from './smart-decision-router';
export { ClaudeAPISelectiveService } from './claude-api-selective';
export { PatternLibraryService } from './pattern-library-service';
export { HybridAgentOrchestrator } from './hybrid-agent-orchestrator';

export type { LocalStreamingRequest, LocalStreamingResponse } from './local-streaming-engine';
export type { RoutingDecision, CloudRequest } from './smart-decision-router';
export type { SelectiveCloudResponse } from './claude-api-selective';
export type { WorkflowPattern, PatternMatch } from './pattern-library-service';
export type { HybridProcessingResult, StreamingConfig } from './hybrid-agent-orchestrator';

// Main hybrid intelligence interface
export const HybridIntelligence = {
  orchestrator: () => import('./hybrid-agent-orchestrator').then(m => m.HybridAgentOrchestrator.getInstance()),
  localEngine: () => import('./local-streaming-engine').then(m => m.LocalStreamingEngine.getInstance()),
  router: () => import('./smart-decision-router').then(m => m.SmartDecisionRouter.getInstance()),
  patterns: () => import('./pattern-library-service').then(m => m.PatternLibraryService.getInstance()),
  selectiveCloud: () => import('./claude-api-selective').then(m => m.ClaudeAPISelectiveService.getInstance())
};