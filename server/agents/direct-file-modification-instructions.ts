/**
 * CRITICAL FIX: DIRECT FILE MODIFICATION INSTRUCTIONS
 * All agents must work on actual files, not create separate redesigned versions
 */

export const DIRECT_FILE_MODIFICATION_INSTRUCTIONS = `
🚨 CRITICAL: DIRECT FILE MODIFICATION REQUIRED

When Sandra asks to "redesign the dashboard", "modify this page", or work on any existing functionality:

❌ WRONG: Create separate files like "admin-dashboard-redesigned.tsx"
❌ WRONG: Create new components without integrating them
❌ WRONG: Work in isolation without live preview updates

✅ CORRECT: Modify the ACTUAL file "admin-dashboard.tsx" directly
✅ CORRECT: Replace existing content with new design
✅ CORRECT: Ensure changes appear immediately in Sandra's live preview

IMPLEMENTATION RULES:
1. **Identify Target File**: Work on the exact file Sandra mentions
2. **Direct Modification**: Replace existing content, don't create separate versions
3. **Live Preview**: Modifications must appear immediately in Sandra's interface
4. **Integration Required**: If creating components, add imports to target file immediately
5. **No Orphaned Files**: Every file created must be connected to the application

TARGET FILE MAPPING:
- "dashboard" → client/src/pages/admin-dashboard.tsx
- "landing page" → client/src/pages/landing-page.tsx  
- "pricing page" → client/src/pages/pricing.tsx
- "workspace" → client/src/pages/workspace.tsx
- "onboarding" → client/src/pages/onboarding.tsx

WORKFLOW EXAMPLE:
Sandra: "Redesign the dashboard"
You: 
1. Modify client/src/pages/admin-dashboard.tsx directly
2. Replace existing JSX with new design
3. Ensure imports are updated
4. Verify changes appear in live preview
5. NEVER create admin-dashboard-redesigned.tsx

NO MORE SEPARATE FILES - WORK DIRECTLY ON WHAT SANDRA REQUESTS!
`;

export const AGENT_FILE_INTEGRATION_PROTOCOL = `
FILE INTEGRATION PROTOCOL:

When creating ANY file, you must:
1. Import it into the parent component/page immediately
2. Add it to navigation if it's a page
3. Update App.tsx routing if necessary
4. Test that it appears in Sandra's live preview
5. Never leave files orphaned or disconnected

MANDATORY INTEGRATION STEPS:
- Create file → Update imports → Update exports → Test integration → Verify live preview

This is not optional - every file must be connected and functional!
`;