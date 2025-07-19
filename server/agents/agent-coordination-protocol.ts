// Agent Coordination Protocol - Olga Integration for File Management
// Prevents duplicates and maintains organized file structure

export const AGENT_COORDINATION_PROTOCOL = `
## 🤝 AGENT COORDINATION PROTOCOL - OLGA INTEGRATION

**CRITICAL: ALL AGENTS MUST CONSULT OLGA BEFORE FILE CREATION**

### **MANDATORY COORDINATION WORKFLOW:**

**BEFORE CREATING ANY FILE, COMPONENT, OR ROUTE:**

1. **Consult Olga First**: "Olga, I need to create [FILE_TYPE] for [PURPOSE]. Where should this go and does it already exist?"

2. **Wait for Olga's Analysis**:
   - File location recommendation
   - Duplicate detection results
   - Architecture compliance check
   - Import path suggestions

3. **Proceed Only After Olga's Approval**:
   - Use Olga's recommended file path
   - Follow Olga's organizational structure
   - Implement Olga's import path suggestions

### **COORDINATION SCENARIOS:**

**NEW COMPONENT CREATION:**
Agent: "Olga, I need to create a LoginForm component. Where should this go?"
Olga: "Place it in /client/src/components/auth/LoginForm.tsx. No duplicates found. Use import '@/components/auth/LoginForm'"

**NEW PAGE CREATION:**
Agent: "Olga, I need to create a dashboard page for admin users."
Olga: "Similar admin dashboard already exists at /client/src/pages/admin-dashboard.tsx. Consider enhancing existing instead of creating duplicate."

**NEW UTILITY CREATION:**
Agent: "Olga, I need to create date formatting utilities."
Olga: "Date utilities already exist in /client/src/lib/date-utils.ts. Add your functions there to maintain consolidation."

### **BENEFITS OF COORDINATION:**

**PREVENTS DUPLICATES:**
- No more scattered similar components
- Consolidated utility functions
- Unified styling approaches

**MAINTAINS ARCHITECTURE:**
- Consistent file organization
- Proper import hierarchies
- Clean dependency trees

**REDUCES CONFUSION:**
- Clear file locations
- Logical grouping
- Easy navigation

**IMPROVES PERFORMANCE:**
- Optimized bundle sizes
- Faster builds
- Better tree shaking

### **OLGA'S COORDINATION RESPONSES:**

**LOCATION RECOMMENDATIONS:**
- "Place this in /client/src/components/ui/ for reusable UI components"
- "This belongs in /client/src/pages/ as a new route"
- "Add this to existing /client/src/lib/utils.ts file"

**DUPLICATE DETECTION:**
- "Similar component exists at [PATH]. Consider enhancing instead of duplicating"
- "This functionality already exists in [FILE]. Suggest consolidation"
- "No duplicates found. Safe to create at recommended location"

**ARCHITECTURE GUIDANCE:**
- "This violates our component hierarchy. Recommend [ALTERNATIVE]"
- "Import path should be '@/components/ui/Button' for consistency"
- "Consider breaking this into smaller, focused components"

### **AGENT COMPLIANCE REQUIREMENTS:**

**ALL AGENTS MUST:**
1. Ask Olga before creating ANY new file
2. Wait for Olga's analysis and recommendations
3. Follow Olga's organizational structure
4. Use Olga's recommended import paths
5. Report back to Olga after successful creation

**EXAMPLE WORKFLOWS:**

**Victoria (UX Designer)**: 
"Olga, I need to create a hero section component for the landing page."
→ Waits for Olga's recommendation
→ Creates component at Olga's suggested location
→ "Olga, hero component created successfully at your recommended path"

**Zara (Dev AI)**:
"Olga, I need to create API utilities for user authentication."
→ Waits for Olga's analysis
→ Enhances existing auth utilities instead of creating new file
→ "Olga, authentication utilities enhanced in existing file as suggested"

This coordination system ensures zero file conflicts, maintains clean architecture, and creates a self-organizing codebase that scales beautifully.
`;

export default AGENT_COORDINATION_PROTOCOL;