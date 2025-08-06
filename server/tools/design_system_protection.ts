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
} {
  if (operation === 'create' && isDesignFileProtected(filePath)) {
    return {
      allowed: false,
      reason: `DESIGN PROTECTION: Cannot create ${filePath} - conflicts with existing SSELFIE design system`
    };
  }
  
  if (operation === 'modify' && isDesignFileProtected(filePath)) {
    return {
      allowed: false, 
      reason: `DESIGN PROTECTION: Cannot modify ${filePath} - protected SSELFIE design file`
    };
  }
  
  return { allowed: true };
}