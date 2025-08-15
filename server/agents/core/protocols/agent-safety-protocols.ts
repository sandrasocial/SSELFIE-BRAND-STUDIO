import { AgentProtocolValidator } from '../validators/agent-protocol-validator';
import { ActiveProtocolEnforcer } from './active-protocol-enforcer';

// Re-export the consolidated enforcement system
export { AgentProtocolValidator, ActiveProtocolEnforcer as AgentProtocolEnforcer };

// Documentation of safety protocols
export const AGENT_SAFETY_PROTOCOLS = `
🔒 AUTOMATED SAFETY PROTOCOL SYSTEM - Updated August 9, 2025

This system is now automatically enforced through AgentProtocolEnforcer.
All file operations are validated before execution.
🚨 CRITICAL: IMPORT VALIDATION REQUIREMENTS FOR ALL AGENTS

Before creating ANY files, ALL agents must follow these safety protocols to prevent app crashes:

**MANDATORY IMPORT FIXES:**
1. ❌ NEVER use: import { useUser } from '../lib/hooks'
   ✅ ALWAYS use: import { useAuth } from "@/hooks/use-auth"

2. ❌ NEVER use: import AdminHero from '../components/AdminHero'
   ✅ ALWAYS use: import { AdminHeroSection } from "@/components/admin/AdminHeroSection"

3. ❌ NEVER use: const { user } = useUser()
   ✅ ALWAYS use: const { user } = useAuth()

4. ❌ NEVER use: <AdminHero />
   ✅ ALWAYS use: <AdminHeroSection />

5. ❌ NEVER use relative imports: ../lib/hooks, ./components/*, ../components/*
   ✅ ALWAYS use absolute imports: @/hooks/*, @/components/*, @/lib/*

**VALIDATION CHECKLIST BEFORE FILE CREATION:**
- [ ] All imports use @/ absolute paths
- [ ] No useUser hook references 
- [ ] No AdminHero component references
- [ ] No relative import paths (../ or ./)
- [ ] Components export properly with default export function

**AUTO-VALIDATION SYSTEM:**
The auto-file-writer will automatically fix common import issues, but agents should validate before creating files to prevent crashes.

**AGENT ACCOUNTABILITY:**
If you create a file that crashes the app due to broken imports, you have failed your safety protocol. Always double-check imports before file creation.
`;

export const COMPONENT_REFERENCE_GUIDE = `
**CORRECT COMPONENT REFERENCES FOR SSELFIE STUDIO:**

✅ Authentication:
import { useAuth } from "@/hooks/use-auth"
const { user } = useAuth()

✅ Admin Components:
import { AdminHeroSection } from "@/components/admin/AdminHeroSection"
<AdminHeroSection />

✅ UI Components:
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form } from "@/components/ui/form"

✅ Hooks:
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

✅ Utils:
import { cn } from "@/lib/utils"
import { queryClient } from "@/lib/queryClient"
`;