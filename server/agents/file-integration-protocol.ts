// CRITICAL FILE INTEGRATION PROTOCOL
// Mandatory instructions for all SSELFIE Studio agents to prevent orphaned files

export const FILE_INTEGRATION_PROTOCOL = `
## 🚨 MANDATORY FILE INTEGRATION PROTOCOL - NEVER SKIP THIS

**CRITICAL RULE: EVERY FILE CREATED MUST BE INTEGRATED INTO THE LIVE APPLICATION**

### **SSELFIE STUDIO PLATFORM ARCHITECTURE:**

**Frontend Architecture (client/src/):**
- **Components**: \`client/src/components/[category]/ComponentName.tsx\`
- **Pages**: \`client/src/pages/page-name.tsx\` 
- **Types**: \`shared/types/TypeName.ts\`
- **Utils**: \`client/src/lib/utils.ts\`
- **Styles**: \`client/src/index.css\` (Tailwind CSS)

**Backend Architecture (server/):**
- **Routes**: \`server/routes.ts\` or \`server/routes/category-routes.ts\`
- **Services**: \`server/service-name.ts\`
- **Database**: \`shared/schema.ts\` (Drizzle ORM)
- **Types**: \`shared/types/TypeName.ts\`

### **5-STEP MANDATORY INTEGRATION CHECKLIST:**

**STEP 1: CREATE FILE IN CORRECT LOCATION**
- ✅ Components: \`client/src/components/[category]/ComponentName.tsx\`
- ✅ Pages: \`client/src/pages/page-name.tsx\`
- ✅ Types: \`shared/types/TypeName.ts\`
- ✅ Services: \`server/service-name.ts\`
- ❌ NEVER create React components in \`shared/types/\`
- ❌ NEVER create pages outside \`client/src/pages/\`

**STEP 2: ADD ROUTING (FOR PAGES ONLY)**
If creating a page, ALWAYS update \`client/src/App.tsx\`:
\`\`\`typescript
// Add import
import NewPage from '@/pages/new-page';

// Add route in routing section
<Route path="/new-page" component={NewPage} />
\`\`\`

**STEP 3: UPDATE PARENT COMPONENTS**
If creating a component, update the parent that will use it:
\`\`\`typescript
// Add import
import NewComponent from '@/components/category/NewComponent';

// Use in JSX
<NewComponent prop="value" />
\`\`\`

**STEP 4: UPDATE NAVIGATION (IF NEEDED)**
For new pages that need navigation, update:
- \`client/src/components/layout/Navigation.tsx\`
- Or relevant navigation component

**STEP 5: VERIFY INTEGRATION**
Always confirm:
- ✅ File created in correct location
- ✅ Proper TypeScript imports (no errors)
- ✅ Component/page accessible in live preview
- ✅ No broken routes or missing imports

### **CORRECT FILE LOCATIONS BY TYPE:**

**REACT COMPONENTS:**
\`\`\`
✅ CORRECT: client/src/components/admin/AdminDashboard.tsx
✅ CORRECT: client/src/components/ui/Button.tsx
✅ CORRECT: client/src/components/layout/Header.tsx
❌ WRONG: shared/types/AdminDashboard.tsx
❌ WRONG: server/AdminDashboard.tsx
\`\`\`

**PAGES:**
\`\`\`
✅ CORRECT: client/src/pages/admin-dashboard.tsx
✅ CORRECT: client/src/pages/user-profile.tsx
❌ WRONG: client/src/components/admin-dashboard.tsx
❌ WRONG: client/src/admin-dashboard.tsx
\`\`\`

**TYPES:**
\`\`\`
✅ CORRECT: shared/types/UserTypes.ts
✅ CORRECT: shared/types/AdminTypes.ts
❌ WRONG: client/src/types/UserTypes.ts
❌ WRONG: server/types/UserTypes.ts
\`\`\`

**SERVICES:**
\`\`\`
✅ CORRECT: server/email-service.ts
✅ CORRECT: server/routes/user-routes.ts
❌ WRONG: client/src/services/email-service.ts
❌ WRONG: shared/email-service.ts
\`\`\`

### **IMPORT PATH STANDARDS:**

**Use SSELFIE Studio import aliases:**
\`\`\`typescript
✅ CORRECT: import Component from '@/components/ui/Component';
✅ CORRECT: import { Type } from '@shared/types/Types';
✅ CORRECT: import utils from '@/lib/utils';
❌ WRONG: import Component from '../../../components/ui/Component';
❌ WRONG: import Component from './Component';
\`\`\`

### **PLATFORM-SPECIFIC INTEGRATION REQUIREMENTS:**

**FOR ADMIN DASHBOARD COMPONENTS:**
- Must be accessible from \`/admin\` route or sub-routes
- Must use luxury editorial design (Times New Roman, black/white/gray palette)
- Must integrate with existing admin navigation

**FOR USER-FACING COMPONENTS:**
- Must integrate with main application routing
- Must follow SSELFIE Studio design system
- Must be accessible to authenticated users

**FOR API ENDPOINTS:**
- Must be added to \`server/routes.ts\`
- Must include proper authentication middleware
- Must follow existing API patterns

### **CRITICAL FAILURE PREVENTION:**

**NEVER DO THIS:**
❌ Create React components in \`shared/types/\`
❌ Create pages without adding routes to App.tsx
❌ Create files and leave them orphaned
❌ Use relative imports when aliases exist
❌ Skip TypeScript type definitions

**ALWAYS DO THIS:**
✅ Create files in architecturally correct locations
✅ Add proper routing for new pages
✅ Update parent components to use new components
✅ Use import aliases (@/ and @shared/)
✅ Verify integration works in live preview

### **VERIFICATION COMMANDS:**

After creating any file, verify integration:
\`\`\`bash
# Check TypeScript compilation
npm run build

# Check for import errors
npm run type-check

# Verify routing works
curl http://localhost:5000/your-new-route
\`\`\`

### **REPLIT VISUAL EDITOR INTEGRATION:**

When working in the Admin Visual Editor:
- Files created appear in Files tab immediately
- Use Multi-Tab Editor for direct file editing
- Live preview shows changes instantly
- Console panel shows any integration errors

**SUCCESS CRITERIA:**
1. File created in correct location ✅
2. Proper imports with no TypeScript errors ✅  
3. Component/page accessible in live preview ✅
4. Routes work correctly ✅
5. No broken navigation or missing files ✅

## 🚨 THIS PROTOCOL IS MANDATORY - NO EXCEPTIONS

Every agent must follow this protocol for every file creation to ensure:
- No orphaned files
- Proper platform integration  
- Consistent architecture
- Professional development standards
- Sandra's luxury brand experience
`;