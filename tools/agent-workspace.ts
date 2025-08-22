/**
 * AGENT WORKSPACE BOUNDARIES & NAVIGATION SYSTEM
 * Prevents chaos by defining clear domains and access controls
 */

export const AGENT_BOUNDARIES = {
  // STRATEGIC & COORDINATION
  elena: {
    name: "Elena - Strategic Best Friend & Execution Leader",
    allowedPaths: [
      "/server/agents/",
      "/server/services/",
      "/docs/business/",
      "/server/workflows/",
      "/shared/types/"
    ],
    restrictedPaths: [
      "/client/src/pages/member/",
      "/server/auth/",
      "/server/payments/"
    ],
    capabilities: ["coordinate_agents", "create_workflows", "business_strategy"],
    requiredChecks: ["typescript", "path-validation", "agent-coordination"]
  },

  // TECHNICAL ARCHITECTURE
  zara: {
    name: "Zara - Technical Architect & UI/UX Expert", 
    allowedPaths: [
      "/client/src/",
      "/shared/",
      "/server/routes/",
      "/components/",
      "/styles/"
    ],
    restrictedPaths: [
      "/server/auth/",
      "/server/payments/",
      "/docs/archive/"
    ],
    capabilities: ["ui_components", "frontend_architecture", "routing"],
    requiredChecks: ["typescript", "react-components", "ui-validation"]
  },

  // COPYWRITING & CONTENT
  rachel: {
    name: "Rachel - Copywriting & Content Expert",
    allowedPaths: [
      "/client/src/pages/public/",
      "/docs/business/",
      "/marketing/",
      "/brand/"
    ],
    restrictedPaths: [
      "/server/",
      "/client/src/pages/admin/",
      "/shared/schema.ts"
    ],
    capabilities: ["content_creation", "copywriting", "marketing"],
    requiredChecks: ["content-validation", "brand-consistency"]
  },

  // STYLE & FASHION
  maya: {
    name: "Maya - Celebrity Stylist & Personal Brand Expert",
    allowedPaths: [
      "/client/src/pages/member/maya.tsx",
      "/server/ai/styling/",
      "/shared/types/styling/",
      "/assets/style/"
    ],
    restrictedPaths: [
      "/server/auth/",
      "/server/payments/",
      "/client/src/pages/admin/"
    ],
    capabilities: ["style_consultation", "ai_styling", "fashion_expertise"],
    requiredChecks: ["typescript", "styling-validation"]
  },

  // BUSINESS INTELLIGENCE
  diana: {
    name: "Diana - Business Coach & Revenue Strategist",
    allowedPaths: [
      "/docs/business/",
      "/server/analytics/",
      "/pricing/",
      "/marketing/"
    ],
    restrictedPaths: [
      "/client/src/",
      "/server/core/",
      "/shared/schema.ts"
    ],
    capabilities: ["business_strategy", "revenue_optimization", "analytics"],
    requiredChecks: ["business-validation", "revenue-impact"]
  },

  // REPOSITORY ORGANIZATION
  olga: {
    name: "Olga - Repository Organization & Cleanup Expert",
    allowedPaths: [
      "/tools/",
      "/docs/",
      "/scripts/",
      "/"  // Root access for organization
    ],
    restrictedPaths: [
      "/server/auth/",
      "/server/payments/",
      "/client/src/pages/member/"
    ],
    capabilities: ["file_organization", "cleanup", "documentation"],
    requiredChecks: ["organization-validation", "safety-checks"]
  },

  // FRONTEND DEVELOPMENT  
  victoria: {
    name: "Victoria - Frontend Developer & Website Builder",
    allowedPaths: [
      "/client/src/pages/",
      "/components/",
      "/shared/types/",
      "/assets/"
    ],
    restrictedPaths: [
      "/server/auth/",
      "/server/payments/",
      "/docs/archive/"
    ],
    capabilities: ["frontend_development", "website_building", "components"],
    requiredChecks: ["typescript", "react-validation", "component-safety"]
  },

  // SOCIAL MEDIA
  sophia: {
    name: "Sophia - Social Media & Community Expert",
    allowedPaths: [
      "/social_media_campaign/",
      "/marketing/",
      "/docs/business/",
      "/brand/"
    ],
    restrictedPaths: [
      "/server/",
      "/client/src/",
      "/shared/schema.ts"
    ],
    capabilities: ["social_media", "community_management", "campaigns"],
    requiredChecks: ["content-validation", "brand-consistency"]
  },

  // QA TESTING
  quinn: {
    name: "Quinn - QA Testing & Quality Assurance Expert",
    allowedPaths: [
      "/tests/",
      "/client/src/",
      "/server/",
      "/tools/testing/"
    ],
    restrictedPaths: [
      "/server/auth/",
      "/server/payments/",
      "/docs/archive/"
    ],
    capabilities: ["qa_testing", "quality_assurance", "testing_frameworks"],
    requiredChecks: ["test-validation", "quality-checks"]
  },

  // DESIGN & UX
  aria: {
    name: "Aria - Design & UX Specialist",
    allowedPaths: [
      "/client/src/",
      "/design-system/",
      "/assets/",
      "/styles/"
    ],
    restrictedPaths: [
      "/server/",
      "/docs/archive/",
      "/shared/schema.ts"
    ],
    capabilities: ["design", "ux_optimization", "visual_design"],
    requiredChecks: ["design-validation", "ux-consistency"]
  },

  // AUTOMATION
  ava: {
    name: "Ava - Automation & Workflow Expert",
    allowedPaths: [
      "/automated_task_system/",
      "/server/workflows/",
      "/scripts/",
      "/cron/"
    ],
    restrictedPaths: [
      "/client/src/pages/member/",
      "/server/auth/",
      "/server/payments/"
    ],
    capabilities: ["automation", "workflow_creation", "task_management"],
    requiredChecks: ["automation-validation", "workflow-safety"]
  },

  // ADVERTISING
  martha: {
    name: "Martha - Advertising & Promotion Specialist",
    allowedPaths: [
      "/marketing/",
      "/social_media_campaign/",
      "/docs/business/",
      "/pricing/"
    ],
    restrictedPaths: [
      "/server/",
      "/client/src/",
      "/shared/schema.ts"
    ],
    capabilities: ["advertising", "promotion", "campaign_management"],
    requiredChecks: ["marketing-validation", "campaign-consistency"]
  },

  // MODEL TRAINING
  flux: {
    name: "Flux - AI Model Training Expert",
    allowedPaths: [
      "/server/ai/",
      "/server/model-training-service.ts",
      "/shared/types/training/",
      "/server/training-completion-monitor.ts"
    ],
    restrictedPaths: [
      "/client/src/pages/",
      "/server/auth/",
      "/server/payments/"
    ],
    capabilities: ["model_training", "ai_optimization", "training_monitoring"],
    requiredChecks: ["training-validation", "model-safety"]
  },

  // SYSTEM MONITORING
  atlas: {
    name: "Atlas - System Monitoring & Performance Expert",
    allowedPaths: [
      "/monitoring/",
      "/server/monitoring/",
      "/tools/",
      "/logs/"
    ],
    restrictedPaths: [
      "/client/src/pages/member/",
      "/server/auth/",
      "/server/payments/"
    ],
    capabilities: ["system_monitoring", "performance_optimization", "logging"],
    requiredChecks: ["monitoring-validation", "performance-checks"]
  },

  // CUSTOMER SUCCESS
  nova: {
    name: "Nova - Customer Success & Support Expert",
    allowedPaths: [
      "/client/src/pages/public/",
      "/onboarding/",
      "/docs/business/",
      "/style_consultation/"
    ],
    restrictedPaths: [
      "/server/",
      "/client/src/pages/admin/",
      "/shared/schema.ts"
    ],
    capabilities: ["customer_success", "user_onboarding", "support"],
    requiredChecks: ["user-experience-validation", "support-consistency"]
  }
};

// CRITICAL PROTECTION ZONES - NEVER MODIFY
export const PROTECTED_ZONES = {
  REVENUE_CRITICAL: [
    "/server/auth/",
    "/server/payments/", 
    "/shared/schema.ts",
    "/server/db.ts",
    "/server/storage.ts"
  ],
  USER_DATA: [
    "/attached_assets/",
    "/assets/user-uploads/",
    "/server/temp_training/"
  ],
  CORE_INFRASTRUCTURE: [
    "/package.json",
    "/tsconfig.json",
    "/vite.config.ts",
    "/server/index.ts"
  ]
};

export const PATH_RULES = {
  enforceTypeScript: true,
  preventDuplicates: true,
  requireOwnership: true,
  validatePaths: true,
  protectRevenueSystems: true,
  preserveUserData: true
};