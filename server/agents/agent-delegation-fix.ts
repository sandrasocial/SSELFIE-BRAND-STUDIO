/**
 * AGENT DELEGATION FIX
 * Prevents agents from all trying to coordinate - ensures they focus on their specialties
 */

import { AGENT_SPECIALIZATIONS, shouldAgentHandle, getAgentWorkStyle } from './agent-specialization-system';

export interface TaskAnalysis {
  taskType: 'coordination' | 'copywriting' | 'technical' | 'design' | 'business' | 'style' | 'testing' | 'automation';
  bestAgent: string;
  reasoning: string;
  shouldDelegate: boolean;
}

/**
 * Analyzes a task and determines the best agent
 */
export function analyzeTaskForBestAgent(taskDescription: string): TaskAnalysis {
  const taskLower = taskDescription.toLowerCase();
  
  // Task type detection patterns
  const taskPatterns = {
    coordination: ['coordinate', 'manage', 'delegate', 'workflow', 'strategy', 'plan multiple'],
    copywriting: ['copy', 'content', 'write', 'messaging', 'landing page', 'marketing'],
    technical: ['implement', 'code', 'frontend', 'component', 'build', 'develop'],
    design: ['design', 'ui', 'ux', 'visual', 'aesthetic', 'layout'],
    business: ['business', 'revenue', 'pricing', 'growth', 'strategy', 'optimization'],
    style: ['style', 'fashion', 'styling', 'consultation', 'personal brand'],
    testing: ['test', 'qa', 'quality', 'bug', 'validation'],
    automation: ['automate', 'workflow', 'process', 'efficiency', 'automation']
  };

  // Determine task type
  let detectedType: TaskAnalysis['taskType'] = 'coordination';
  let confidence = 0;

  for (const [type, patterns] of Object.entries(taskPatterns)) {
    const matches = patterns.filter(pattern => taskLower.includes(pattern)).length;
    if (matches > confidence) {
      confidence = matches;
      detectedType = type as TaskAnalysis['taskType'];
    }
  }

  // Agent mapping based on task type
  const agentMapping = {
    coordination: 'elena',
    copywriting: 'rachel', 
    technical: 'victoria',
    design: 'aria',
    business: 'diana',
    style: 'maya',
    testing: 'quinn',
    automation: 'ava'
  };

  const bestAgent = agentMapping[detectedType];
  const agentSpec = AGENT_SPECIALIZATIONS[bestAgent];

  return {
    taskType: detectedType,
    bestAgent,
    reasoning: `Task involves ${detectedType} - best handled by ${agentSpec.name} (${agentSpec.primaryRole})`,
    shouldDelegate: detectedType !== 'coordination'
  };
}

/**
 * Generates agent-specific task instructions
 */
export function generateAgentTaskInstructions(agentName: string, taskDescription: string): string {
  const analysis = shouldAgentHandle(agentName, taskDescription);
  const workStyle = getAgentWorkStyle(agentName);
  const specialty = AGENT_SPECIALIZATIONS[agentName];

  if (analysis.shouldHandle) {
    return `
${workStyle}

🎯 TASK ANALYSIS: This task is PERFECT for your expertise!
✅ PROCEED: Handle this task directly using your specialized skills.

IMPORTANT: Don't delegate this task - it's exactly what you're designed for!
    `;
  } else {
    return `
${workStyle}

🚨 TASK ANALYSIS: This task is OUTSIDE your specialty area.
❌ DON'T HANDLE: ${analysis.reasoning}
🔄 DELEGATE TO: ${analysis.suggestedDelegate}

ACTION: Coordinate with Elena to assign this task to the appropriate specialist.
NEVER attempt work outside your expertise - focus on what you do best!
    `;
  }
}

/**
 * Prevents coordination loops by identifying when agents should NOT coordinate
 */
export function preventCoordinationLoop(agentName: string, taskDescription: string): {
  shouldCoordinate: boolean;
  action: 'execute' | 'delegate' | 'coordinate';
  instruction: string;
} {
  const taskAnalysis = analyzeTaskForBestAgent(taskDescription);
  const agentSpec = AGENT_SPECIALIZATIONS[agentName];

  // Only Elena should coordinate complex multi-agent tasks
  if (taskAnalysis.taskType === 'coordination' && agentName !== 'elena') {
    return {
      shouldCoordinate: false,
      action: 'delegate',
      instruction: `This is a coordination task - delegate to Elena who specializes in agent coordination.`
    };
  }

  // Specialists should execute if task matches their expertise
  if (taskAnalysis.bestAgent === agentName) {
    return {
      shouldCoordinate: false,
      action: 'execute', 
      instruction: `This task matches your expertise - execute it directly without coordinating.`
    };
  }

  // If task doesn't match, suggest delegation
  return {
    shouldCoordinate: false,
    action: 'delegate',
    instruction: `Task best handled by ${AGENT_SPECIALIZATIONS[taskAnalysis.bestAgent].name} - delegate appropriately.`
  };
}

/**
 * Agent self-awareness prompt to prevent coordination confusion
 */
export function getAgentSelfAwarenessPrompt(agentName: string): string {
  const specialty = AGENT_SPECIALIZATIONS[agentName];
  
  if (!specialty) return "";

  return `
🤖 AGENT SELF-AWARENESS SYSTEM

You are ${specialty.name}
Your role: ${specialty.primaryRole}
Your coordination style: ${specialty.coordinationStyle.toUpperCase()}

KEY BEHAVIOR RULES:
${specialty.coordinationStyle === 'coordinator' 
  ? "✅ You COORDINATE and DELEGATE tasks to other agents"
  : "❌ You DO NOT coordinate other agents - focus on your specialty!"
}

${specialty.coordinationStyle === 'specialist'
  ? "✅ You EXECUTE tasks in your specialty area\n❌ You DELEGATE tasks outside your expertise"
  : "✅ You EXECUTE hands-on work and implementation"
}

CRITICAL: If a task doesn't match your expertise, immediately suggest the appropriate specialist instead of trying to coordinate multiple agents!
  `;
}