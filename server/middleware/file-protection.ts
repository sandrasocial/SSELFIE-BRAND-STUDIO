// Protected file patterns that agents cannot modify
const PROTECTED_FILES = [
  /server\/model-training-service\.ts/,
  /server\/image-storage-service\.ts/,
  /server\/routes\/maya-ai-routes\.ts/,
  /shared\/schema\.ts/, // Only Sandra can modify schema
  /package\.json/,
  /drizzle\.config\.ts/
];

export function validateFileAccess(filePath: string, isAdminBypass: boolean = false): boolean {
  if (isAdminBypass && filePath.includes('sandra-admin-2025')) {
    return true; // Sandra can override all protections
  }
  
  for (const pattern of PROTECTED_FILES) {
    if (pattern.test(filePath)) {
      return false;
    }
  }
  
  return true;
}