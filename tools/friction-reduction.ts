// OLGA'S FRICTION REDUCTION SYSTEM
// Makes correct architectural choices the easiest path

export const PATH_VALIDATOR = {
  automaticChecks: [
    "File location compliance with DOMAIN_MAP",
    "Ownership verification against DOMAIN_OWNERSHIP",
    "Duplicate detection across repository",
    "TypeScript compilation validation",
    "Import/export consistency checking"
  ],
  beforeCommit: [
    "Structure validation against architectural rules",
    "Type checking across all affected files",
    "Ownership confirmation from domain owners",
    "Documentation presence and accuracy",
    "No forbidden directory patterns"
  ]
};

export const QUICK_REFERENCE = {
  // Make correct choices obvious and fast
  needEndpoint: {
    action: "Add to server/routes.ts",
    example: "router.post('/api/endpoint', handler)",
    owner: "elena"
  },
  needComponent: {
    action: "Create in client/src/components/",
    example: "ComponentName.tsx",
    owner: "victoria"
  },
  needService: {
    action: "Create in server/services/",
    example: "ServiceName.ts",
    owner: "rachel"
  },
  needType: {
    action: "Add to shared/schema.ts",
    example: "export const tableName = pgTable(...)",
    owner: "zara"
  },
  needPage: {
    action: "Create in client/src/pages/",
    example: "PageName.tsx + register in App.tsx",
    owner: "victoria"
  }
};

export const EFFORT_OPTIMIZATION = {
  // Reduce cognitive load by making patterns obvious
  defaultChoices: {
    "Unknown where file goes": "Check QUICK_REFERENCE above",
    "Multiple possible locations": "Choose domain with primary responsibility",
    "Conflict with existing pattern": "Follow existing pattern or ask domain owner",
    "New functionality": "Create in most specific applicable domain"
  },
  
  templateGeneration: {
    // Pre-made templates reduce decision fatigue
    apiRoute: `
// Add to server/routes.ts
router.post('/api/resource', async (req, res) => {
  // Implementation here
});`,
    
    component: `
// client/src/components/ComponentName.tsx
interface Props {
  // Define props
}

export function ComponentName({ }: Props) {
  return (
    <div>
      {/* Implementation */}
    </div>
  );
}`,
    
    service: `
// server/services/ServiceName.ts
export class ServiceName {
  async method() {
    // Implementation
  }
}`,
    
    type: `
// Add to shared/schema.ts
export const tableName = pgTable('table_name', {
  id: serial('id').primaryKey(),
  // Additional fields
});`
  }
};

export const WORKFLOW_OPTIMIZATION = {
  // Make following rules easier than breaking them
  beforeCreatingFile: [
    "1. Check QUICK_REFERENCE for location",
    "2. Verify owner permissions",
    "3. Follow template if available",
    "4. Use established naming patterns"
  ],
  
  preventiveGuidance: {
    "Avoid creating new directories": "Use existing structure",
    "Avoid duplicate functionality": "Search for existing implementation",
    "Avoid mixing concerns": "One file, one responsibility",
    "Avoid breaking TypeScript": "Maintain type consistency"
  },
  
  successMetrics: [
    "Zero forbidden directories created",
    "Zero TypeScript compilation errors",
    "Zero duplicate functionality",
    "100% files in correct domains"
  ]
};