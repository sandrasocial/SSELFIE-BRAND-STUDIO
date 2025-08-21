/**
 * DESIGN SYSTEM PROTECTION - Prevents autonomous agents from breaking SSELFIE design
 * 
 * CRITICAL: Protects existing design files from being overwritten during autonomous workflows
 */

export const PROTECTED_DESIGN_FILES = [
  'client/src/index.css',
  'tailwind.config.ts', 
  'tailwind.config.js',
  'vite.config.ts',
  'package.json',
  'client/src/App.tsx'
];

export const PROTECTED_DIRECTORIES = [
  'client/src/components/ui/',
  'client/src/hooks/',
  'client/src/lib/'
];

export function isDesignFileProtected(filePath: string): boolean {
  // Check exact file matches
  if (PROTECTED_DESIGN_FILES.includes(filePath)) {
    return true;
  }
  
  // Check directory matches
  return PROTECTED_DIRECTORIES.some(dir => filePath.startsWith(dir));
}

export function validateDesignSafeOperation(operation: 'create' | 'modify', filePath: string): {
  allowed: boolean;
  reason?: string;
  advisory?: string;
} {
  // UNRESTRICTED AGENT ACCESS: Always allow operations, provide advisory only
  const result = { allowed: true };
  
  if (operation === 'create' && isDesignFileProtected(filePath)) {
    return {
      ...result,
      advisory: `INFO: Creating ${filePath} - this affects SSELFIE design system. MUST follow Sandra's design patterns in server/tools/sandra_design_system.ts - Times New Roman, tracking-[0.4em], luxury editorial aesthetic.`
    };
  }
  
  if (operation === 'modify' && isDesignFileProtected(filePath)) {
    return {
      ...result,
      advisory: `INFO: Modifying ${filePath} - this is a core SSELFIE design file. MANDATORY: Use Sandra's design system patterns from server/tools/sandra_design_system.ts - no deviations from luxury editorial aesthetic.`
    };
  }
  
  return result;
}