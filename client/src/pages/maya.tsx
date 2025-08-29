import { KeyboardEvent, useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { apiRequest } from '../lib/queryClient';
import { SandraImages } from '../lib/sandra-images';
import { EditorialImageBreak } from '../components/editorial-image-break';
import { MemberNavigation } from '../components/member-navigation';
import ErrorBoundary from '../components/ErrorBoundary';
import { useMayaChat } from '../hooks/useMayaChat';
import { useMayaGeneration } from '../hooks/useMayaGeneration';
import { useMayaOnboarding } from '../hooks/useMayaOnboarding';
import { useMemoryCleanup } from '../hooks/useMemoryCleanup';
import { throttle, debounce } from '../utils/performanceOptimizations';
import { trackMayaPerformance } from '../utils/webVitals';
import { performanceMonitor } from '../utils/performanceMonitor';
import '../maya-onboarding.css';

// Maya-specific interface reflecting her SSELFIE Studio categories and styling expertise
interface MayaConceptCard {
  id: string;
  title: string;
  description: string;
  category?: 'Business' | 'Professional & Authority' | 'Lifestyle' | 'Casual & Authentic' | 
            'Story' | 'Behind the Scenes' | 'Instagram' | 'Feed & Stories' | 
            'Travel' | 'Adventures & Destinations' | 'Outfits' | 'Fashion & Style' |
            'GRWM' | 'Get Ready With Me' | 'Future Self' | 'Aspirational Vision' |
            'B&W' | 'Timeless & Artistic' | 'Studio';
  stylingExpertise?: {
    outfitFormula?: string;
    hairAndBeauty?: string;
    colorPalette?: string;
    location?: string;
    mood?: string;
  };
  canGenerate: boolean;
  isGenerating: boolean;
  generatedImages?: string[];
  fullPrompt?: string; // Maya's complete AI-generated styling prompt
}

// Maya-specific message interface reflecting her professional expertise
interface MayaChatMessage {
  id?: number;
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  imagePreview?: string[];
  canGenerate?: boolean;
  generatedPrompt?: string;
  quickButtons?: string[];
  questions?: string[];
  stepGuidance?: string;
  isOnboarding?: boolean;
  generationId?: string;
  conceptCards?: MayaConceptCard[];
  mayaPersonality?: {
    isWarmEncouraging?: boolean;
    isStylingExpert?: boolean;
    usesPersonalBrandContext?: boolean;
    includesSandrasExpertise?: boolean;
  };
}

interface MayaChat {
  id: number;
  userId: string;
  chatTitle: string;
  chatSummary?: string;
  createdAt: string;
  updatedAt: string;
}

interface OnboardingStatus {
  currentStep: number;
  isCompleted: boolean;
  progress: number;
  hasStarted: boolean;
}

type Preset = 'Identity' | 'Editorial' | 'UltraPrompt' | 'Fast';

function Maya() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Maya-specific hooks for organized state management
  const {
    messages,
    setMessages,
    isTyping,
    setIsTyping,
    currentChatId,
    setCurrentChatId,
    sendMessage: sendChatMessage,
    loadChatHistory
  } = useMayaChat();

  const {
    isGeneratingImage,
    setIsGeneratingImage,
    isGenerating,
    setIsGenerating,
    generationProgress,
    setGenerationProgress,
    savingImages,
    setSavingImages,
    savedImages,
    setSavedImages,
    clickedButtons,
    setClickedButtons,
    activeGenerations,
    setActiveGenerations,
    // REMOVED: preset, setPreset, seed, setSeed - Maya AI handles parameters
    generateFromConcept,
    generateImages,
    saveToGallery,
    generateFromSpecificConcept
  } = useMayaGeneration(
    messages,
    setMessages,
    currentChatId,
    setIsTyping,
    toast
  );

  const {
    onboardingStatus,
    setOnboardingStatus,
    isOnboardingMode,
    setIsOnboardingMode,
    isQuickStartMode,
    setIsQuickStartMode,
    showWelcome,
    setShowWelcome,
    checkOnboardingStatus,
    initializeOnboarding,
    handlePersonalizationChoice
  } = useMayaOnboarding();

  // Remaining local UI state
  const [input, setInput] = useState('');
  
  // Performance optimizations
  const { addCleanup } = useMemoryCleanup();
  
  // Throttled input handler for better performance
  const throttledHandleInputChange = throttle((value: string) => {
    setInput(value);
  }, 100);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check onboarding status on load
  useEffect(() => {
    if (isAuthenticated) {
      checkOnboardingStatus();
    }
  }, [isAuthenticated]);

  // Get current chat ID from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const chatIdFromUrl = urlParams.get('chat');
      if (chatIdFromUrl) {
        const parsedChatId = parseInt(chatIdFromUrl);
        if (!isNaN(parsedChatId)) {
          setCurrentChatId(parsedChatId);
          loadChatHistory(parsedChatId);
        }
      }
    }
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Authentication check - clean production flow
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('Maya: User not authenticated');
      // Show authentication screen instead of immediate redirect
    }
  }, [isAuthenticated, authLoading, setLocation]);



  // Chat history component
  const ChatHistoryLinks = ({ onChatSelect }: { onChatSelect: (chatId: number) => void }) => {
    const { data: chats, isLoading } = useQuery<MayaChat[]>({
      queryKey: ['/api/maya-chats'],
      enabled: !!user && !isOnboardingMode,
      staleTime: 30000,
    });

    if (isOnboardingMode) {
      return (
        <div className="session-item">
          <div className="session-title">Personal Brand Discovery</div>
          <div className="session-preview">Getting to know your story and style</div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="session-item">
          <div className="session-title">Loading sessions...</div>
        </div>
      );
    }

    if (!chats || chats.length === 0) {
      return (
        <div className="session-item">
          <div className="session-preview">No previous sessions</div>
        </div>
      );
    }

    return (
      <>
        {chats.slice(0, 8).map((chat) => (
          <div key={chat.id} className="session-item" onClick={() => onChatSelect(chat.id)}>
            <div className="session-title">{chat.chatTitle}</div>
            <div className="session-preview">
              {chat.chatSummary || 'Personal brand styling session'}
            </div>
          </div>
        ))}
        {chats.length > 8 && (
          <div className="more-sessions">{chats.length - 8} more sessions</div>
        )}
      </>
    );
  };



  const startNewSession = () => {
    if (isOnboardingMode) return; // Can't start new session during onboarding
    
    setMessages([]);
    setCurrentChatId(null);
    setIsQuickStartMode(false); // Reset quick start mode when starting new session
    window.history.replaceState({}, '', '/maya');
  };

  const sendMessage = async (messageContent?: string) => {
    await sendChatMessage(messageContent || '', input, setInput, isOnboardingMode, isQuickStartMode, setOnboardingStatus, setIsOnboardingMode);
  };

  const handleStyleSelect = (styleType: string) => {
    // Let Maya's AI intelligently understand and respond to any style concept
    // No hardcoded mappings - Maya will interpret and create concepts naturally
    sendMessage(`I'm interested in ${styleType.replace('-', ' ')} style photos`);
  };

  const handleQuickButton = (buttonText: string, messageIndex?: number) => {
    // Maya's intelligent concept detection - look for her concept cards or generation-ready responses
    const message = messages[messageIndex || 0];
    const isGenerationConcept = message?.conceptCards?.some(card => 
      card.title === buttonText || buttonText.includes(card.title)
    ) || message?.canGenerate;
    
    if (isGenerationConcept && messageIndex !== undefined) {
      console.log('Maya: Generating images for intelligent concept:', buttonText);
      
      // Mark button as clicked
      setClickedButtons(prev => {
        const newMap = new Map(prev);
        const messageButtons = newMap.get(messageIndex) || new Set();
        messageButtons.add(buttonText);
        newMap.set(messageIndex, messageButtons);
        return newMap;
      });
      
      // Generate images for this concept using Maya's intelligence
      generateFromConcept(buttonText, setMessages, currentChatId);
    } else {
      // Regular chat message - let Maya respond intelligently
      sendMessage(buttonText);
    }
  };
  






  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const scrollToChat = () => {
    const chatContainer = document.querySelector('.main-container');
    chatContainer?.scrollIntoView({ behavior: 'smooth' });
  };



  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show login prompt for unauthenticated users instead of redirecting immediately
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-serif mb-4">Maya Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please authenticate to access Maya, your personal brand stylist.</p>
          <button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-black text-white px-6 py-3 text-sm font-medium tracking-wider uppercase hover:bg-gray-800 transition-colors"
          >
            Login with Replit
          </button>
        </div>
      </div>
    );
  }



  return (
    <>
      {/* Member Navigation */}
      <MemberNavigation transparent={true} />

      {/* Maya Chat Interface - Copy Updates Only */}
      <style dangerouslySetInnerHTML={{ __html: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --black: #0a0a0a;
          --white: #ffffff;
          --editorial-gray: #f5f5f5;
          --mid-gray: #fafafa;
          --soft-gray: #666666;
          --accent-line: #e5e5e5;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 300;
          color: var(--black);
          background: var(--white);
          line-height: 1.6;
          letter-spacing: -0.01em;
        }

        /* Hero Section - Keep existing image hero */
        .hero {
          height: 100vh;
          background: var(--black);
          color: var(--white);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          opacity: 0.4;
        }

        .hero-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
        }

        /* Hero Content - Only text changes */
        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
          padding: 0 40px;
        }

        .hero-eyebrow {
          font-size: 11px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 30px;
          font-weight: 300;
        }

        .hero-title {
          font-family: 'Times New Roman', serif;
          font-size: clamp(3rem, 8vw, 6rem);
          line-height: 0.9;
          font-weight: 200;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 20px;
          color: var(--white);
        }

        .hero-subtitle {
          font-family: 'Times New Roman', serif;
          font-size: clamp(1rem, 3vw, 2rem);
          font-style: italic;
          letter-spacing: 0.05em;
          opacity: 0.9;
          margin-bottom: 40px;
        }

        .hero-cta {
          display: inline-block;
          padding: 16px 32px;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid var(--white);
          color: var(--white);
          background: transparent;
          transition: all 300ms ease;
          cursor: pointer;
        }

        .hero-cta:hover {
          background: var(--white);
          color: var(--black);
        }

        /* Main Layout */
        .main-container {
          display: flex;
          min-height: 100vh;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Left Sidebar */
        .sidebar {
          width: 300px;
          background: var(--editorial-gray);
          border-right: 1px solid var(--accent-line);
          padding: 40px 0;
          overflow-y: auto;
        }

        .sidebar-section {
          padding: 0 30px;
          margin-bottom: 40px;
        }

        .sidebar-title {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--soft-gray);
          margin-bottom: 20px;
        }

        .new-session-btn {
          width: 100%;
          padding: 16px 0;
          background: var(--black);
          color: var(--white);
          border: none;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 300ms ease;
          margin-bottom: 30px;
        }

        .new-session-btn:hover {
          background: var(--soft-gray);
        }

        .session-item {
          padding: 12px 0;
          border-bottom: 1px solid var(--accent-line);
          cursor: pointer;
          transition: all 200ms ease;
        }

        .session-item:hover {
          background: rgba(10, 10, 10, 0.05);
        }

        .session-title {
          font-size: 14px;
          font-weight: 400;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .session-preview {
          font-size: 12px;
          color: var(--soft-gray);
          line-height: 1.3;
        }

        .more-sessions {
          color: var(--soft-gray);
          font-size: 12px;
          text-align: center;
          padding: 20px 0;
        }

        /* Chat Area */
        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--white);
        }

        /* Chat Header */
        .chat-header {
          padding: 30px 40px;
          border-bottom: 1px solid var(--accent-line);
          background: var(--white);
        }

        .chat-title {
          font-family: 'Times New Roman', serif;
          font-size: 24px;
          font-weight: 200;
          margin-bottom: 8px;
        }

        .chat-subtitle {
          font-size: 14px;
          color: var(--soft-gray);
        }

        /* Messages Container */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 40px;
        }

        /* Welcome State */
        .welcome-state {
          text-align: center;
          max-width: 600px;
          margin: 60px auto;
        }

        .maya-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 30px;
          overflow: hidden;
          border: 2px solid var(--accent-line);
        }

        .maya-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .welcome-eyebrow {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--soft-gray);
          margin-bottom: 20px;
        }

        .welcome-title {
          font-family: 'Times New Roman', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 200;
          letter-spacing: -0.01em;
          line-height: 1;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .welcome-description {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 40px;
          color: var(--soft-gray);
        }

        /* Style Quick-Select */
        .style-quickselect {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 40px;
        }

        .style-option {
          aspect-ratio: 1;
          background: var(--editorial-gray);
          border: 1px solid var(--accent-line);
          cursor: pointer;
          transition: all 300ms ease;
          position: relative;
          overflow: hidden;
        }

        .style-option:hover {
          transform: scale(1.05);
          border-color: var(--black);
        }

        .style-preview {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--soft-gray);
        }

        .style-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(10, 10, 10, 0.8));
          color: var(--white);
          padding: 15px 10px 10px;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-align: center;
          transform: translateY(100%);
          transition: transform 300ms ease;
        }

        .style-option:hover .style-label {
          transform: translateY(0);
        }

        /* Messages */
        .message {
          margin-bottom: 30px;
          max-width: 700px;
        }

        .message.maya {
          margin-right: auto;
        }

        .message.user {
          margin-left: auto;
          text-align: right;
        }

        .message-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          gap: 12px;
        }

        .message.user .message-header {
          justify-content: flex-end;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--editorial-gray);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: var(--soft-gray);
          overflow: hidden;
        }

        .message-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .message.user .message-avatar {
          background: var(--black);
          color: var(--white);
        }

        .message-sender {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--soft-gray);
        }

        .message-time {
          font-size: 10px;
          color: var(--soft-gray);
          opacity: 0.6;
        }

        .message-content {
          background: var(--editorial-gray);
          padding: 24px;
          border-radius: 0;
          position: relative;
        }

        .message.user .message-content {
          background: var(--black);
          color: var(--white);
        }

        .message-text {
          font-size: 15px;
          line-height: 1.6;
        }

        .message-text strong {
          font-weight: 400;
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--soft-gray);
          animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }

        .typing-text {
          font-size: 12px;
          color: var(--soft-gray);
        }

        /* Input Area */
        .input-area {
          padding: 30px 40px;
          border-top: 1px solid var(--accent-line);
          background: var(--white);
        }

        .input-container {
          display: flex;
          gap: 15px;
          align-items: flex-end;
        }

        .input-field {
          flex: 1;
          border: 1px solid var(--accent-line);
          background: var(--white);
          padding: 16px 20px;
          font-size: 14px;
          line-height: 1.4;
          font-family: inherit;
          resize: none;
          min-height: 24px;
          max-height: 120px;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--black);
        }

        .input-field::placeholder {
          color: var(--soft-gray);
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.3em;
        }

        .send-btn {
          padding: 16px 24px;
          background: var(--black);
          color: var(--white);
          border: none;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 300ms ease;
        }

        .send-btn:hover {
          background: var(--soft-gray);
        }

        /* Path Selection Cards - Editorial Style */
        .path-selection-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin: 60px 0;
          max-width: 800px;
        }

        .editorial-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: all 500ms ease;
          border: 1px solid var(--accent-line);
        }

        .card-image {
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1000ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .editorial-card:hover .card-image img {
          transform: scale(1.05);
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(10, 10, 10, 0.95) 100%);
          display: flex;
          align-items: flex-end;
          padding: 40px;
          opacity: 0;
          transition: opacity 500ms ease;
        }

        .editorial-card:hover .card-overlay {
          opacity: 1;
        }

        .card-content {
          color: var(--white);
        }

        .card-eyebrow {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 12px;
        }

        .card-title {
          font-family: 'Times New Roman', serif;
          font-size: 24px;
          font-weight: 200;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 16px;
          line-height: 1;
        }

        .card-description {
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 20px;
          opacity: 0.9;
        }

        .card-features {
          font-size: 12px;
          line-height: 1.4;
          opacity: 0.8;
        }

        .card-features div {
          margin-bottom: 4px;
        }

        .welcome-note {
          text-align: center;
          font-size: 12px;
          color: var(--soft-gray);
          margin-top: 40px;
        }

        /* Profile Card Section */
        .profile-card-section {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .profile-card-container {
          display: flex;
          justify-content: center;
        }

        .profile-card {
          max-width: 400px;
          width: 100%;
        }

        .profile-card .card-image {
          aspect-ratio: 4/5;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .path-selection-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .card-overlay {
            padding: clamp(20px, 5vw, 30px);
          }

          /* PHASE 6: Enhanced touch targets - Apple HIG compliant */
          .quick-button {
            min-height: 44px !important;
            min-width: 120px !important;
            padding: 12px 16px !important;
            font-size: 13px !important;
            margin: 4px !important;
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
          }

          .send-btn {
            min-height: 44px !important;
            min-width: 60px !important;
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
          }

          .input-field {
            min-height: 44px !important;
            font-size: 16px !important; /* Prevents zoom on iOS */
            padding: 12px 16px !important;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }

          /* PHASE 6: Image grid mobile optimization */
          .image-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding-bottom: 100px; /* Extra space for mobile interaction */
          }

          .save-btn {
            width: 44px !important; /* Apple HIG minimum */
            height: 44px !important;
            opacity: 1 !important; /* Always visible on mobile */
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
          }

          /* Style quickselect mobile */
          .style-quickselect {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .style-option {
            min-height: 44px !important;
            padding: 16px !important;
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
          }

          /* PHASE 6: Keyboard handling for mobile */
          .chat-container {
            height: 100vh;
            height: 100dvh; /* Use dynamic viewport height */
            display: flex;
            flex-direction: column;
            position: relative;
          }

          .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px 16px 120px; /* Extra bottom padding for input area */
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }

          .input-area {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            border-top: 1px solid var(--accent-line);
            z-index: 100;
            padding-bottom: env(safe-area-inset-bottom);
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          }

          /* Prevent viewport jumping on focus */
          .input-container {
            padding: 16px;
            min-height: 76px; /* Consistent height to prevent jumping */
            display: flex;
            gap: 12px;
            align-items: flex-end;
          }

          /* PHASE 6: Scroll behavior when keyboard appears */
          .input-field:focus {
            outline: none;
            border-color: var(--black);
          }

          /* Ensure content is visible above keyboard */
          @supports (-webkit-touch-callout: none) {
            /* iOS Safari specific */
            .input-area {
              padding-bottom: max(16px, env(keyboard-inset-height, env(safe-area-inset-bottom)));
            }
          }

          /* Generation buttons mobile */
          .generate-btn button {
            min-height: 44px !important;
            padding: 16px 24px !important;
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
          }

          /* Preset controls mobile */
          select, input[type="number"], button {
            min-height: 44px !important;
            padding: 12px 16px !important;
            font-size: 16px !important; /* Prevents zoom */
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
          }

          /* Hero CTA mobile */
          .hero-cta {
            min-height: 44px !important;
            padding: 16px 32px !important;
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
          }

          /* New session button mobile */
          .new-session-btn {
            min-height: 44px !important;
            padding: 16px 0 !important;
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
          }

          /* PHASE 6: Image viewing optimizations */
          .image-item img {
            height: auto !important;
            min-height: 200px;
            max-height: 400px;
          }

          /* Touch feedback for all interactive elements */
          button:active, .style-option:active, .quick-button:active {
            transform: scale(0.98);
            transition: transform 0.1s ease;
          }

          /* Prevent text selection on buttons */
          .quick-button, .style-option, button {
            -webkit-user-select: none;
            user-select: none;
          }
        }

        .send-btn:disabled {
          background: var(--accent-line);
          cursor: not-allowed;
        }

        /* Loading states */
        .generation-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 16px 0;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          color: var(--soft-gray);
          font-size: 14px;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top: 2px solid var(--light-gold);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Image Grid */
        .image-grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .image-item {
          position: relative;
          group: hover;
          cursor: pointer;
        }

        .image-item img {
          width: 100%;
          height: 192px;
          object-fit: cover;
          border-radius: 4px;
          transition: transform 200ms ease;
        }

        .image-item:hover img {
          transform: scale(1.05);
        }

        .save-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e5e5e5;
          border-radius: 50%;
          transition: all 200ms ease;
          opacity: 0;
          backdrop-filter: blur(8px);
        }

        .image-item:hover .save-btn {
          opacity: 1;
        }

        .save-btn:hover {
          background: white;
          border-color: #ccc;
        }

        .save-btn:disabled .spinner {
          width: 12px;
          height: 12px;
          border: 1px solid #999;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .generate-btn {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #ccc;
        }

        .generate-btn button {
          padding: 12px 24px;
          background: var(--black);
          color: var(--white);
          border: none;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 300ms ease;
        }

        .generate-btn button:hover {
          background: var(--soft-gray);
        }

        .generate-btn button:disabled {
          background: #999;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .main-container {
            flex-direction: column;
            height: auto;
          }

          .sidebar {
            width: 100%;
            height: auto;
            order: 2;
          }

          .chat-area {
            order: 1;
            min-height: 70vh;
          }

          .messages-container,
          .input-area,
          .chat-header {
            padding: 20px;
          }

          .style-quickselect {
            grid-template-columns: repeat(2, 1fr);
          }

          .hero {
            margin-top: 0;
          }
        }
      ` }} />

      {/* Hero Section - Keep existing image hero, only text changes */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya - Your Personal Brand Stylist" />
        </div>

        <div className="hero-content">
          <div className="hero-eyebrow">Professional photos, no photographer needed</div>
          <h1 className="hero-title">Maya</h1>
          <p className="hero-subtitle">Your Personal Brand Stylist</p>
          <button className="hero-cta" onClick={scrollToChat}>Start Creating</button>
        </div>
      </section>

      {/* Profile Card - Editorial Style */}
      <section className="profile-card-section">
        <div className="profile-card-container">
          <div 
            className="editorial-card profile-card"
            onClick={() => setLocation('/profile')}
          >
            <div className="card-image">
              <img 
                src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png" 
                alt="Complete your profile with Maya"
              />
            </div>
            <div className="card-overlay">
              <div className="card-content">
                <div className="card-eyebrow">P R O F I L E</div>
                <div className="card-title">Tell me your story, beautiful</div>
                <div className="card-description">
                  Complete your profile so I can customize every photoshoot to match your unique style and business goals perfectly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={`main-container maya-transition ${isOnboardingMode ? 'maya-onboarding-mode' : 'maya-photoshoot-mode'}`}>
        {/* Sidebar */}
        <aside className={`sidebar ${isOnboardingMode ? 'maya-onboarding-mode' : 'maya-photoshoot-mode'}`}>
          <div className="sidebar-section">
            <button className="new-session-btn" onClick={startNewSession}>New Session</button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Previous Sessions</div>
            <ChatHistoryLinks onChatSelect={(chatId) => {
              loadChatHistory(chatId);
              window.history.replaceState({}, '', `/maya?chat=${chatId}`);
            }} />
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className={`chat-area chat-interface ${isOnboardingMode ? 'maya-onboarding-mode' : 'maya-photoshoot-mode'}`}>
          {/* Chat Header */}
          <div className="chat-header">
            <h1 className="chat-title">Maya Studio</h1>
            <p className="chat-subtitle">Create photos that build your brand</p>
            {/* REMOVED: Manual preset/seed controls - Maya's AI handles all technical parameters automatically */}
          </div>

          {/* Onboarding Progress Bar - Only shown in onboarding mode */}
          {isOnboardingMode && (
            <div className="onboarding-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${onboardingStatus?.progress || 0}%` }}
                />
              </div>
              <div className="step-indicator">
                Personal Brand Discovery - Step {onboardingStatus?.currentStep || 1} of 6
              </div>
            </div>
          )}

          {/* Mode Indicator */}
          <div className={`maya-mode-indicator ${!isOnboardingMode ? 'hidden' : ''}`}>
            {isOnboardingMode ? 'DISCOVERY MODE' : 'PHOTOSHOOT MODE'}
          </div>

          {/* Messages Container */}
          <div className={`messages-container ${isOnboardingMode ? 'maya-onboarding-mode' : 'maya-photoshoot-mode'}`}>
            {messages.length === 0 ? (
              /* Streamlined Maya Welcome State - Direct Style Selection */
              <div className="welcome-state">
                <div className="maya-avatar">
                  <img src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756382691095.png" alt="Maya - Your Personal Brand Stylist" />
                </div>
                <div className="welcome-eyebrow">Personal Brand Photos</div>
                  <h2 className="welcome-title">What story do you want to tell?</h2>
                  <p className="welcome-description">Hey beautiful! I'm Maya, and I'm here to help you tell your story through stunning photos. Whether you need Instagram content that feels authentically you or personal brand photos that showcase your unique style - I've got you covered. What story do you want to tell?</p>

                  {/* Style Quick-Select with SSELFIE categories */}
                  <div className="style-quickselect">
                    <div className="style-option" onClick={() => handleStyleSelect('business-photos')}>
                      <div className="style-preview">Business</div>
                      <div className="style-label">Professional & Authority</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('lifestyle-photos')}>
                      <div className="style-preview">Lifestyle</div>
                      <div className="style-label">Casual & Authentic</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('story-photos')}>
                      <div className="style-preview">Story</div>
                      <div className="style-label">Behind the Scenes</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('instagram-photos')}>
                      <div className="style-preview">Instagram</div>
                      <div className="style-label">Feed & Stories</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('travel-photos')}>
                      <div className="style-preview">Travel</div>
                      <div className="style-label">Adventures & Destinations</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('outfit-photos')}>
                      <div className="style-preview">Outfits</div>
                      <div className="style-label">Fashion & Style</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('grwm-photos')}>
                      <div className="style-preview">GRWM</div>
                      <div className="style-label">Get Ready With Me</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('future-self')}>
                      <div className="style-preview">Future Self</div>
                      <div className="style-label">Aspirational Vision</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('bw-photos')}>
                      <div className="style-preview">B&W</div>
                      <div className="style-label">Timeless & Artistic</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('studio-photoshoot')}>
                      <div className="style-preview">Studio</div>
                      <div className="style-label">Professional Shoot</div>
                    </div>
                  </div>
                  
                  {/* Optional Personalization Button */}
                  <div className="personalization-cta">
                    <button 
                      className="personalize-button"
                      onClick={() => handlePersonalizationChoice(setMessages)}
                    >
                      Tell me about your style preferences first
                    </button>
                    <div className="personalization-note">
                      Or jump right in - I'll learn your style as we create photos together!
                    </div>
                  </div>
                </div>
              ) : (
              /* Messages */
              <div>
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.role}`}>
                    <div className="message-header">
                      {message.role === 'maya' && (
                        <>
                          <div className="message-avatar">
                            <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya" />
                          </div>
                          <div className="message-sender">Maya</div>
                        </>
                      )}
                      <div className="message-time">{formatTimestamp(message.timestamp)}</div>
                      {message.role === 'user' && (
                        <>
                          <div className="message-sender">{user?.firstName || 'You'}</div>
                          <div className="message-avatar">{user?.firstName?.[0] || 'U'}</div>
                        </>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {message.content ? message.content.split('\n').map((line, lineIndex) => (
                          <span key={lineIndex}>
                            {line}
                            {lineIndex < message.content.split('\n').length - 1 && <br />}
                          </span>
                        )) : <span>Loading...</span>}
                      </div>

                      {/* Loading state for image generation */}
                      {message.role === 'maya' && message.canGenerate && activeGenerations.has(message.generationId || '') && (
                        <div className="generation-loading">
                          <div className="loading-spinner"></div>
                          <span>Your photoshoot is being created...</span>
                        </div>
                      )}

                      {/* Image previews */}
                      {message.imagePreview && message.imagePreview.length > 0 && (
                        <div className="image-grid">
                          {message.imagePreview.map((imageUrl, imgIndex) => (
                            <div key={imgIndex} className="image-item">
                              <img
                                src={imageUrl}
                                alt={`Generated image ${imgIndex + 1}`}
                                onClick={() => setSelectedImage(imageUrl)}
                              />

                              {/* Heart save button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveToGallery(imageUrl);
                                }}
                                disabled={savingImages.has(imageUrl)}
                                className="save-btn"
                                title={savedImages.has(imageUrl) ? 'Saved to gallery' : 'Save to gallery'}
                              >
                                {savingImages.has(imageUrl) ? (
                                  <div className="spinner"></div>
                                ) : savedImages.has(imageUrl) ? (
                                  <span style={{ color: '#ef4444', fontSize: '14px' }}>♥</span>
                                ) : (
                                  <span style={{ color: '#999', fontSize: '14px' }}>♡</span>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Concept Cards */}
                      {message.conceptCards && (
                        <div style={{marginTop: '24px'}}>
                          <div style={{display: 'grid', gap: '20px'}}>
                            {message.conceptCards.map(concept => (
                              <div key={concept.id} style={{
                                background: 'var(--editorial-gray)',
                                padding: '24px',
                                border: '1px solid var(--accent-line)'
                              }}>
                                <h4 style={{
                                  fontFamily: "'Times New Roman', serif",
                                  fontSize: '20px',
                                  fontWeight: '200',
                                  textTransform: 'uppercase',
                                  marginBottom: '8px'
                                }}>
                                  {concept.title}
                                </h4>
                                <p style={{
                                  fontSize: '14px',
                                  lineHeight: '1.5',
                                  color: 'var(--soft-gray)',
                                  marginBottom: '16px'
                                }}>
                                  {concept.description}
                                </p>
                                
                                {/* Individual concept images */}
                                {concept.generatedImages && concept.generatedImages.length > 0 && (
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '12px',
                                    marginBottom: '16px'
                                  }}>
                                    {concept.generatedImages.map((imageUrl, imgIndex) => (
                                      <div key={imgIndex} style={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                      }}>
                                        <img
                                          src={imageUrl}
                                          alt={`${concept.title} ${imgIndex + 1}`}
                                          onClick={() => setSelectedImage(imageUrl)}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            cursor: 'pointer'
                                          }}
                                        />
                                        {/* Save button for concept images */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            saveToGallery(imageUrl);
                                          }}
                                          disabled={savingImages.has(imageUrl)}
                                          style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'rgba(0,0,0,0.7)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                          }}
                                          title={savedImages.has(imageUrl) ? 'Saved to gallery' : 'Save to gallery'}
                                        >
                                          {savingImages.has(imageUrl) ? (
                                            <div style={{
                                              width: '12px',
                                              height: '12px',
                                              border: '2px solid #fff',
                                              borderTop: '2px solid transparent',
                                              borderRadius: '50%',
                                              animation: 'spin 1s linear infinite'
                                            }}></div>
                                          ) : savedImages.has(imageUrl) ? (
                                            <span style={{ color: '#ef4444', fontSize: '14px' }}>♥</span>
                                          ) : (
                                            <span style={{ color: '#fff', fontSize: '14px' }}>♡</span>
                                          )}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                <button
                                  onClick={() => generateFromSpecificConcept(concept.title, concept.id)}
                                  disabled={concept.isLoading || activeGenerations.size > 0}
                                  style={{
                                    padding: '12px 24px',
                                    background: concept.isLoading ? 'var(--soft-gray)' : 'var(--black)',
                                    color: 'var(--white)',
                                    border: 'none',
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    cursor: concept.isLoading ? 'not-allowed' : 'pointer',
                                    opacity: concept.isLoading ? 0.7 : 1
                                  }}
                                >
                                  {concept.isLoading ? 'Generating...' : concept.hasGenerated ? 'Generate Again' : 'Generate This Concept'}
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          {/* Footer Actions */}
                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            marginTop: '24px',
                            justifyContent: 'center'
                          }}>
                            <button
                              onClick={() => sendChatMessage('Create more concepts like these', input, setInput, isOnboardingMode, isQuickStartMode, setOnboardingStatus, setIsOnboardingMode)}
                              style={{
                                padding: '12px 24px',
                                background: 'transparent',
                                color: 'var(--black)',
                                border: '1px solid var(--accent-line)',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                cursor: 'pointer'
                              }}
                            >
                              More Concepts Like This
                            </button>
                            <button
                              onClick={() => sendChatMessage('I want a completely new style direction', input, setInput, isOnboardingMode, isQuickStartMode, setOnboardingStatus, setIsOnboardingMode)}
                              style={{
                                padding: '12px 24px',
                                background: 'transparent',
                                color: 'var(--black)',
                                border: '1px solid var(--accent-line)',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                cursor: 'pointer'
                              }}
                            >
                              New Style Direction
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Quick Buttons - Smart Management: Only show unclicked buttons */}
                      {message.quickButtons && message.quickButtons.length > 0 && (
                        <div className="quick-buttons">
                          {message.quickButtons
                            .filter(button => {
                              // Maya's intelligent filtering - check if this concept can be generated
                              const isGenerationConcept = message.conceptCards?.some(card => 
                                card.title === button || button.includes(card.title)
                              ) || message.canGenerate;
                              if (isGenerationConcept) {
                                const messageButtons = clickedButtons.get(index) || new Set();
                                return !messageButtons.has(button);
                              }
                              // Show all non-generation buttons
                              return true;
                            })
                            .map((button, buttonIndex) => (
                            <button
                              key={buttonIndex}
                              className="quick-button"
                              onClick={() => handleQuickButton(button, index)}
                              disabled={activeGenerations.size > 0 && (button.includes('✨') || button.includes('💫') || button.includes('💗') || button.includes('🔥') || button.includes('🌟') || button.includes('💎'))}
                            >
                              {button}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Follow-up Questions for Onboarding */}
                      {message.questions && message.questions.length > 0 && (
                        <div className="follow-up-questions">
                          <div className="questions-label">Maya wants to know:</div>
                          {message.questions.map((question, qIndex) => (
                            <div key={qIndex} className="question-item">
                              "{question}"
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Generation button */}
                      {message.canGenerate && message.generatedPrompt && (
                        <div className="generate-btn">
                          <button
                            onClick={() => {
                              // Let generateImages create the ID to avoid conflicts
                              generateImages(message.generatedPrompt!, undefined, undefined, setMessages, currentChatId);
                            }}
                            disabled={activeGenerations.size > 0}
                          >
                            {activeGenerations.size > 0 ? 'Creating your photos...' : 'Create Photos'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="typing-indicator">
                    <div className="message-avatar">
                      <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya" />
                    </div>
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                    <div className="typing-text">Maya is styling your look...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>



          {/* Input Area */}
          <div className="input-area">
            <div className="input-container">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="input-field"
                placeholder={isOnboardingMode ? "Share your story with Maya..." : "Tell Maya what kind of photos you want to create..."}
                rows={1}
                disabled={false}
                style={{
                  minHeight: '24px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="send-btn"
              >
                {isOnboardingMode ? "Share" : "Send"}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Full-size Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <img 
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Modal Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              {/* Heart Save Button in Modal */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  saveToGallery(selectedImage);
                }}
                disabled={savingImages.has(selectedImage)}
                className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-full transition-all shadow-lg"
                title={savedImages.has(selectedImage) ? 'Saved to gallery' : 'Save to gallery'}
              >
                {savingImages.has(selectedImage) ? (
                  <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : savedImages.has(selectedImage) ? (
                  <span className="text-red-500 text-lg">♥</span>
                ) : (
                  <span className="text-gray-400 hover:text-red-500 text-lg transition-colors">♡</span>
                )}
              </button>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 hover:text-black rounded-full transition-all shadow-lg"
                title="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-sm font-medium">Maya Personal Brand Photo</div>
              <div className="text-xs text-white/80">Save to use for your content and brand</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function MayaWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Maya />
    </ErrorBoundary>
  );
}