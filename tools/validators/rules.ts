export const DOMAIN_MAP = {
  API: {
    purpose: "External interface endpoints only",
    belongsHere: ["REST controllers", "API routes", "Request handlers"],
    doesntBelongHere: ["Business logic", "Database queries", "UI components"]
  },
  SERVER: {
    purpose: "Core business logic and services",
    belongsHere: ["Service implementations", "Database operations", "Business rules"],
    doesntBelongHere: ["API endpoints", "UI logic", "Frontend code"]
  }
};

export const DOMAIN_OWNERSHIP = {
  API_ENDPOINTS: {
    owner: "elena",
    canModify: ["elena", "zara"],
    reviewRequired: true
  },
  BUSINESS_LOGIC: {
    owner: "rachel",
    canModify: ["rachel", "elena"],
    reviewRequired: true
  },
  UI_COMPONENTS: {
    owner: "victoria",
    canModify: ["victoria", "maya"],
    reviewRequired: true
  }
};

export const ARCHITECTURAL_CHECKLIST = {
  beforeStarting: [
    "Identify correct domain",
    "Check ownership permissions",
    "Review existing implementations",
    "Understand file location rules"
  ],
  duringDevelopment: [
    "Follow naming conventions",
    "Maintain TypeScript types",
    "Avoid duplicate functionality",
    "Document architectural decisions"
  ]
};

export const FILE_LOCATION_GUIDE = {
  controllers: {
    location: "/api/controllers",
    purpose: "Handle HTTP requests",
    example: "UserController.ts"
  },
  services: {
    location: "/server/services",
    purpose: "Implement business logic",
    example: "AuthenticationService.ts"
  },
  components: {
    location: "/client/src/components",
    purpose: "Reusable UI elements",
    example: "Button.tsx"
  }
};