const PROTECTED_FILES = [
    /server\/model-training-service\.ts/,
    /server\/image-storage-service\.ts/,
    /server\/routes\/maya-ai-routes\.ts/,
    /shared\/schema\.ts/,
    /package\.json/,
    /drizzle\.config\.ts/
];
export function validateFileAccess(filePath, isAdminBypass = false) {
    if (isAdminBypass && filePath.includes('sandra-admin-2025')) {
        return true;
    }
    for (const pattern of PROTECTED_FILES) {
        if (pattern.test(filePath)) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=file-protection.js.map