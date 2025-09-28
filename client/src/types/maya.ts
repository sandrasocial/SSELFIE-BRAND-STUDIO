// Maya module types
export interface MayaChatMessage {
  id: string;
  role: 'user' | 'maya' | 'system';
  content: string;
  timestamp: number;
  showUpload?: boolean;
  conceptCards?: ConceptCard[];
}

export interface ConceptCard {
  id: string;
  title: string;
  prompt: string;
  image?: string;
  isExpanded?: boolean;
}

export interface MayaContextData {
  stylePreferences?: string[];
  businessType?: string;
  trainingComplete?: boolean;
}

export interface MayaChatState {
  messages: MayaChatMessage[];
  isTyping: boolean;
  sendMessage: (messageText: string) => Promise<void>;
  setIsTyping: (typing: boolean) => void;
  error: string | null;
}