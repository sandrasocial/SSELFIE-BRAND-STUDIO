export const PROTECTED_DESIGN_FILES = [
    'client/src/index.css',
    'tailwind.config.ts',
    'tailwind.config',
    'vite.config.ts',
    'package.json',
    'client/src/App.tsx'
];
export const PROTECTED_DIRECTORIES = [
    'client/src/components/ui/',
    'client/src/hooks/',
    'client/src/lib/'
];
export function isDesignFileProtected(filePath) {
    if (PROTECTED_DESIGN_FILES.includes(filePath)) {
        return true;
    }
    return PROTECTED_DIRECTORIES.some(dir => filePath.startsWith(dir));
}
export function validateDesignSafeOperation(operation, filePath) {
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
//# sourceMappingURL=design_system_protection.js.map