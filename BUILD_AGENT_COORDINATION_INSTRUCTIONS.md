# BUILD FEATURE - AI AGENT TEAM COORDINATION PLAN
**Date:** July 19, 2025  
**Sandra's Vision:** Test AI agent team working together step-by-step, "all hands on board"

## 🎯 MISSION: DUPLICATE OPTIMIZEDVISUALEDITOR → SIMPLIFIED BUILD INTERFACE

### What We're Building
**Location:** Inside workspace (`/build` page)  
**Based On:** `OptimizedVisualEditor.tsx` structure  
**Simplified For:** Non-technical users building websites with Victoria  
**Preserve:** Existing brand onboarding flow (users data already stored)

### OptimizedVisualEditor Structure Analysis
**Current Admin Visual Editor Components:**
1. **3-Panel Layout**: PanelGroup with resizable panels
2. **Left Panel**: FileTreeExplorer + MultiTabEditor (CODE/TECHNICAL)
3. **Center Panel**: Live iframe preview with desktop/mobile toggle
4. **Right Panel**: Agent chat with 10 agents + Gallery tabs
5. **Agent System**: Aria, Zara, Rachel, Ava, Quinn, Sophia, Martha, Diana, Wilma, Olga
6. **Gallery Integration**: AI images + flatlay collections
7. **Real-time Updates**: Live preview updates from agent changes

### BUILD Simplification Requirements
**KEEP for User BUILD:**
- ✅ 3-panel layout structure
- ✅ Live iframe preview (center)
- ✅ Victoria chat interface (right panel)
- ✅ Gallery integration (AI images + flatlays)
- ✅ Real-time preview updates
- ✅ Mobile/desktop preview toggle
- ✅ Auto-generated website on entry

**REMOVE for User BUILD:**
- ❌ FileTreeExplorer (left panel)
- ❌ MultiTabEditor code editing
- ❌ Technical agents (only Victoria)
- ❌ File tree navigation
- ❌ Raw code access
- ❌ Developer tools

**REPLACE with User Features:**
- 🔄 Left Panel: Victoria conversation + website page navigation
- 🔄 Victoria Chat: Enhanced with website building context
- 🔄 Gallery: Photo upload + selection for website
- 🔄 Preview: Shows auto-generated website from onboarding data

## 📋 AGENT COORDINATION PLAN

### Phase 1: Architecture Analysis (Aria → Zara)
**Aria (Design AI) Tasks:**
1. Analyze OptimizedVisualEditor component structure
2. Design simplified 3-panel layout for BUILD
3. Create Victoria chat interface mockup
4. Design website page navigation system
5. Plan gallery integration for website building

**Zara (Dev AI) Tasks:**
1. Study OptimizedVisualEditor technical implementation
2. Plan component simplification strategy
3. Design database integration for BUILD
4. Plan auto-generated website system
5. Create technical architecture for Victoria website building

### Phase 2: Victoria Enhancement (Rachel)
**Rachel (Voice AI) Tasks:**
1. Study current Victoria chat personality
2. Design Victoria website building conversation flow
3. Create Victoria's proactive website suggestions
4. Plan website building guidance system
5. Design page-by-page refinement process

### Phase 3: Implementation (All Agents)
**Coordinated Implementation:**
1. **Aria**: Create simplified BUILD visual interface
2. **Zara**: Implement backend for auto-generated websites
3. **Rachel**: Enhance Victoria for website building context
4. **Victoria**: Test user experience and journey optimization

## 🎯 SYSTEMATIC TESTING APPROACH

### Step 1: Agent Task Assignment
I will use Sandra's admin authentication to assign specific tasks to each agent via `/api/admin/agent-chat-bypass`

### Step 2: Verification System
- Monitor agent responses in database
- Verify actual file creation and implementation
- Test functionality after each agent contribution
- Ensure no conflicts with existing components

### Step 3: Integration Testing
- Test BUILD workflow from workspace entry
- Verify auto-generated websites appear
- Test Victoria website building conversation
- Ensure gallery integration works properly

## 🔧 IMPLEMENTATION SPECIFICATIONS

### New BUILD Component Structure
```
BuildVisualStudio.tsx (New Component)
├── Left Panel: VictoriaWebsiteChat + PageNavigation
├── Center Panel: LiveWebsitePreview (iframe)
└── Right Panel: WebsiteGallery (AI images + uploads)
```

### Database Integration
**Existing Schema:** `user_website_onboarding` table ✅  
**Auto-Website Generation:** Based on onboarding data  
**Victoria Context:** Website building conversation history  
**Page Management:** Home, About, Services, Contact navigation

### Victoria Enhancement Requirements
**New Capabilities:**
- Remember user onboarding data
- Guide through website page creation
- Suggest content based on business type
- Handle payment/booking integrations
- Create complete 4-page websites

**Conversation Flow:**
1. "I see you're in [business type] targeting [audience]..."
2. "Let me create your complete website..."
3. "Should we add your freebie here?"
4. "Let's enhance your services page..."
5. "Your website is ready - let's publish!"

## 🚀 TESTING PHASES

### Phase 1: Design Coordination Test
**Test Aria's Analysis:**
- Assign OptimizedVisualEditor analysis task
- Verify design mockup creation
- Test simplified layout proposals

### Phase 2: Technical Implementation Test
**Test Zara's Development:**
- Assign component creation task
- Verify actual file implementation
- Test database integration

### Phase 3: Voice Enhancement Test
**Test Rachel's Victoria Enhancement:**
- Assign Victoria personality enhancement
- Verify website building conversation flow
- Test proactive suggestion system

### Phase 4: Complete Integration Test
**Test Full Agent Coordination:**
- All agents working together
- Complete BUILD feature implementation
- User journey testing from workspace to published website

## ✅ SUCCESS CRITERIA

### Agent Coordination Success
- [ ] All agents receive and acknowledge specific tasks
- [ ] Agents create actual files (verified in filesystem)
- [ ] No independent building - everything coordinated
- [ ] Agent responses properly stored in database

### Technical Implementation Success
- [ ] BuildVisualStudio component created and functional
- [ ] Auto-generated websites appear on BUILD entry
- [ ] Victoria chat enhanced for website building
- [ ] Gallery integration working for website photos
- [ ] Live preview updates from Victoria changes

### User Experience Success
- [ ] BUILD accessible from workspace (4th step)
- [ ] Non-technical interface (no code/files shown)
- [ ] Victoria guides users through website creation
- [ ] Complete websites created in 1-2 conversations
- [ ] Publishing system ready for username.sselfie.ai

## 🔄 COORDINATION WORKFLOW

### Agent Communication Method
**Endpoint:** `/api/admin/agent-chat-bypass`  
**Authentication:** Sandra's admin session  
**Task Assignment:** Specific, measurable deliverables  
**Verification:** Database monitoring + file creation confirmation

### Workflow Stages
1. **Task Assignment** → Agent receives specific BUILD task
2. **Implementation** → Agent creates/modifies files
3. **Verification** → Confirm completion in filesystem
4. **Integration** → Test with other agent contributions
5. **Next Phase** → Move to next agent in sequence

---

**READY TO BEGIN:** Sandra, approve this plan and I'll start systematic agent coordination to build the BUILD feature correctly using your AI agent team, preserving the brand onboarding flow and duplicating your OptimizedVisualEditor structure but simplified for users.