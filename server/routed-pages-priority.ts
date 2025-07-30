/**
 * ROUTED PAGES PRIORITY SYSTEM - SANDRA'S USER JOURNEY FOCUS
 * Ensures agents focus on actual routed pages in the application
 */

// Sandra's Complete User Journey Pages
export const ROUTED_PAGES_MAPPING = {
  // PRE-LOGIN PAGES
  preLogin: {
    'editorial-landing.tsx': { route: '/', priority: 10, description: 'Main landing page' },
    'about.tsx': { route: '/about', priority: 9, description: 'About Sandra and SSELFIE' },
    'pricing.tsx': { route: '/pricing', priority: 9, description: 'Pricing information' },
    'how-it-works.tsx': { route: '/how-it-works', priority: 9, description: 'Process explanation' },
    'blog.tsx': { route: '/blog', priority: 8, description: 'Blog and content' },
    'login.tsx': { route: '/login', priority: 7, description: 'Login page' }
  },
  
  // POST-LOGIN MEMBER PAGES
  postLogin: {
    'workspace.tsx': { route: '/workspace', priority: 10, description: 'Main workspace - Steps 1-4' },
    'ai-training.tsx': { route: '/ai-training', priority: 10, description: 'Step 1: Train AI Model' },
    'maya.tsx': { route: '/maya', priority: 10, description: 'Step 2: Style with Maya AI' },
    'ai-photoshoot.tsx': { route: '/ai-photoshoot', priority: 9, description: 'Step 3: AI Photoshoot (needs routing fix)' },
    'build.tsx': { route: '/build', priority: 9, description: 'Step 4: Build business (incomplete)' },
    'gallery.tsx': { route: '/gallery', priority: 8, description: 'User image gallery (not fully implemented)' },
    'flatlay-library.tsx': { route: '/flatlay-library', priority: 8, description: 'Flatlay image library' }
  },
  
  // ADMIN PAGES
  admin: {
    'admin-dashboard.tsx': { route: '/admin', priority: 10, description: 'Sandra admin dashboard' },
    'admin-consulting-agents.tsx': { route: '/admin/consulting-agents', priority: 10, description: 'Agent management' }
  }
};

// Flattened list of all routed pages for quick reference
export const ALL_ROUTED_PAGES = [
  ...Object.keys(ROUTED_PAGES_MAPPING.preLogin),
  ...Object.keys(ROUTED_PAGES_MAPPING.postLogin),
  ...Object.keys(ROUTED_PAGES_MAPPING.admin)
];

// Priority search suggestions for agents based on user request context
export const SEARCH_PRIORITY_GUIDE = {
  'user journey': ['editorial-landing.tsx', 'workspace.tsx', 'ai-training.tsx', 'maya.tsx'],
  'onboarding': ['editorial-landing.tsx', 'pricing.tsx', 'how-it-works.tsx', 'workspace.tsx'],
  'workspace flow': ['workspace.tsx', 'ai-training.tsx', 'maya.tsx', 'ai-photoshoot.tsx', 'build.tsx'],
  'landing experience': ['editorial-landing.tsx', 'about.tsx', 'pricing.tsx'],
  'member experience': ['workspace.tsx', 'ai-training.tsx', 'maya.tsx', 'gallery.tsx'],
  'admin functionality': ['admin-dashboard.tsx', 'admin-consulting-agents.tsx'],
  'authentication': ['login.tsx', 'auth-form.tsx', 'BrandedLoginButton.tsx'],
  'ai features': ['maya.tsx', 'ai-training.tsx', 'ai-photoshoot.tsx'],
  'business building': ['build.tsx', 'workspace.tsx', 'pricing.tsx']
};

// Get priority pages based on request context
export function getPriorityPages(context: string): string[] {
  const lowerContext = context.toLowerCase();
  
  // Find matching contexts
  for (const [key, pages] of Object.entries(SEARCH_PRIORITY_GUIDE)) {
    if (lowerContext.includes(key)) {
      return pages;
    }
  }
  
  // Default to most important user journey pages
  return ['editorial-landing.tsx', 'workspace.tsx', 'ai-training.tsx', 'maya.tsx', 'admin-dashboard.tsx'];
}

// Check if a page is routed (should be prioritized by agents)
export function isRoutedPage(filename: string): boolean {
  return ALL_ROUTED_PAGES.includes(filename);
}

// Get routing issues that need fixing
export const ROUTING_ISSUES = {
  'ai-photoshoot.tsx': {
    issue: 'Not properly routed in workspace step 3',
    solution: 'Add route to App.tsx and update workspace navigation',
    priority: 'HIGH'
  },
  'build.tsx': {
    issue: 'Step 4 incomplete implementation',
    solution: 'Complete build functionality and business setup',
    priority: 'HIGH'
  },
  'gallery.tsx': {
    issue: 'Not fully implemented for user images',
    solution: 'Complete gallery implementation with user image display',
    priority: 'MEDIUM'
  }
};

// Agent instruction: Focus search on these priority areas
export function getAgentSearchInstructions(requestContext: string): string {
  const priorityPages = getPriorityPages(requestContext);
  
  return `
🎯 SEARCH OPTIMIZATION FOR: "${requestContext}"

PRIORITY PAGES TO FOCUS ON:
${priorityPages.map(page => `- ${page} (${ROUTED_PAGES_MAPPING.preLogin[page]?.description || ROUTED_PAGES_MAPPING.postLogin[page]?.description || ROUTED_PAGES_MAPPING.admin[page]?.description || 'Core page'})`).join('\n')}

AVOID SEARCHING:
- Archive files (archive/ directory)  
- Test components (*test*.tsx, *spec*.tsx)
- Duplicate components (components with similar names)

FOCUS ON IMPLEMENTATION:
- Modify existing routed pages instead of creating new components
- Check actual App.tsx routing for current navigation
- Prioritize user journey flow: Landing → Signup → Workspace → Steps 1-4
`;
}

// Enhanced search prompt injection for agents
export function injectSearchOptimizationIntoPrompt(systemPrompt: string, context: string = 'general'): string {
  const searchInstructions = getAgentSearchInstructions(context);
  
  // Replace any existing architecture awareness with optimized search system
  const optimizedPrompt = systemPrompt.replace(
    /🎯 \*\*COMPLETE ARCHITECTURE AWARENESS:\*\*[\s\S]*?AVOID: archive\/ \(legacy files only\)/g,
    searchInstructions.trim()
  );
  
  // If no existing section, append search instructions
  if (optimizedPrompt === systemPrompt) {
    return systemPrompt + '\n\n' + searchInstructions;
  }
  
  return optimizedPrompt;
}