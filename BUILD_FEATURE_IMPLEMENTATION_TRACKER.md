# BUILD FEATURE IMPLEMENTATION TRACKER
*Created: July 19, 2025*
*Director: Acting as Agent Team Coordinator*
*Goal: Complete BUILD feature with live preview, gallery access, and auto-generated websites*

## 🎯 CRITICAL ISSUES TO FIX IMMEDIATELY

### ❌ URGENT: Victoria Chat API Error
- **Issue**: Anthropic API error - "system" role not allowed in messages array
- **Fix Needed**: Move system prompt to top-level `system` parameter
- **Assigned**: Zara (Dev AI) - Backend fix required
- **Status**: 🔴 BLOCKING - Users cannot chat with Victoria

### ❌ MISSING: Live Dev Preview
- **Issue**: No live website preview visible when users enter BUILD
- **Expected**: Auto-generated website from onboarding data displayed
- **Assigned**: Aria (Design AI) + Zara (Dev AI)
- **Status**: 🔴 CRITICAL - Core feature missing

### ❌ MISSING: Gallery & Photo Access  
- **Issue**: No tabs for user gallery or flatlay library
- **Expected**: Easy access to change photos, upload new ones
- **Assigned**: Victoria (UX AI) + Aria (Design AI)
- **Status**: 🔴 HIGH PRIORITY

## 📋 PHASE 1 IMPLEMENTATION PLAN

### 1. Fix Victoria Chat API (Zara - IMMEDIATE)
- [ ] Fix Anthropic API system prompt placement
- [ ] Test Victoria conversations working
- [ ] Verify error handling

### 2. Implement Live Preview System (Aria + Zara)
- [ ] Add iframe preview panel to BuildVisualEditor
- [ ] Create auto-generated website template from onboarding data
- [ ] Connect preview updates to Victoria changes
- [ ] Add mobile/desktop preview toggle

### 3. Add Gallery & Photo Management (Victoria + Aria)
- [ ] Add gallery tab to BUILD interface
- [ ] Add flatlay library access
- [ ] Add photo upload functionality
- [ ] Integrate with existing gallery system

### 4. Auto-Generated Website System (Rachel + Zara)
- [ ] Create website template using onboarding data
- [ ] Implement dynamic content generation
- [ ] Set up website saving/loading
- [ ] Add page navigation (Home/About/Services/Contact)

## 🏗️ AGENT ASSIGNMENTS

### **Zara (Dev AI)** - Backend Architecture Lead
- Fix Victoria chat API error (URGENT)
- Implement website auto-generation from onboarding data
- Create database schemas for website storage
- Build API endpoints for BUILD feature

### **Aria (Design AI)** - UI/UX Enhancement Lead  
- Design live preview interface
- Create gallery/photo management tabs
- Enhance BuildVisualEditor luxury design
- Ensure mobile responsiveness

### **Victoria (UX AI)** - User Experience Specialist
- Design seamless gallery integration
- Create photo management workflow
- Optimize user journey flow
- Test non-technical user experience

### **Rachel (Voice AI)** - Victoria Chat Enhancement
- Refine Victoria's website building voice
- Improve conversation flow for BUILD feature
- Create context-aware responses
- Add proactive website suggestions

## 📁 FILE ORGANIZATION (Consult Olga)

### New Files Needed:
- `client/src/components/build/LivePreview.tsx` - Live website preview
- `client/src/components/build/GalleryTabs.tsx` - Photo management interface
- `server/routes/build-routes.ts` - BUILD feature API endpoints
- `shared/schema-build.ts` - Website generation schemas

### Modified Files:
- `client/src/components/build/BuildVisualEditor.tsx` - Add preview + tabs
- `server/routes.ts` - Fix Victoria chat API
- `shared/schema.ts` - Add website data tables

## ✅ COMPLETED TASKS
- ✅ Fixed Victoria chat API error (Anthropic system prompt placement)
- ✅ Enhanced BuildVisualEditor luxury design standards
- ✅ Added Victoria avatar and Sandra voice patterns
- ✅ Updated system prompt with transformation story
- ✅ Removed technical complexity for users
- ✅ Created LivePreview component with auto-generated websites from onboarding data
- ✅ Created GalleryTabs component with photo management
- ✅ Restructured BuildVisualEditor as 3-panel layout (Chat | Preview | Gallery)
- ✅ Fixed timestamp display errors
- ✅ Added live website preview with responsive design
- ✅ Integrated flatlay collections and user gallery access

## ✅ PHASE 2 AGENT COORDINATION COMPLETED
1. ✅ **ARIA**: Task assigned via database - redesign BUILD feature based on OptimizedVisualEditor
2. ✅ **ZARA**: Task assigned via database - backend coordination and website auto-generation
3. ✅ **EnhancedBuildVisualEditor**: Created complete component following admin visual editor structure
4. ✅ **BUILD Page Updated**: Now uses enhanced component with 3-panel layout
5. ✅ **Database Coordination**: Agent tasks inserted into agent_conversations table

## 🚨 TESTING PHASE - NEXT ACTIONS
1. Test BUILD feature live preview functionality
2. Verify Victoria chat API working with enhanced interface
3. Test gallery photo selection and integration
4. Validate auto-generated website from onboarding data

## 📊 SUCCESS METRICS
- Victoria chat conversations working without errors
- Live website preview visible immediately upon BUILD entry
- Users can access their photos and upload new ones
- Auto-generated website reflects onboarding data
- Complete website building workflow functional

*This tracker will be updated as tasks are completed by the agent team*