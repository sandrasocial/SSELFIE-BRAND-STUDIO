// OLGA'S PRE-TASK ARCHITECTURAL CHECKLIST
// Implements task tunnel vision prevention

export const ARCHITECTURAL_CHECKLIST = {
  beforeStarting: [
    "Identify correct domain using DOMAIN_MAP",
    "Check ownership permissions in DOMAIN_OWNERSHIP", 
    "Review existing implementations in target area",
    "Understand file location rules and patterns",
    "Verify no conflicting tasks are already assigned",
    "Confirm task aligns with project architecture"
  ],
  duringDevelopment: [
    "Follow established naming conventions",
    "Maintain TypeScript type consistency",
    "Avoid duplicate functionality",
    "Document architectural decisions",
    "Stay within assigned domain boundaries",
    "Coordinate with other agents if needed"
  ],
  beforeCompletion: [
    "Verify files created in correct locations",
    "Check TypeScript compilation passes",
    "Confirm no architectural violations",
    "Document any new patterns established",
    "Update relevant documentation",
    "Notify domain owner of changes"
  ]
};

export const VIOLATION_PREVENTION = {
  commonMistakes: {
    "Creating api/ directory": "Use server/routes.ts instead",
    "Creating src/ in root": "Use client/src/ for frontend code",
    "Creating lib/ in root": "Use client/src/lib/ for frontend utilities",
    "Mixing Next.js patterns": "We use React + Wouter, not Next.js",
    "Nested server directories": "Keep flat server/ structure",
    "UI logic in server/": "Move to client/src/",
    "Business logic in client/": "Move to server/services/"
  },
  quickChecks: [
    "Does this file location match existing patterns?",
    "Am I creating forbidden directories?",
    "Is this the simplest, most obvious location?",
    "Would another agent easily find this file?",
    "Does this follow the single responsibility principle?"
  ]
};

export const COGNITIVE_LOAD_REDUCTION = {
  simplifyDecisions: {
    "Need API endpoint": "→ server/routes.ts",
    "Need React component": "→ client/src/components/",
    "Need business logic": "→ server/services/",
    "Need database model": "→ shared/schema.ts",
    "Need utilities": "→ client/src/lib/ or server/utils/",
    "Need types": "→ shared/ or relevant component file"
  },
  mentaModel: "One purpose, one location, one owner",
  defaultRule: "When in doubt, ask domain owner or check existing similar files"
};