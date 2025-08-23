// OLGA'S AGENT COORDINATION SYSTEM
// Prevents task explosion and conflicting implementations

export const TASK_PREVENTION_SYSTEM = {
  beforeAssigningTask: [
    "Check for existing tasks in same domain",
    "Verify no other agent is working on similar functionality",
    "Confirm task aligns with agent's domain ownership",
    "Ensure task is not duplicate of recent completed work"
  ],
  
  coordinationProtocol: {
    "Single task per domain": "Only one agent per functional area at a time",
    "Owner gets priority": "Domain owner handles tasks in their area first",
    "Collaboration requires coordination": "Multiple agents need explicit coordination",
    "Elena resolves conflicts": "Task conflicts escalate to Elena for resolution"
  }
};

export const ANTI_CHAOS_MEASURES = {
  taskExplosionPrevention: {
    maxSimultaneousTasks: 5, // System-wide limit
    maxTasksPerAgent: 2, // Per-agent limit
    maxTasksPerDomain: 1, // Domain-specific limit
    cooldownPeriod: "30 minutes between similar tasks"
  },
  
  duplicateDetection: {
    keywords: ["security", "audit", "authentication", "validation", "implementation"],
    similarityThreshold: 0.8,
    autoCancel: "Cancel newer task if >80% similar to existing",
    ownerNotification: "Notify domain owner of potential duplicates"
  },
  
  emergencyProtocols: {
    massTaskDetection: "Auto-cancel all but oldest task if >10 similar tasks",
    systemOverload: "Pause new task assignment if >20 active tasks",
    ownerEscalation: "Escalate to Olga if architectural violations detected"
  }
};

export const HEALTHY_COORDINATION = {
  goodPractices: [
    "One agent, one clear deliverable",
    "Complete task before starting new one",
    "Coordinate with domain owner for changes",
    "Document decisions for other agents"
  ],
  
  badPractices: [
    "Multiple agents same functionality",
    "Starting task without checking existing work",
    "Ignoring domain ownership boundaries",
    "Creating duplicate implementations"
  ],
  
  escalationPath: [
    "Agent notices conflict → Notify domain owner",
    "Domain owner can't resolve → Escalate to Elena",
    "Elena can't resolve → Escalate to Olga",
    "Architecture violation → Immediate Olga escalation"
  ]
};

export const TASK_LIFECYCLE = {
  planning: [
    "Identify domain and owner",
    "Check for existing implementations",
    "Coordinate with relevant agents",
    "Get owner approval if needed"
  ],
  
  execution: [
    "Stay within domain boundaries",
    "Follow architectural guidelines",
    "Document significant decisions",
    "Coordinate if touching other domains"
  ],
  
  completion: [
    "Verify compliance with architectural rules",
    "Update relevant documentation",
    "Notify domain owner of changes",
    "Close task properly in system"
  ]
};