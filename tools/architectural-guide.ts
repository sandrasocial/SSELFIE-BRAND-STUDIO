// OLGA'S ARCHITECTURAL PREVENTION SYSTEM
// Implements cognitive overload solution with clear domain boundaries

export const DOMAIN_MAP = {
  API: {
    purpose: "External interface endpoints only",
    belongsHere: ["REST controllers", "API routes", "Request handlers"],
    doesntBelongHere: ["Business logic", "Database queries", "UI components"],
    correctPath: "server/routes.ts",
    examples: ["User authentication routes", "Payment processing endpoints"]
  },
  SERVER: {
    purpose: "Core business logic and services", 
    belongsHere: ["Service implementations", "Database operations", "Business rules"],
    doesntBelongHere: ["API endpoints", "UI logic", "Frontend code"],
    correctPath: "server/services/",
    examples: ["Authentication service", "Image processing service"]
  },
  CLIENT: {
    purpose: "Frontend user interface",
    belongsHere: ["React components", "UI logic", "User interactions"],
    doesntBelongHere: ["Database operations", "Business logic", "API endpoints"],
    correctPath: "client/src/",
    examples: ["Landing page", "Dashboard components", "Forms"]
  },
  SHARED: {
    purpose: "Common types and schemas",
    belongsHere: ["TypeScript types", "Database schemas", "Validation rules"],
    doesntBelongHere: ["Component logic", "API implementations", "UI styling"],
    correctPath: "shared/",
    examples: ["User types", "Database schema", "Zod validation"]
  }
};

export const FORBIDDEN_PATTERNS = {
  duplicateDirectories: [
    "api/", // Should be server/routes.ts
    "src/", // Should be client/src/
    "lib/", // Should be client/src/lib/
    "pages/api/", // Should be server/routes.ts
    "server/server/", // Nested duplication
    "server/src/", // Mixed patterns
  ],
  wrongLocations: {
    "API endpoints in root": "Move to server/routes.ts",
    "UI components in server/": "Move to client/src/components/",
    "Business logic in client/": "Move to server/services/",
    "Database queries in frontend": "Move to server/ with API endpoint"
  }
};

export const PREVENTION_RULES = {
  beforeCreatingFile: [
    "Check DOMAIN_MAP for correct location",
    "Verify not in FORBIDDEN_PATTERNS",
    "Confirm single responsibility principle",
    "Review existing similar files"
  ],
  mentalModelSimplification: {
    "Need API endpoint?": "server/routes.ts",
    "Need business logic?": "server/services/",
    "Need UI component?": "client/src/components/",
    "Need shared types?": "shared/schema.ts"
  }
};