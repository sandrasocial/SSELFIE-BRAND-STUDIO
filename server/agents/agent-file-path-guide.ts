// Agent File Path Guide - Provides correct file structure guidance for all agents

export interface FilePathReference {
  category: string;
  files: Array<{
    name: string;
    path: string;
    size: string;
    description: string;
    priority: 'critical' | 'high' | 'medium';
  }>;
}

export const MEMBER_JOURNEY_FILE_MAP: FilePathReference[] = [
  {
    category: "Member Interface (Core Revenue Driver)",
    files: [
      {
        name: "workspace.tsx",
        path: "client/src/pages/workspace.tsx", 
        size: "516 lines (23,220 bytes)",
        description: "Main member workspace - core member interface",
        priority: "critical"
      }
    ]
  },
  {
    category: "Creation Flow (TRAIN → SHOOT → STYLE → BUILD)",
    files: [
      {
        name: "simple-training.tsx", 
        path: "client/src/pages/simple-training.tsx",
        size: "58,438 bytes",
        description: "TRAIN step - member training interface",
        priority: "critical"
      },
      {
        name: "ai-photoshoot.tsx",
        path: "client/src/pages/ai-photoshoot.tsx", 
        size: "96,558 bytes",
        description: "SHOOT step - AI photoshoot interface",
        priority: "critical"
      },
      {
        name: "build.tsx",
        path: "client/src/pages/build.tsx",
        size: "240 bytes", 
        description: "BUILD step - build interface",
        priority: "critical"
      },
      {
        name: "victoria-builder.tsx",
        path: "client/src/pages/victoria-builder.tsx",
        size: "30,806 bytes",
        description: "Advanced builder - enhanced build interface", 
        priority: "high"
      }
    ]
  },
  {
    category: "Discovery & Conversion", 
    files: [
      {
        name: "editorial-landing.tsx",
        path: "client/src/pages/editorial-landing.tsx",
        size: "26,195 bytes",
        description: "Main editorial landing experience",
        priority: "critical"
      },
      {
        name: "pricing.tsx", 
        path: "client/src/pages/pricing.tsx",
        size: "21,427 bytes",
        description: "Pricing and subscription plans",
        priority: "critical"
      },
      {
        name: "checkout.tsx",
        path: "client/src/pages/checkout.tsx", 
        size: "9,417 bytes",
        description: "Payment and checkout flow",
        priority: "high"
      },
      {
        name: "about.tsx",
        path: "client/src/pages/about.tsx",
        size: "13,159 bytes", 
        description: "About page and brand story",
        priority: "medium"
      }
    ]
  },
  {
    category: "Galleries & Asset Libraries",
    files: [
      {
        name: "sselfie-gallery.tsx",
        path: "client/src/pages/sselfie-gallery.tsx",
        size: "26,293 bytes",
        description: "Member photo gallery interface", 
        priority: "high"
      },
      {
        name: "flatlay-library.tsx", 
        path: "client/src/pages/flatlay-library.tsx",
        size: "5,987 bytes",
        description: "Member asset library interface",
        priority: "high"
      }
    ]
  }
];

export class AgentFilePathGuide {
  /**
   * Get correct file path for a member journey step
   */
  static getMemberJourneyPath(step: string): string | null {
    const stepMap: Record<string, string> = {
      'workspace': 'client/src/pages/workspace.tsx',
      'train': 'client/src/pages/simple-training.tsx', 
      'training': 'client/src/pages/simple-training.tsx',
      'shoot': 'client/src/pages/ai-photoshoot.tsx',
      'photoshoot': 'client/src/pages/ai-photoshoot.tsx',
      'build': 'client/src/pages/build.tsx',
      'builder': 'client/src/pages/victoria-builder.tsx',
      'gallery': 'client/src/pages/sselfie-gallery.tsx',
      'flatlay': 'client/src/pages/flatlay-library.tsx',
      'landing': 'client/src/pages/editorial-landing.tsx',
      'pricing': 'client/src/pages/pricing.tsx',
      'checkout': 'client/src/pages/checkout.tsx'
    };
    
    return stepMap[step.toLowerCase()] || null;
  }
  
  /**
   * Provide path correction suggestions for common mistakes
   */
  static suggestCorrectPath(attemptedPath: string): string {
    // Common directory mistakes agents make
    const corrections: Record<string, string> = {
      'client/src/pages/member/': 'Individual files at client/src/pages/ (no member subdirectory)',
      'client/src/pages/workspace/': 'client/src/pages/workspace.tsx (single file, not directory)',
      'client/src/pages/training/': 'client/src/pages/simple-training.tsx (single file)', 
      'client/src/pages/gallery/': 'client/src/pages/sselfie-gallery.tsx (single file)',
      'pages/member/': 'client/src/pages/ (individual .tsx files)',
      '**/member/**': 'client/src/pages/ (files are at root level)'
    };
    
    for (const [mistake, correction] of Object.entries(corrections)) {
      if (attemptedPath.includes(mistake.replace('*', ''))) {
        return correction;
      }
    }
    
    return 'Check client/src/pages/ for individual .tsx files (no subdirectories)';
  }
  
  /**
   * Get all member journey files for comprehensive access
   */
  static getAllMemberJourneyFiles(): string[] {
    return MEMBER_JOURNEY_FILE_MAP
      .flatMap(category => category.files)
      .filter(file => file.priority === 'critical' || file.priority === 'high') 
      .map(file => file.path);
  }
  
  /**
   * Validate if a path exists in the expected structure
   */
  static validateMemberJourneyPath(path: string): { valid: boolean; suggestion?: string } {
    const allValidPaths = MEMBER_JOURNEY_FILE_MAP
      .flatMap(category => category.files)
      .map(file => file.path);
      
    if (allValidPaths.includes(path)) {
      return { valid: true };
    }
    
    return {
      valid: false,
      suggestion: this.suggestCorrectPath(path)
    };
  }
}