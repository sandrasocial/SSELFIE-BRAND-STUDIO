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

### **CRITICAL DECISION: ANALYZE BEFORE CREATING**

**FIRST: ALWAYS CHECK IF FILE EXISTS**
Before creating any new file, analyze the current codebase:
- ✅ **Redesign Request**: "Admin dashboard redesign" = modify existing `admin-dashboard.tsx`, DON'T create new file
- ✅ **Enhancement Request**: "Improve user profile" = modify existing `user-profile.tsx`
- ✅ **New Feature Request**: "Create blog system" = create new files with proper integration
- ✅ **Component Request**: "Add hero section" = check if hero component exists first

**ANALYSIS PROTOCOL:**
1. 🔍 **Search existing files** - Use filesystem search to find current implementation
2. 📖 **Read current code** - Understand existing structure and functionality  
3. 🎯 **Determine approach**:
   - **MODIFY EXISTING**: If file exists and request is redesign/improvement
   - **CREATE NEW**: Only if genuinely new feature/component needed

### **5-STEP MANDATORY INTEGRATION CHECKLIST:**

**STEP 1: ANALYZE THEN CREATE/MODIFY FILE**
- ✅ **For Existing Pages**: Modify `client/src/pages/existing-page.tsx` directly
- ✅ **For New Components**: Create in `client/src/components/[category]/ComponentName.tsx`
- ✅ **For New Pages**: Create in `client/src/pages/page-name.tsx`
- ✅ **For Types**: Use `shared/types/TypeName.ts`
- ✅ **For Services**: Use `server/service-name.ts`
- ❌ NEVER create new files when modifying existing ones
- ❌ NEVER create React components in `shared/types/`

**STEP 2: ADD ROUTING (FOR NEW PAGES ONLY)**
If creating a NEW page (not modifying existing), ALWAYS update \`client/src/App.tsx\`:
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

**STEP 4: UPDATE NAVIGATION & FOOTER (MANDATORY FOR NEW PAGES)**
For ANY new page created, ALWAYS update navigation:
- ✅ **Main Navigation**: Update `client/src/components/layout/Navigation.tsx`
- ✅ **Admin Navigation**: Update admin navigation if admin page
- ✅ **Footer Links**: Update `client/src/components/layout/Footer.tsx` 
- ✅ **Breadcrumbs**: Add to relevant breadcrumb components if applicable

**NAVIGATION UPDATE EXAMPLES:**
\`\`\`typescript
// 1. First check existing navigation structure in client/src/components/layout/Navigation.tsx
// 2. Add to Navigation.tsx following existing pattern
<Link href="/new-page" className="nav-link">New Page</Link>

// 3. Check Footer.tsx structure in client/src/components/layout/Footer.tsx  
// 4. Add to Footer.tsx in appropriate section following existing pattern
<Link href="/new-page" className="footer-link">New Page</Link>

// 5. For admin pages, check admin navigation structure
// 6. Add to admin navigation following admin-specific patterns
\`\`\`

**SPECIFIC NAVIGATION REQUIREMENTS:**
- ✅ **Check Current Structure**: Always read existing navigation components first
- ✅ **Follow Existing Patterns**: Match current styling, className patterns, link structure
- ✅ **Proper Categorization**: Admin pages in admin nav, public pages in main nav
- ✅ **Footer Organization**: Place links in appropriate footer sections (About, Services, Legal, etc.)
- ✅ **Accessibility**: Include proper aria-labels and semantic HTML structure

**STEP 5: VERIFY INTEGRATION**
Always confirm:
- ✅ File created/modified in correct location
- ✅ Proper TypeScript imports (no errors)
- ✅ Component/page accessible in live preview
- ✅ Navigation links work and point to correct routes
- ✅ Footer links updated and functional
- ✅ No broken routes or missing imports

### **ANALYZE FIRST - CREATE OR MODIFY DECISION TREE:**

**WHEN TO MODIFY EXISTING FILES:**
\`\`\`
✅ REQUEST: "Redesign admin dashboard" → MODIFY: client/src/pages/admin-dashboard.tsx
✅ REQUEST: "Improve user profile page" → MODIFY: client/src/pages/user-profile.tsx  
✅ REQUEST: "Update navigation design" → MODIFY: client/src/components/layout/Navigation.tsx
✅ REQUEST: "Enhance hero section" → MODIFY: existing hero component
❌ WRONG: Creating new files for redesign requests
\`\`\`

**WHEN TO CREATE NEW FILES:**
\`\`\`
✅ REQUEST: "Create blog system" → CREATE: client/src/pages/blog.tsx + routing
✅ REQUEST: "Add testimonials component" → CREATE: client/src/components/ui/Testimonials.tsx
✅ REQUEST: "Build contact form" → CREATE: client/src/components/forms/ContactForm.tsx
❌ WRONG: Creating new files when existing ones should be modified
\`\`\`

**CORRECT FILE LOCATIONS BY TYPE:**

**REACT COMPONENTS:**
\`\`\`
✅ MODIFY: client/src/components/admin/AdminDashboard.tsx (for redesigns)
✅ CREATE: client/src/components/ui/NewButton.tsx (for new components)
✅ MODIFY: client/src/components/layout/Header.tsx (for improvements)
❌ WRONG: shared/types/AdminDashboard.tsx
❌ WRONG: server/AdminDashboard.tsx
\`\`\`

**PAGES:**
\`\`\`
✅ MODIFY: client/src/pages/admin-dashboard.tsx (for page redesigns)
✅ CREATE: client/src/pages/new-feature.tsx (for new pages)
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
❌ Create new files for redesign/improvement requests (modify existing instead)
❌ Create React components in \`shared/types/\`
❌ Create pages without adding routes to App.tsx AND navigation links
❌ Create files and leave them orphaned
❌ Use relative imports when aliases exist
❌ Skip TypeScript type definitions
❌ Forget to update navigation and footer links for new pages

**ALWAYS DO THIS:**
✅ **ANALYZE FIRST** - Check if file exists before creating new ones
✅ **MODIFY EXISTING** - For redesigns, improvements, enhancements of current features  
✅ **CREATE NEW ONLY** - For genuinely new features/components/pages
✅ Add proper routing for new pages
✅ **UPDATE NAVIGATION & FOOTER** - Mandatory for all new pages (check existing structure first)
✅ **FOLLOW EXISTING PATTERNS** - Match current navigation styling and organization
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

Every agent must follow this protocol for every file operation to ensure:
- **Analyze before acting** - Modify existing files for redesigns, create new only when needed
- **No orphaned files** - Every file properly integrated into application
- **Complete navigation integration** - All new pages added to navigation and footer
- **Proper platform integration** - Following SSELFIE Studio architecture patterns
- **Consistent architecture** - Using correct file locations and import patterns
- **Professional development standards** - TypeScript compliance and live preview verification
- **Sandra's luxury brand experience** - Maintaining design and user experience standards

**REMEMBER: "Admin dashboard redesign" = MODIFY existing admin-dashboard.tsx, NOT create new file!**
`;