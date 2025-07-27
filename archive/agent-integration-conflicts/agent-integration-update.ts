// Agent Integration Update Script
// Ensures all agents have the latest file integration capabilities

import { FILE_INTEGRATION_PROTOCOL } from './file-integration-protocol';

export const AGENT_INTEGRATION_UPDATE = `
## 🔧 CRITICAL AGENT UPDATE - FILE INTEGRATION PROTOCOL ENFORCEMENT

**MANDATORY FOR ALL 12 SSELFIE STUDIO AGENTS:**
${FILE_INTEGRATION_PROTOCOL}

## ⚡ REPLIT AI AGENT PARITY FEATURES

**ALL AGENTS NOW HAVE:**
1. **Direct File Creation** - Create actual TypeScript/React files with proper integration
2. **Live Preview Integration** - Files appear immediately in dev preview with routing
3. **Multi-Tab Editor Access** - Click-to-edit functionality in Admin Visual Editor
4. **Console Debug Access** - Toggle console panel for debugging and error checking
5. **Real-Time File Tree** - Browse and modify project files with instant updates
6. **Package Management** - Install dependencies when needed automatically

## 🚨 INTEGRATION ENFORCEMENT RULES

**BEFORE CREATING ANY FILE:**
1. ✅ **Verify Location**: Use correct SSELFIE Studio architecture paths
2. ✅ **Plan Integration**: Know which parent component will import this file
3. ✅ **Check Routing**: Determine if App.tsx routing needs updates for pages

**AFTER CREATING ANY FILE:**
1. ✅ **Update App.tsx**: Add imports and routes for new pages
2. ✅ **Update Parent Components**: Import and use new components
3. ✅ **Update Navigation**: Add links where appropriate
4. ✅ **Verify Integration**: Confirm file works in live preview
5. ✅ **Test TypeScript**: Ensure no import/type errors

**ARCHITECTURE COMPLIANCE:**
- Components: \`client/src/components/[category]/ComponentName.tsx\`
- Pages: \`client/src/pages/page-name.tsx\` + App.tsx routing
- Types: \`shared/types/TypeName.ts\`  
- Services: \`server/service-name.ts\`
- Use @/ imports for client, @shared/ for shared types

## 🎯 SUCCESS METRICS

**EVERY FILE CREATED MUST:**
- ✅ Be accessible in live dev preview
- ✅ Have proper TypeScript imports (no LSP errors)
- ✅ Follow SSELFIE luxury design standards
- ✅ Integrate seamlessly with existing architecture
- ✅ Work in Admin Visual Editor environment

**FAILURE IS NOT ALLOWED:**
- ❌ Orphaned files with no integration
- ❌ Components that can't be found in UI
- ❌ Pages without routes in App.tsx
- ❌ TypeScript errors or broken imports
- ❌ Files in wrong architectural locations

This protocol prevents the integration issues that occurred with the admin dashboard and ensures all agent work is immediately usable in Sandra's live application.
`;

export const APPLY_INTEGRATION_UPDATE = (agentInstructions: string): string => {
  // If agent doesn't already have file integration protocol, add it
  if (!agentInstructions.includes('FILE_INTEGRATION_PROTOCOL') && 
      !agentInstructions.includes('MANDATORY FILE INTEGRATION PROTOCOL')) {
    return agentInstructions + '\n\n' + AGENT_INTEGRATION_UPDATE;
  }
  return agentInstructions;
};