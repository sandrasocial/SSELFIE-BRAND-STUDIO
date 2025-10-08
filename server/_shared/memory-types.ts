export interface ConversationMemory {
  recentPreferences: string[];
  favoriteCategories: string[];
  stylingEvolution: Array<{
    timestamp: Date;
    event: string;
    notes?: string;
  }>;
  emotionalContext: string;
  brandingConsistency: {
    consistentCategories: boolean;
    brandEvolution: 'early' | 'developing' | 'established';
    styleMaturity: 'exploring' | 'established';
  };
  technicalPreferences: {
    preferredStyles?: string[];
    avoidedStyles?: string[];
    colorPalette?: string[];
    [key: string]: string[] | undefined;
  };
}

export interface SessionMetadata {
  totalSessions: number;
  averageSessionLength: number;
  lastInteractionDate: Date | null;
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  adaptationTriggers: string[];
}