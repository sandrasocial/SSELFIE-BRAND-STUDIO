export function redirectToHttps(): void {
  if (location.protocol === 'http:' && location.hostname !== 'localhost') {
    location.href = location.href.replace('http:', 'https:');
  }
}

export function detectBrowserIssues(): string[] {
  const issues: string[] = [];
  
  if (!window.fetch) {
    issues.push('Fetch API not supported');
  }
  
  if (!window.Promise) {
    issues.push('Promise not supported');
  }
  
  return issues;
}

export function showDomainHelp(): void {
  try {
    const issues = detectBrowserIssues();
    if (issues.length === 0) return; // No issues detected — don't warn
    console.warn('Browser compatibility issues detected:', issues);
  } catch {
    // Never block runtime if detection fails — be silent in production
  }
}