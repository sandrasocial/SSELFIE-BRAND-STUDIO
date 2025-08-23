// OLGA'S DOMAIN OWNERSHIP SYSTEM
// Prevents overlapping responsibilities and conflicting implementations

export const DOMAIN_OWNERSHIP = {
  API_ENDPOINTS: {
    owner: "elena",
    canModify: ["elena", "zara"],
    reviewRequired: true,
    location: "server/routes.ts",
    purpose: "All HTTP endpoint definitions"
  },
  BUSINESS_LOGIC: {
    owner: "rachel", 
    canModify: ["rachel", "elena"],
    reviewRequired: true,
    location: "server/services/",
    purpose: "Core application logic and processing"
  },
  UI_COMPONENTS: {
    owner: "victoria",
    canModify: ["victoria", "maya"],
    reviewRequired: true,
    location: "client/src/components/",
    purpose: "React components and user interface"
  },
  DATABASE_SCHEMA: {
    owner: "zara",
    canModify: ["zara", "elena"],
    reviewRequired: true,
    location: "shared/schema.ts",
    purpose: "Database models and relationships"
  },
  AUTHENTICATION: {
    owner: "elena",
    canModify: ["elena", "zara"],
    reviewRequired: true,
    location: "server/auth/",
    purpose: "User authentication and security"
  },
  CONTENT_CREATION: {
    owner: "rachel",
    canModify: ["rachel", "maya"],
    reviewRequired: false,
    location: "client/src/pages/",
    purpose: "Marketing and content pages"
  },
  TESTING: {
    owner: "quinn",
    canModify: ["quinn", "aria"],
    reviewRequired: false,
    location: "tests/",
    purpose: "Quality assurance and validation"
  },
  REPOSITORY_ORGANIZATION: {
    owner: "olga",
    canModify: ["olga"],
    reviewRequired: true,
    location: "tools/",
    purpose: "Project structure and organization"
  }
};

export const COLLABORATION_RULES = {
  beforeModifying: [
    "Check if you're the owner or authorized modifier",
    "Review existing implementation approach",
    "Coordinate with owner if major changes planned",
    "Document changes for ownership transparency"
  ],
  conflictResolution: {
    "Multiple agents same area": "Owner decides final implementation",
    "Disagreement on approach": "Elena coordinates resolution",
    "Urgent changes needed": "Get owner approval first",
    "Owner unavailable": "Elena can authorize temporary changes"
  }
};

export const TASK_COORDINATION = {
  preventDuplicates: [
    "Check existing tasks before creating new ones",
    "Coordinate with domain owner",
    "Avoid overlapping responsibilities",
    "One agent per domain per task"
  ],
  escalationPath: [
    "Domain owner → Elena → Olga (architecture conflicts)",
    "Technical issues → Zara → Elena",
    "Content conflicts → Rachel → Elena",
    "UI/UX conflicts → Victoria → Maya → Elena"
  ]
};