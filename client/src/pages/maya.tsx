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
import '../maya-onboarding.css';

interface ChatMessage {
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
  generationId?: string; // Unique ID to track specific generation for polling
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

export default function Maya() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Core chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  // Onboarding state
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [isOnboardingMode, setIsOnboardingMode] = useState(false);
  const [isQuickStartMode, setIsQuickStartMode] = useState(false);

  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [savingImages, setSavingImages] = useState(new Set<string>());
  const [savedImages, setSavedImages] = useState(new Set<string>());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Smart button management - track clicked generation buttons per message
  const [clickedButtons, setClickedButtons] = useState(new Map<number, Set<string>>());
  
  // Generation controls
  const [preset, setPreset] = useState<Preset>('Editorial');
  const [seed, setSeed] = useState<string>(''); // empty = random

  // Welcome page state
  const [showWelcome, setShowWelcome] = useState(false);

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

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const checkOnboardingStatus = async () => {
    try {
      console.log('🔍 Maya: Checking onboarding status, auth state:', { isAuthenticated, authLoading });
      const response = await apiRequest('/api/maya/status');
      console.log('✅ Maya: Unified status received:', response);
      if (response?.success) {
        const status = {
          isCompleted: response.onboardingComplete,
          currentStep: 1, // Will be updated from chat history
          progress: response.onboardingComplete ? 100 : 0,
          hasStarted: true
        };
        setOnboardingStatus(status);
        
        // If not completed, show welcome page first
        if (!response.onboardingComplete) {
          setShowWelcome(true);
        } else {
          // Load regular Maya with personal brand context
          setIsOnboardingMode(false);
        }
      }
    } catch (error) {
      // If onboarding endpoint doesn't exist, proceed with regular Maya
      console.log('❌ Maya: Onboarding status error:', error);
      console.log('Onboarding system not available, proceeding with regular Maya');
      setIsOnboardingMode(false);
    }
  };

  const initializeOnboarding = () => {
    const welcomeMessage: ChatMessage = {
      role: 'maya',
      content: "Hey gorgeous! I'm Maya - Sandra's AI bestie with all her styling secrets from fashion week to building her empire. Before we create amazing photos together, I want to get to know YOU - your story, your dreams, your transformation journey. This is about discovering your personal brand and seeing your powerful future self. Ready to begin?",
      timestamp: new Date().toISOString(),
      questions: ["What brought you here today?", "What's your biggest challenge when it comes to feeling confident?"],
      quickButtons: ["Starting over", "Building my brand", "Need confidence", "Feeling stuck"],
      stepGuidance: "Let's start by getting to know your transformation story",
      isOnboarding: true
    };
    setMessages([welcomeMessage]);
  };

  const handleWelcomeChoice = (choice: 'customize' | 'quickstart') => {
    setShowWelcome(false);
    
    if (choice === 'customize') {
      // Start onboarding flow
      setIsOnboardingMode(true);
      setIsQuickStartMode(false);
      initializeOnboarding();
    } else {
      // Quick start - go straight to image generation chat
      setIsOnboardingMode(false);
      setIsQuickStartMode(true);
      const quickStartMessage: ChatMessage = {
        role: 'maya',
        content: "Perfect! I love your confidence - let's create some stunning brand photos right now! I'll style you based on my expertise from fashion week and magazine shoots. Tell me what kind of photos you need today and I'll create the perfect look for you.",
        timestamp: new Date().toISOString(),
        quickButtons: ["Professional headshots", "Social media photos", "Website hero image", "LinkedIn authority photo"],
        canGenerate: true
      };
      setMessages([quickStartMessage]);
    }
  };

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

  const loadChatHistory = async (chatId: number) => {
    try {
      const response = await apiRequest(`/api/maya-chats/${chatId}/messages`);
      if (response && Array.isArray(response)) {
        setMessages(response);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history"
      });
    }
  };

  const startNewSession = () => {
    if (isOnboardingMode) return; // Can't start new session during onboarding
    
    setMessages([]);
    setCurrentChatId(null);
    setIsQuickStartMode(false); // Reset quick start mode when starting new session
    window.history.replaceState({}, '', '/maya');
  };

  const sendMessage = async (messageContent?: string) => {
    const messageToSend = messageContent || input.trim();
    if (!messageToSend || isTyping) return;

    // Add user message to UI
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // SINGLE MAYA ENDPOINT for all interactions
      const context = isOnboardingMode ? 'onboarding' : isQuickStartMode ? 'quickstart' : 'regular';
      const response = await apiRequest('/api/maya/chat', 'POST', {
        message: messageToSend,
        context: context,
        chatId: currentChatId
      });

      // Handle unified response
      const mayaMessage: ChatMessage = {
        role: 'maya',
        content: response.message,
        timestamp: new Date().toISOString(),
        canGenerate: response.canGenerate,
        generatedPrompt: response.generatedPrompt,
        quickButtons: response.quickButtons
      };

      setMessages(prev => [...prev, mayaMessage]);

      // Update UI state based on response
      if (response.mode === 'onboarding' && response.onboardingProgress) {
        setOnboardingStatus(response.onboardingProgress);
        
        // Check if onboarding is complete
        if (response.onboardingProgress.isComplete) {
          setTimeout(() => {
            setIsOnboardingMode(false);
            setOnboardingStatus(prev => ({ ...prev!, isCompleted: true }));
          }, 2000);
        }
      }

      if (response.chatId && !currentChatId) {
        setCurrentChatId(response.chatId);
        window.history.replaceState({}, '', `/maya?chat=${response.chatId}`);
      }

      // Invalidate chat list to refresh with new/updated chat
      queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });

    } catch (error: any) {
      console.error('Maya chat error:', error);
      
      const errorMessage: ChatMessage = {
        role: 'maya',
        content: "I'm having a little trouble connecting right now, but I'm still here with you! Could you try sharing that again? I'm so excited to help you on your journey.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickButton = (buttonText: string, messageIndex?: number) => {
    // Check if this is a Maya-style generation button (contains emoji)
    if (buttonText.includes('✨') || buttonText.includes('💫') || buttonText.includes('💗') || 
        buttonText.includes('🔥') || buttonText.includes('🌟') || buttonText.includes('💎')) {
      // Mark this button as clicked for this message
      if (messageIndex !== undefined) {
        setClickedButtons(prev => {
          const newMap = new Map(prev);
          const messageButtons = newMap.get(messageIndex) || new Set();
          messageButtons.add(buttonText);
          newMap.set(messageIndex, messageButtons);
          return newMap;
        });
      }
      
      // Generate from concept name
      generateFromConcept(buttonText);
    } else {
      // Regular chat message
      sendMessage(buttonText);
    }
  };
  
  const generateFromConcept = async (conceptName: string) => {
    if (isGenerating) return;
    
    // Create a prompt based on the concept name and trigger word
    // This will be handled by Maya's generation system
    const prompt = `Create a professional photo concept: ${conceptName}`;
    
    // Generate unique message ID to track this specific generation
    const messageId = `generation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add a message indicating generation is starting - CRITICAL: canGenerate MUST be true for polling to find it
    const generatingMessage: ChatMessage = {
      role: 'maya',
      content: `Perfect choice! I'm creating your "${conceptName}" photos right now using all my styling expertise. This is going to look absolutely stunning!`,
      timestamp: new Date().toISOString(),
      canGenerate: true,  // CRITICAL: Must be true so polling can find this message to update with images
      generationId: messageId  // Unique ID to track this specific generation
    };
    setMessages(prev => [...prev, generatingMessage]);
    
    // Trigger actual generation with specific message ID
    await generateImages(prompt, messageId);
  };

  const generateImages = async (prompt: string, generationId?: string) => {
    if (isGenerating || isOnboardingMode) return; // No generation during onboarding

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const response = await apiRequest('/api/maya/generate', 'POST', {
        prompt,
        chatId: currentChatId,
        preset,
        seed: seed ? Number(seed) : undefined
      });

      if (response.predictionId) {
        console.log('🚀 GENERATION STARTED: Prediction ID:', response.predictionId, 'for generation:', generationId);
        // Poll for completion
        const pollForImages = async () => {
          try {
            console.log('🔄 POLLING: Checking generation status for prediction:', response.predictionId);
            const statusResponse = await fetch(`/api/check-generation/${response.predictionId}`, { 
              credentials: 'include' 
            }).then(res => res.json());
            
            console.log('📊 POLLING RESPONSE:', statusResponse.status, statusResponse.imageUrls?.length || 0, 'images');

            if (statusResponse.status === 'completed' && statusResponse.imageUrls) {
              // Find the SPECIFIC Maya message by generationId and update it with images
              setMessages(prev => {
                const newMessages = [...prev];
                let messageFound = false;
                
                // First try to find by generationId if provided
                if (generationId) {
                  for (let i = 0; i < newMessages.length; i++) {
                    if (newMessages[i].role === 'maya' && newMessages[i].generationId === generationId && newMessages[i].canGenerate) {
                      console.log('🖼️ POLLING SUCCESS: Found SPECIFIC Maya message by ID:', generationId, 'with', statusResponse.imageUrls.length, 'images');
                      newMessages[i] = {
                        ...newMessages[i],
                        imagePreview: statusResponse.imageUrls,
                        canGenerate: false
                      };
                      messageFound = true;
                      break;
                    }
                  }
                }
                
                // Fallback: find the most recent Maya message that can generate
                if (!messageFound) {
                  for (let i = newMessages.length - 1; i >= 0; i--) {
                    if (newMessages[i].role === 'maya' && newMessages[i].canGenerate) {
                      console.log('🖼️ POLLING SUCCESS: Found RECENT Maya message with', statusResponse.imageUrls.length, 'images');
                      newMessages[i] = {
                        ...newMessages[i],
                        imagePreview: statusResponse.imageUrls,
                        canGenerate: false
                      };
                      break;
                    }
                  }
                }
                
                return newMessages;
              });
              setIsGenerating(false);
              setGenerationProgress(100);
            } else if (statusResponse.status === 'failed') {
              console.error('❌ POLLING: Generation failed:', statusResponse.error);
              throw new Error(statusResponse.error || 'Generation failed');
            } else {
              // Still processing, update progress
              const progress = Math.min(90, generationProgress + 10);
              console.log('⏳ POLLING: Still processing, progress:', progress + '%');
              setGenerationProgress(progress);
              setTimeout(pollForImages, 2000);
            }
          } catch (pollError) {
            console.error('Polling error:', pollError);
            setIsGenerating(false);
            throw pollError;
          }
        };

        setTimeout(pollForImages, 2000);

      } else {
        throw new Error('Failed to start generation');
      }

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate images. Please try again."
      });
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const saveToGallery = async (imageUrl: string) => {
    if (savingImages.has(imageUrl) || savedImages.has(imageUrl)) return;

    setSavingImages(prev => new Set(prev).add(imageUrl));

    try {
      await apiRequest('/api/save-image', 'POST', {
        imageUrl,
        source: 'maya-chat'
      });

      setSavedImages(prev => new Set(prev).add(imageUrl));
      toast({
        title: "Saved!",
        description: "Image added to your gallery"
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save image"
      });
    } finally {
      setSavingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
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

  const handleStyleSelect = (style: string) => {
    const styleMessages = {
      'professional-headshots': 'I need professional headshots for LinkedIn and business credibility',
      'social-media-photos': 'I want Instagram and social media photos that I actually want to post',
      'website-photos': 'I need website photos for my homepage and brand storytelling',
      'email-marketing-photos': 'I want warm, personal photos for email newsletters and connection',
      'premium-brand-photos': 'I need premium brand photos for high-value collaborations'
    };

    setInput(styleMessages[style as keyof typeof styleMessages] || 'I want to explore this style');

    // Auto-send the message after a brief delay for visual feedback
    setTimeout(() => {
      sendMessage();
    }, 300);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
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

        /* Responsive */
        @media (max-width: 768px) {
          .path-selection-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .card-overlay {
            padding: 30px;
          }
        }

        .send-btn:disabled {
          background: var(--accent-line);
          cursor: not-allowed;
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
            {/* Generation controls: preset + seed */}
            <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666' }}>
                Preset
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value as Preset)}
                  style={{ marginLeft: 8, padding: '8px 10px', border: '1px solid #e5e5e5', background: '#fff' }}
                  disabled={isGenerating || isTyping}
                >
                  <option value="Identity">Identity</option>
                  <option value="Editorial">Editorial</option>
                  <option value="UltraPrompt">UltraPrompt</option>
                  <option value="Fast">Fast</option>
                </select>
              </label>
              <label style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666' }}>
                Seed
                <input
                  type="number"
                  placeholder="random"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  style={{ marginLeft: 8, padding: '8px 10px', width: 140, border: '1px solid #e5e5e5', background: '#fff' }}
                  disabled={isGenerating || isTyping}
                />
              </label>
              <button
                onClick={() => setSeed(String(Math.floor(Math.random() * 1_000_000_000)))}
                disabled={isGenerating || isTyping}
                style={{ padding: '8px 12px', border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer' }}
                title="Randomize seed"
              >
                Randomize
              </button>
            </div>
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
              showWelcome ? (
                /* Welcome Cards for New Users */
                <div className="welcome-state">
                  <div className="maya-avatar">
                    <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya - Your Personal Brand Stylist" />
                  </div>
                  <div className="welcome-eyebrow">Ready to start your brand photoshoot?</div>
                  <h2 className="welcome-title">Choose your path</h2>
                  <p className="welcome-description">Hey gorgeous! I'm Maya, Sandra's AI bestie with all her styling secrets from fashion week to building her empire. Let's create amazing photos together that show the world your powerful future self!</p>

                  {/* Editorial Image Cards */}
                  <div className="path-selection-grid">
                    <div className="editorial-card customize-card" onClick={() => handleWelcomeChoice('customize')}>
                      <div className="card-image">
                        <img src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756240155921.png" alt="Personal Brand Discovery" />
                        <div className="card-overlay">
                          <div className="card-content">
                            <div className="card-eyebrow">5-10 minutes</div>
                            <h3 className="card-title">CUSTOMIZE</h3>
                            <p className="card-description">Let me get to know you first! I want to learn your unique style, your personal brand story, and your transformation journey before we create your perfect photos together.</p>
                            <div className="card-features">
                              <div>→ Photos that match your personality</div>
                              <div>→ Brand photos that feel like YOU</div>
                              <div>→ Your style preferences saved forever</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="editorial-card quickstart-card" onClick={() => handleWelcomeChoice('quickstart')}>
                      <div className="card-image">
                        <img src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/undefined/undefined_1756128420487.png" alt="Instant Brand Photos" />
                        <div className="card-overlay">
                          <div className="card-content">
                            <div className="card-eyebrow">Start immediately</div>
                            <h3 className="card-title">QUICK START</h3>
                            <p className="card-description">Ready to jump right in? Let's create stunning professional photos right now! I'll use all my fashion week expertise to make you look absolutely amazing.</p>
                            <div className="card-features">
                              <div>→ Gorgeous photos created instantly</div>
                              <div>→ My best styling secrets applied</div>
                              <div>→ Perfect when you need photos now</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="welcome-note">
                    Don't worry - you can always tell me more about your style preferences later in our chat!
                  </div>
                </div>
              ) : (
                /* Regular Maya Welcome State */
                <div className="welcome-state">
                  <div className="maya-avatar">
                    <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya - Your Personal Brand Stylist" />
                  </div>
                  <div className="welcome-eyebrow">Personal Brand Photos</div>
                  <h2 className="welcome-title">What photos does your business need most?</h2>
                  <p className="welcome-description">I'm Maya, your personal brand stylist with Sandra's expertise from fashion week to building her empire. I'll help you create the exact photos you need for your business - from LinkedIn headshots to Instagram content to website images. What photos would make the biggest impact for you right now?</p>

                  {/* Style Quick-Select with SSELFIE categories */}
                  <div className="style-quickselect">
                    <div className="style-option" onClick={() => handleStyleSelect('professional-headshots')}>
                      <div className="style-preview">Professional Headshots</div>
                      <div className="style-label">LinkedIn & Business</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('social-media-photos')}>
                      <div className="style-preview">Social Media Photos</div>
                      <div className="style-label">Instagram & TikTok</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('website-photos')}>
                      <div className="style-preview">Website Photos</div>
                      <div className="style-label">Homepage & About</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('email-marketing-photos')}>
                      <div className="style-preview">Email & Marketing</div>
                      <div className="style-label">Personal Connection</div>
                    </div>
                    <div className="style-option" onClick={() => handleStyleSelect('premium-brand-photos')}>
                      <div className="style-preview">Premium Brand Photos</div>
                      <div className="style-label">High-Value Clients</div>
                    </div>
                  </div>
                </div>
              )
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
                        {message.content.split('\n').map((line, lineIndex) => (
                          <span key={lineIndex}>
                            {line}
                            {lineIndex < message.content.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </div>

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

                      {/* Quick Buttons - Smart Management: Only show unclicked buttons */}
                      {message.quickButtons && message.quickButtons.length > 0 && (
                        <div className="quick-buttons">
                          {message.quickButtons
                            .filter(button => {
                              // For generation buttons, only show if not clicked for this message
                              const isGenerationButton = button.includes('✨') || button.includes('💫') || 
                                                        button.includes('💗') || button.includes('🔥') || 
                                                        button.includes('🌟') || button.includes('💎');
                              if (isGenerationButton) {
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
                              disabled={isTyping}
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
                            onClick={() => generateImages(message.generatedPrompt!)}
                            disabled={isGenerating}
                          >
                            {isGenerating ? `Creating... ${generationProgress}%` : 'Create Photos'}
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
                disabled={isTyping}
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
                disabled={!input.trim() || isTyping}
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