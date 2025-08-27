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

  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [savingImages, setSavingImages] = useState(new Set<string>());
  const [savedImages, setSavedImages] = useState(new Set<string>());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generation controls
  const [preset, setPreset] = useState<Preset>('Editorial');
  const [seed, setSeed] = useState<string>(''); // empty = random

  // Check onboarding status on load
  useEffect(() => {
    if (isAuthenticated) {
      checkOnboardingStatus();
    }
  }, [isAuthenticated]);

  // Get current chat ID from URL
  useEffect(() => {
    if (typeof window !== 'undefined' && !isOnboardingMode) {
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
  }, [isOnboardingMode]);

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
      const response = await apiRequest('/api/maya-onboarding/status');
      if (response?.status) {
        setOnboardingStatus(response.status);
        
        // If not completed, start onboarding mode
        if (!response.status.isCompleted) {
          setIsOnboardingMode(true);
          initializeOnboarding();
        } else {
          // Load regular Maya with personal brand context
          setIsOnboardingMode(false);
        }
      }
    } catch (error) {
      // If onboarding endpoint doesn't exist, proceed with regular Maya
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
    window.history.replaceState({}, '', '/maya');
  };

  const sendMessage = async (messageContent?: string) => {
    const messageToSend = messageContent || input.trim();
    if (!messageToSend || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      let response;

      if (isOnboardingMode) {
        // Use onboarding endpoint
        response = await apiRequest('/api/maya-onboarding/conversation', 'POST', {
          message: messageToSend,
          step: onboardingStatus?.currentStep || 1
        });

        if (response?.maya_response) {
          const mayaResponse = response.maya_response;
          
          const mayaMessage: ChatMessage = {
            role: 'maya',
            content: mayaResponse.message,
            timestamp: new Date().toISOString(),
            questions: mayaResponse.questions || [],
            quickButtons: mayaResponse.quickButtons || [],
            stepGuidance: mayaResponse.step_guidance,
            isOnboarding: true
          };

          setMessages(prev => [...prev, mayaMessage]);

          // Update onboarding progress
          if (response.context) {
            setOnboardingStatus(prev => ({
              ...prev,
              currentStep: response.context.onboarding_progress || prev?.currentStep || 1,
              progress: mayaResponse.progress || prev?.progress || 0,
              isCompleted: response.context.is_completed || false
            }));
          }

          // Check if onboarding is complete
          if (mayaResponse.next_action === 'complete_onboarding' || response.context?.is_completed) {
            setTimeout(() => {
              setIsOnboardingMode(false);
              setOnboardingStatus(prev => ({ ...prev!, isCompleted: true }));
              
              // Add completion message
              const completionMessage: ChatMessage = {
                role: 'maya',
                content: "Amazing! Now I know your story and can help you create photos that truly show your power. What kind of incredible photos should we create first?",
                timestamp: new Date().toISOString(),
                quickButtons: ["Future CEO", "Off-Duty Model", "Social Queen", "Date Night Goddess", "Everyday Icon", "Power Player"]
              };
              setMessages(prev => [...prev, completionMessage]);
            }, 2000);
          }
        }
      } else {
        // Use regular Maya endpoint
        response = await apiRequest('/api/member-maya-chat', 'POST', {
          message: messageToSend,
          chatId: currentChatId,
          chatHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        });

        if (response.chatId && !currentChatId) {
          setCurrentChatId(response.chatId);
          window.history.replaceState({}, '', `/maya?chat=${response.chatId}`);
        }

        const mayaMessage: ChatMessage = {
          role: 'maya',
          content: response.message,
          timestamp: new Date().toISOString(),
          canGenerate: response.canGenerate,
          generatedPrompt: response.generatedPrompt,
        };

        setMessages(prev => [...prev, mayaMessage]);

        // Invalidate chat list to refresh with new/updated chat
        queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'maya',
        content: "I'm having a little trouble connecting right now, but I'm still here with you! Could you try sharing that again? I'm so excited to help you on your journey.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickButton = (buttonText: string) => {
    sendMessage(buttonText);
  };

  const generateImages = async (prompt: string) => {
    if (isGenerating || isOnboardingMode) return; // No generation during onboarding

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const response = await apiRequest('/api/maya-generate-images', 'POST', {
        prompt,
        chatId: currentChatId,
        preset,
        seed: seed ? Number(seed) : undefined
      });

      if (response.predictionId) {
        // Poll for completion
        const pollForImages = async () => {
          try {
            const statusResponse = await fetch(`/api/check-generation/${response.predictionId}`, { 
              credentials: 'include' 
            }).then(res => res.json());

            if (statusResponse.status === 'completed' && statusResponse.imageUrls) {
              // Find the last Maya message and update it with images
              setMessages(prev => {
                const newMessages = [...prev];
                for (let i = newMessages.length - 1; i >= 0; i--) {
                  if (newMessages[i].role === 'maya' && newMessages[i].canGenerate) {
                    newMessages[i] = {
                      ...newMessages[i],
                      imagePreview: statusResponse.imageUrls,
                      canGenerate: false
                    };
                    break;
                  }
                }
                return newMessages;
              });
              setIsGenerating(false);
              setGenerationProgress(100);
            } else if (statusResponse.status === 'failed') {
              throw new Error(statusResponse.error || 'Generation failed');
            } else {
              // Still processing, update progress
              const progress = Math.min(90, generationProgress + 10);
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
    if (isOnboardingMode) return;

    const styleMessages = {
      'future-ceo': 'Future CEO - Powerful, professional, ready to run the world',
      'off-duty-model': 'Off-Duty Model - Effortlessly stunning, casual but elevated', 
      'social-queen': 'Social Queen - Instagram-ready, social media perfection',
      'date-night-goddess': 'Date Night Goddess - Romantic, magnetic, unforgettable',
      'everyday-icon': 'Everyday Icon - Polished daily life, elevated routine moments',
      'power-player': 'Power Player - Authority, influence, making things happen'
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';
    const showAvatar = index === 0 || messages[index - 1]?.role !== message.role;

    return (
      <div key={index} className={`message-group ${isUser ? 'user' : 'maya'}`}>
        {showAvatar && !isUser && (
          <div className="message-avatar">
            <img 
              src={SandraImages.hero.ai}
              alt="Maya"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        )}
        
        <div className={`message-content ${!showAvatar && !isUser ? 'continuation' : ''}`}>
          <div className={`message-bubble ${isUser ? 'user-message' : 'maya-message'}`}>
            <p className="message-text">{message.content}</p>
            
            {/* Show step guidance during onboarding */}
            {message.isOnboarding && message.stepGuidance && (
              <div className="step-guidance">
                <span className="guidance-label">Next:</span> {message.stepGuidance}
              </div>
            )}
            
            <div className="message-meta">
              <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
            </div>
          </div>

          {/* Quick buttons */}
          {message.quickButtons && message.quickButtons.length > 0 && (
            <div className="quick-buttons">
              {message.quickButtons.map((button, btnIndex) => (
                <Button
                  key={btnIndex}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickButton(button)}
                  className="quick-button"
                >
                  {button}
                </Button>
              ))}
            </div>
          )}

          {/* Follow-up questions */}
          {message.questions && message.questions.length > 0 && (
            <div className="follow-up-questions">
              <div className="questions-label">Try asking:</div>
              {message.questions.map((question, qIndex) => (
                <button
                  key={qIndex}
                  onClick={() => setInput(question)}
                  className="question-suggestion"
                >
                  "{question}"
                </button>
              ))}
            </div>
          )}

          {/* Image generation */}
          {message.canGenerate && message.generatedPrompt && (
            <div className="generation-section">
              <div className="generation-prompt">
                <strong>Ready to create:</strong> {message.generatedPrompt}
              </div>
              
              <div className="generation-controls">
                <div className="preset-selector">
                  <label>Style:</label>
                  <select 
                    value={preset} 
                    onChange={(e) => setPreset(e.target.value as Preset)}
                    className="preset-select"
                  >
                    <option value="Editorial">Editorial</option>
                    <option value="Identity">Identity</option>
                    <option value="UltraPrompt">Ultra</option>
                    <option value="Fast">Fast</option>
                  </select>
                </div>

                <Button
                  onClick={() => generateImages(message.generatedPrompt!)}
                  disabled={isGenerating}
                  className="generate-button"
                >
                  {isGenerating ? `Generating... ${generationProgress}%` : 'Create Images'}
                </Button>
              </div>
            </div>
          )}

          {/* Generated images */}
          {message.imagePreview && message.imagePreview.length > 0 && (
            <div className="generated-images">
              <div className="images-grid">
                {message.imagePreview.map((imageUrl, imgIndex) => (
                  <div key={imgIndex} className="image-container">
                    <img
                      src={imageUrl}
                      alt={`Generated ${imgIndex + 1}`}
                      className="generated-image"
                      onClick={() => setSelectedImage(imageUrl)}
                    />
                    <div className="image-actions">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveToGallery(imageUrl)}
                        disabled={savingImages.has(imageUrl)}
                        className={`save-button ${savedImages.has(imageUrl) ? 'saved' : ''}`}
                      >
                        {savingImages.has(imageUrl) ? '...' : savedImages.has(imageUrl) ? '✓' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="maya-interface">
      {/* Header */}
      <div className="header-container">
        <MemberNavigation />
        
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                {isOnboardingMode ? 'Personal Brand Discovery' : 'Maya'}
              </h1>
              <p className="hero-subtitle">
                {isOnboardingMode 
                  ? 'Let Maya get to know your story and transformation journey'
                  : 'Your AI styling partner with Sandra\'s secrets'
                }
              </p>
              
              {/* Onboarding Progress */}
              {isOnboardingMode && onboardingStatus && (
                <div className="onboarding-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${onboardingStatus.progress || 0}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    Step {onboardingStatus.currentStep} of 6
                  </span>
                </div>
              )}
            </div>
            
            <div className="hero-image">
              <EditorialImageBreak 
                src={SandraImages.hero.ai}
                alt="Maya - Your AI Styling Partner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="interface-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>
              {isOnboardingMode ? 'Discovery Session' : 'Chat History'}
            </h3>
            {!isOnboardingMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={startNewSession}
                className="new-session-button"
              >
                New Session
              </Button>
            )}
          </div>
          
          <div className="sessions-list">
            <ChatHistoryLinks onChatSelect={(chatId) => {
              if (!isOnboardingMode) {
                loadChatHistory(chatId);
                setLocation(`/maya?chat=${chatId}`);
              }
            }} />
          </div>
        </div>

        {/* Main Chat */}
        <div className="main-container">
          <div className="messages-container">
            {messages.map((message, index) => renderMessage(message, index))}
            
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">Maya is thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-container">
            <div className="input-wrapper">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isOnboardingMode 
                  ? "Share your story with Maya..." 
                  : "Chat with Maya about your style goals..."
                }
                className="message-input"
                rows={1}
                disabled={isTyping}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={isTyping || !input.trim()}
                className="send-button"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Full size" className="modal-image" />
            <Button
              variant="outline"
              onClick={() => setSelectedImage(null)}
              className="close-button"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .maya-interface {
          min-height: 100vh;
          background: white;
          font-family: "Times New Roman", serif;
        }

        .header-container {
          border-bottom: 1px solid #e5e5e5;
          background: white;
        }

        .hero-section {
          padding: 2rem 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 3rem;
          align-items: center;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 400;
          letter-spacing: -0.02em;
          color: black;
          margin: 0 0 1rem 0;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #666;
          line-height: 1.6;
          margin: 0 0 1.5rem 0;
        }

        .onboarding-progress {
          margin-top: 1.5rem;
        }

        .progress-bar {
          height: 4px;
          background: #f0f0f0;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #D4AF37, #F4E4A6);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.875rem;
          color: #666;
        }

        .maya-hero-image {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 8px;
        }

        .interface-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          height: calc(100vh - 400px);
          max-width: 1200px;
          margin: 0 auto;
        }

        .sidebar {
          border-right: 1px solid #e5e5e5;
          padding: 1.5rem;
          background: #fafafa;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .sidebar-header h3 {
          font-size: 1.125rem;
          font-weight: 500;
          margin: 0;
        }

        .new-session-button {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
        }

        .sessions-list {
          space-y: 0.5rem;
        }

        .session-item {
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .session-item:hover {
          background: white;
        }

        .session-title {
          font-weight: 500;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .session-preview {
          font-size: 0.75rem;
          color: #666;
          line-height: 1.4;
        }

        .more-sessions {
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          color: #999;
          text-align: center;
        }

        .main-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          space-y: 1.5rem;
        }

        .message-group {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .message-group.user {
          justify-content: flex-end;
        }

        .message-avatar {
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .message-content {
          max-width: 70%;
        }

        .message-content.continuation {
          margin-left: 2.75rem;
        }

        .message-bubble {
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          margin-bottom: 0.5rem;
        }

        .user-message {
          background: #f8f8f8;
          border: 1px solid #e5e5e5;
          margin-left: auto;
          color: black;
        }

        .maya-message {
          background: linear-gradient(135deg, #F5F5DC, #F8F8FF);
          border: 1px solid #E6E6FA;
          color: black;
        }

        .message-text {
          margin: 0;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .step-guidance {
          margin-top: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: rgba(212, 175, 55, 0.1);
          border-radius: 6px;
          font-size: 0.875rem;
          color: #8B6914;
        }

        .guidance-label {
          font-weight: 600;
        }

        .message-meta {
          margin-top: 0.5rem;
        }

        .timestamp {
          font-size: 0.75rem;
          color: #999;
        }

        .quick-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .quick-button {
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
          border-color: #D4AF37;
          color: #8B6914;
        }

        .quick-button:hover {
          background: #D4AF37;
          color: white;
        }

        .follow-up-questions {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 8px;
        }

        .questions-label {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #666;
        }

        .question-suggestion {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.5rem;
          margin-bottom: 0.25rem;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .question-suggestion:hover {
          border-color: #D4AF37;
          background: #fefdfb;
        }

        .generation-section {
          margin-top: 0.75rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .generation-prompt {
          margin-bottom: 1rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .generation-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .preset-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .preset-select {
          padding: 0.25rem 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .generate-button {
          background: #D4AF37;
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          font-size: 0.875rem;
        }

        .generate-button:hover {
          background: #B8941F;
        }

        .generate-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .generated-images {
          margin-top: 0.75rem;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .image-container {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .generated-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .generated-image:hover {
          transform: scale(1.02);
        }

        .image-actions {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
        }

        .save-button {
          background: white;
          border: 1px solid #ccc;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          min-width: 50px;
        }

        .save-button.saved {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0;
        }

        .typing-dots {
          display: flex;
          gap: 0.25rem;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          background: #D4AF37;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        .typing-text {
          font-size: 0.875rem;
          color: #666;
          font-style: italic;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .input-container {
          border-top: 1px solid #e5e5e5;
          padding: 1.5rem;
          background: white;
        }

        .input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: end;
        }

        .message-input {
          flex: 1;
          min-height: 44px;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-family: "Times New Roman", serif;
          font-size: 0.95rem;
          resize: none;
          transition: border-color 0.2s;
        }

        .message-input:focus {
          border-color: #D4AF37;
          outline: none;
        }

        .send-button {
          background: #D4AF37;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .send-button:hover {
          background: #B8941F;
        }

        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .image-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          cursor: pointer;
        }

        .modal-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
        }

        .modal-image {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          border-radius: 8px;
        }

        .close-button {
          position: absolute;
          top: -50px;
          right: 0;
          background: white;
          color: black;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            text-align: center;
          }
          
          .hero-title {
            font-size: 2rem;
          }
          
          .interface-container {
            grid-template-columns: 1fr;
            height: calc(100vh - 300px);
          }
          
          .sidebar {
            display: none;
          }
          
          .message-content {
            max-width: 85%;
          }
        }
      `}</style>
    </div>
  );
}