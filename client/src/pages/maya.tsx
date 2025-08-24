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
}

interface MayaChat {
  id: number;
  userId: string;
  chatTitle: string;
  chatSummary?: string;
  createdAt: string;
  updatedAt: string;
}

// Editorial luxury styles
const editorialStyles = `
  :root {
    --editorial-black: #0a0a0a;
    --editorial-white: #ffffff;
    --editorial-gray: #f5f5f5;
    --editorial-mid-gray: #fafafa;
    --editorial-soft-gray: #666666;
    --editorial-accent-line: #e5e5e5;
  }

  .hero-section {
    height: 100vh;
    background: var(--editorial-black);
    color: var(--editorial-white);
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
  }

  .hero-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(10, 10, 10, 0.3);
    backdrop-filter: blur(10px);
    padding: 20px 0;
  }

  .hero-header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .hero-logo {
    font-family: 'Times New Roman', serif;
    font-size: 20px;
    font-weight: 400;
    letter-spacing: -0.01em;
    color: var(--editorial-white);
  }

  .hero-nav {
    display: flex;
    gap: 40px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .hero-nav a {
    color: var(--editorial-white);
    text-decoration: none;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    transition: opacity 0.3s ease;
  }

  .hero-nav a:hover {
    opacity: 0.6;
  }

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
    border: 1px solid var(--editorial-white);
    color: var(--editorial-white);
    background: transparent;
    transition: all 300ms ease;
    cursor: pointer;
  }

  .hero-cta:hover {
    background: var(--editorial-white);
    color: var(--editorial-black);
  }

  .main-chat-container {
    display: flex;
    min-height: 100vh;
    max-width: 1400px;
    margin: 0 auto;
  }

  .chat-sidebar {
    width: 300px;
    background: var(--editorial-gray);
    border-right: 1px solid var(--editorial-accent-line);
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
    color: var(--editorial-soft-gray);
    margin-bottom: 20px;
  }

  .new-session-btn {
    width: 100%;
    padding: 16px 0;
    background: var(--editorial-black);
    color: var(--editorial-white);
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
    background: var(--editorial-soft-gray);
  }

  .session-item {
    padding: 12px 0;
    border-bottom: 1px solid var(--editorial-accent-line);
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
    color: var(--editorial-soft-gray);
    line-height: 1.3;
  }

  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--editorial-white);
  }

  .chat-header {
    padding: 30px 40px;
    border-bottom: 1px solid var(--editorial-accent-line);
    background: var(--editorial-white);
  }

  .chat-title {
    font-family: 'Times New Roman', serif;
    font-size: 24px;
    font-weight: 200;
    margin-bottom: 8px;
  }

  .chat-subtitle {
    font-size: 14px;
    color: var(--editorial-soft-gray);
  }

  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 40px;
  }

  .welcome-container {
    text-align: center;
    max-width: 600px;
    margin: 60px auto;
  }

  .maya-avatar-large {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--editorial-gray);
    margin: 0 auto 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--editorial-soft-gray);
  }

  .welcome-eyebrow {
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--editorial-soft-gray);
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
    color: var(--editorial-soft-gray);
  }

  .editorial-message {
    margin-bottom: 30px;
    max-width: 700px;
  }

  .editorial-message.maya {
    margin-right: auto;
  }

  .editorial-message.user {
    margin-left: auto;
    text-align: right;
  }

  .message-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 12px;
  }

  .editorial-message.user .message-header {
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
    color: var(--editorial-soft-gray);
  }

  .editorial-message.user .message-avatar {
    background: var(--editorial-black);
    color: var(--editorial-white);
  }

  .message-sender {
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--editorial-soft-gray);
  }

  .message-time {
    font-size: 10px;
    color: var(--editorial-soft-gray);
    opacity: 0.6;
  }

  .message-content {
    background: var(--editorial-gray);
    padding: 24px;
    position: relative;
  }

  .editorial-message.user .message-content {
    background: var(--editorial-black);
    color: var(--editorial-white);
  }

  .message-text {
    font-size: 15px;
    line-height: 1.6;
  }

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
    background: var(--editorial-soft-gray);
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
    color: var(--editorial-soft-gray);
  }

  .input-area {
    padding: 30px 40px;
    border-top: 1px solid var(--editorial-accent-line);
    background: var(--editorial-white);
  }

  .input-container {
    display: flex;
    gap: 15px;
    align-items: flex-end;
  }

  .input-field {
    flex: 1;
    border: 1px solid var(--editorial-accent-line);
    background: var(--editorial-white);
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
    border-color: var(--editorial-black);
  }

  .input-field::placeholder {
    color: var(--editorial-soft-gray);
  }

  .send-btn {
    padding: 16px 24px;
    background: var(--editorial-black);
    color: var(--editorial-white);
    border: none;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 300ms ease;
  }

  .send-btn:hover {
    background: var(--editorial-soft-gray);
  }

  .send-btn:disabled {
    background: var(--editorial-accent-line);
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .main-chat-container {
      flex-direction: column;
      height: auto;
    }
    
    .chat-sidebar {
      width: 100%;
      height: auto;
      order: 2;
    }
    
    .chat-main {
      order: 1;
      min-height: 70vh;
    }
    
    .hero-header-content {
      padding: 0 20px;
    }
    
    .hero-nav {
      display: none;
    }
    
    .messages-area,
    .input-area,
    .chat-header {
      padding: 20px;
    }
  }
`;

// Chat History Links Component
function ChatHistoryLinks({ onChatSelect }: { onChatSelect: (chatId: number) => void }) {
  const { data: chats = [] } = useQuery<MayaChat[]>({
    queryKey: ['/api/maya-chats'],
    retry: false,
  });

  if (!chats || chats.length === 0) {
    return (
      <div className="text-center">
        <div className="session-title text-sm text-gray-500 font-light">Start your first style session</div>
        <div className="session-preview text-xs text-gray-400 mt-1">Maya will guide you through creating your perfect images</div>
      </div>
    );
  }

  return (
    <div>
      {chats.slice(0, 5).map((chat: MayaChat) => (
        <div 
          key={chat.id} 
          className="session-item"
          onClick={() => onChatSelect(chat.id)}
        >
          <div className="session-title">{chat.chatTitle}</div>
          <div className="session-preview">{chat.chatSummary || 'Style consultation'}</div>
        </div>
      ))}
      {chats.length > 5 && (
        <div className="text-center mt-4">
          <div className="session-preview">{chats.length - 5} more sessions</div>
        </div>
      )}
    </div>
  );
}

export default function Maya() {
  const { user, isLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // LUXURY LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-3 border border-gray-300 rounded-full animate-pulse"></div>
            <div className="absolute inset-6 bg-black/5 rounded-full"></div>
          </div>
          
          <div className="font-serif text-xl font-light uppercase tracking-[0.3em] text-black mb-3">
            Preparing Your Style Session
          </div>
          <p className="text-sm text-gray-600 font-light tracking-wide max-w-xs mx-auto leading-relaxed">
            Maya is curating your personalized collection and latest fashion trends...
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <span className="w-2 h-2 bg-black/20 rounded-full animate-pulse"></span>
            <span className="w-2 h-2 bg-black/20 rounded-full animate-pulse delay-100"></span>
            <span className="w-2 h-2 bg-black/20 rounded-full animate-pulse delay-200"></span>
          </div>
        </div>
      </div>
    );
  }

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Simple URL parameter reading - ORIGINAL WORKING VERSION
  const urlParams = new URLSearchParams(window.location.search);
  const chatIdFromUrl = urlParams.get('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [savedImages, setSavedImages] = useState<Set<string>>(new Set());
  const [savingImages, setSavingImages] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTrackerId, setCurrentTrackerId] = useState<number | null>(null);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to chat with Maya AI",
      });
      setLocation('/login');
      return;
    }
  }, [user, isLoading, setLocation, toast]);

  // CRITICAL: Store initialization ref to prevent any refresh loops
  const initializationRef = useRef(false);
  const chatLoadedRef = useRef(false);
  
  // BULLETPROOF: Initialize once and lock permanently
  useEffect(() => {
    if (user && user.id && !initializationRef.current && !isGenerating) {
      console.log('🚀 Maya: Initializing chat ONCE - PERMANENT LOCK');
      initializationRef.current = true;
      setIsInitialized(true);
      
      if (chatIdFromUrl && !chatLoadedRef.current) {
        console.log('📂 Maya: Loading existing chat from URL:', chatIdFromUrl);
        chatLoadedRef.current = true;
        
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
        console.log('🧹 Maya: URL parameter cleared immediately');
        
        loadChatHistory(parseInt(chatIdFromUrl));
      } else if (!chatIdFromUrl && messages.length === 0) {
        console.log('💬 Maya: Creating new chat with welcome message'); 
        setMessages([{
          role: 'maya',
          content: `Hey ${user.firstName || 'beautiful'}! I'm Maya - your fashion-obsessed celebrity stylist and creative director! 💫\n\nI live for creating stunning, trend-forward editorial moments that tell YOUR unique story. I'm all about that 2025 fashion energy - urban street style, quiet luxury, and authentic creative expression.\n\nTell me what kind of vibe you're feeling today and I'll create something incredible for you! Think fashion week energy, not basic portrait poses.\n\nWhat's calling to your creative soul?`,
          timestamp: new Date().toISOString()
        }]);
      }
    }
  }, [user?.id]);

  // All existing functions preserved exactly as they were
  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageContent = input.trim();
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      let chatIdForSaving = currentChatId;
      if (!currentChatId && messages.length === 1) {
        const chatTitle = messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : '');
        const chatResponse = await fetch('/api/maya-chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            chatTitle,
            chatSummary: messageContent.slice(0, 100)
          })
        });
        
        if (chatResponse.ok) {
          const chat = await chatResponse.json();
          chatIdForSaving = chat.id;
          setCurrentChatId(chat.id);
          queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });
        }
      }

      const response = await fetch('/api/maya-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: messageContent,
          chatHistory: messages
        }),
      });

      const data = await response.json();

      const mayaMessage: ChatMessage = {
        role: 'maya',
        content: data.message || "I'm having a creative moment! Try asking me again about your photo vision.",
        canGenerate: data.canGenerate || false,
        generatedPrompt: data.generatedPrompt || undefined,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, mayaMessage]);

      // Save both messages to database if we have a chat ID
      if (chatIdForSaving) {
        try {
          await fetch(`/api/maya-chats/${chatIdForSaving}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              role: 'user',
              content: userMessage.content
            })
          });

          const mayaMessageResponse = await fetch(`/api/maya-chats/${chatIdForSaving}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              role: 'maya',
              content: mayaMessage.content,
              generatedPrompt: mayaMessage.generatedPrompt
            })
          });
          
          if (mayaMessageResponse.ok) {
            const savedMayaMessage = await mayaMessageResponse.json();
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMayaIndex = newMessages.map(m => m.role).lastIndexOf('maya');
              if (lastMayaIndex >= 0) {
                newMessages[lastMayaIndex] = {
                  ...newMessages[lastMayaIndex],
                  id: savedMayaMessage.id
                };
              }
              return newMessages;
            });
          }

          queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });
        } catch (saveError) {
          console.error('Error saving messages to history:', saveError);
        }
      }
    } catch (error) {
      console.error('Maya chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Keep all existing functions exactly the same
  const pollForTrackerCompletion = async (trackerId: number) => {
    const maxAttempts = 40;
    let attempts = 0;
    let authRetries = 0;
    const maxAuthRetries = 3;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const poll = async () => {
      try {
        attempts++;
        setGenerationProgress(Math.min(90, (attempts / maxAttempts) * 90));
        
        const response = await fetch(`/api/generation-tracker/${trackerId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.status === 401 && authRetries < maxAuthRetries) {
          authRetries++;
          await new Promise(resolve => setTimeout(resolve, 2000));
          return poll();
        }
        
        if (response.status === 401) {
          console.log('🔐 Maya polling: Authentication failed after retries for tracker', trackerId);
          setIsGenerating(false);
          setGenerationProgress(0);
          toast({
            title: "Authentication Required",
            description: "Please refresh the page and try again.",
          });
          return;
        }
        
        if (!response.ok) {
          console.error(`🔐 Maya polling error: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch tracker status: ${response.status}`);
        }
        
        const tracker = await response.json();
        
        if (tracker.status === 'completed' && tracker.imageUrls && tracker.imageUrls.length > 0) {
          console.log('✅ Maya: Generation completed! Images:', tracker.imageUrls);
          
          setGenerationProgress(100);
          setIsGenerating(false);  
          setGeneratedImages(tracker.imageUrls);
          
          setMessages(prevMessages => {
            const lastMayaIndex = prevMessages.map(m => m.role).lastIndexOf('maya');
            if (lastMayaIndex >= 0) {
              const updatedMessages = [...prevMessages];
              updatedMessages[lastMayaIndex] = {
                ...updatedMessages[lastMayaIndex],
                imagePreview: tracker.imageUrls
              };
              
              initializationRef.current = true;
              chatLoadedRef.current = true;
              
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, '', cleanUrl);
              
              const messageId = updatedMessages[lastMayaIndex].id;
              if (currentChatId && messageId) {
                requestAnimationFrame(() => {
                  fetch(`/api/maya-chats/${currentChatId}/messages/${messageId}/update-preview`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      imagePreview: JSON.stringify(tracker.imageUrls)
                    })
                  }).then(response => {
                    if (response.ok) {
                      console.log('✅ Maya: Images saved to database successfully - CHAT PRESERVED');
                    } else {
                      console.error('❌ Maya: Failed to save images to database');
                    }
                  }).catch(error => console.error('Error saving images to database:', error));
                });
              }
              
              return updatedMessages;
            } else {
              console.error('❌ Maya: Could not find Maya message to update with images!');
              return prevMessages;
            }
          });
          
          requestAnimationFrame(() => {
            toast({
              title: "Photoshoot Complete!",
              description: `${tracker.imageUrls.length} stunning photos are ready to view!`,
            });
          });
          
          return;
        }
        
        if (tracker.status === 'failed') {
          setIsGenerating(false);
          return;
        }
        
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setIsGenerating(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setIsGenerating(false);
        }
      }
    };
    
    poll();
  };

  const generateImages = async (prompt: string) => {
    console.log('MAYA: Starting image generation:', { prompt, user });
    setIsGenerating(true);
    setGeneratedImages([]);
    setGenerationProgress(0);
    setCurrentTrackerId(null);
    
    try {
      const data = await apiRequest('/api/maya-generate-images', 'POST', {
        customPrompt: prompt
      });

      if (data.success) {
        if (data.images && data.images.length > 0) {
          setGeneratedImages(data.images);
          setGenerationProgress(100);
          setIsGenerating(false);
          
          toast({
            title: "Photoshoot Complete!",
            description: "Your stunning photos are ready to view!",
          });
          return;
        }

        if (data.trackerId) {
          setCurrentTrackerId(data.trackerId);
          
          toast({
            title: "Maya is creating your photoshoot",
            description: "Watch your editorial photos generate in real-time!",
          });
          
          pollForTrackerCompletion(data.trackerId);
          return;
        }
        
        if (data.requiresTraining) {
          toast({
            title: "AI Model Required",
            description: data.error || "Please complete your AI model training first.",
          });
          setTimeout(() => {
            setLocation(data.redirectTo || '/simple-training');
          }, 1500);
          return;
        }
        
      } else {
        throw new Error(data.error || 'Failed to generate images');
      }
    } catch (error) {
      console.error('Error generating images:', error);
      setIsGenerating(false);
    }
  };

  const saveSelectedToGallery = async (selectedUrls: string[]) => {
    if (!currentTrackerId || selectedUrls.length === 0) return;
    
    try {
      const response = await fetch('/api/save-preview-to-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          trackerId: currentTrackerId,
          selectedImageUrls: selectedUrls
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save images');
      }
      
      selectedUrls.forEach(url => {
        setSavedImages(prev => new Set([...Array.from(prev), url]));
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
      
    } catch (error) {
      console.error('Error saving to gallery:', error);
    }
  };

  const saveToGallery = async (imageUrl: string) => {
    console.log('💖 HEART CLICK: Starting save process for:', imageUrl);
    
    if (savedImages.has(imageUrl)) {
      console.log('💖 HEART CLICK: Image already saved, ignoring click');
      return;
    }
    
    if (savingImages.has(imageUrl)) {
      console.log('💖 HEART CLICK: Save already in progress, ignoring click');
      return;
    }
    
    setSavingImages(prev => new Set([...Array.from(prev), imageUrl]));
    
    try {
      let trackerId = currentTrackerId;
      console.log('💖 HEART CLICK: Current tracker ID:', trackerId);
      
      if (!trackerId) {
        const match = imageUrl.match(/tracker_(\d+)_/);
        if (match) {
          trackerId = parseInt(match[1]);
          console.log('💖 HEART CLICK: Extracted tracker ID from URL:', trackerId);
        }
      }
      
      if (!trackerId) {
        console.error('💖 HEART CLICK: No tracker ID available');
        throw new Error('No tracker ID available for this image');
      }
      
      const response = await fetch('/api/save-preview-to-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          trackerId: trackerId,
          selectedImageUrls: [imageUrl]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save image');
      }
      
      setSavedImages(prev => new Set([...Array.from(prev), imageUrl]));
      
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
      
      console.log('✅ HEART CLICK: Image saved successfully to gallery');
      
    } catch (error) {
      console.error('💖 HEART CLICK: Error saving to gallery:', error);
    } finally {
      setSavingImages(prev => {
        const updated = new Set(Array.from(prev));
        updated.delete(imageUrl);
        return updated;
      });
    }
  };

  const loadChatHistory = async (chatId: number) => {
    try {
      const response = await fetch(`/api/maya-chats/${chatId}/messages`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }

      const data = await response.json();
      const loadedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
        imagePreview: msg.imagePreview ? JSON.parse(msg.imagePreview) : undefined,
        generatedPrompt: msg.generatedPrompt
      }));

      setMessages(loadedMessages);
      setCurrentChatId(chatId);
      
      const savedUrls = loadedMessages
        .filter(msg => msg.imagePreview)
        .flatMap(msg => msg.imagePreview || []);
      setSavedImages(new Set(savedUrls));
      
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
      });
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToChat = () => {
    const heroHeight = window.innerHeight;
    window.scrollTo({
      top: heroHeight,
      behavior: 'smooth'
    });
  };

  const startNewSession = () => {
    setMessages([{
      role: 'maya',
      content: `Hey ${user?.firstName || 'beautiful'}! I'm Maya - your fashion-obsessed celebrity stylist and creative director! 💫\n\nI live for creating stunning, trend-forward editorial moments that tell YOUR unique story. I'm all about that 2025 fashion energy - urban street style, quiet luxury, and authentic creative expression.\n\nTell me what kind of vibe you're feeling today and I'll create something incredible for you! Think fashion week energy, not basic portrait poses.\n\nWhat's calling to your creative soul?`,
      timestamp: new Date().toISOString()
    }]);
    setCurrentChatId(null);
    setGeneratedImages([]);
    setSavedImages(new Set());
    setInput('');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div>
      {/* Inject editorial styles */}
      <style dangerouslySetInnerHTML={{ __html: editorialStyles }} />
      
      {/* Hero Section */}
      <section className="hero-section">
        {/* Header overlay */}
        <header className="hero-header">
          <div className="hero-header-content">
            <div className="hero-logo">SSELFIE</div>
            <ul className="hero-nav">
              <li><a href="/studio">Studio</a></li>
              <li><a href="/simple-training">Train</a></li>
              <li><a href="/maya">Photoshoot</a></li>
              <li><a href="/sselfie-gallery">Gallery</a></li>
              <li><a href="/profile">Profile</a></li>
              <li><a href="/logout">Logout</a></li>
            </ul>
          </div>
        </header>

        {/* Hero Background Image */}
        <div className="hero-bg">
          <img src="https://i.postimg.cc/KYZtzxXw/out-1-35.png" alt="Maya - Your Celebrity Stylist" />
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-eyebrow">Your personal brand photoshoot begins</div>
          <h1 className="hero-title">Maya</h1>
          <p className="hero-subtitle">Your Celebrity Stylist</p>
          <button className="hero-cta" onClick={scrollToChat}>Begin Your Session</button>
        </div>
      </section>

      <div className="main-chat-container">
        {/* Sidebar */}
        <aside className="chat-sidebar">
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
        <main className="chat-main">
          {/* Chat Header */}
          <div className="chat-header">
            <h1 className="chat-title">Maya Studio Session</h1>
            <p className="chat-subtitle">Your personal brand photographer</p>
          </div>

          {/* Messages Container */}
          <div className="messages-area">
            {messages.length === 0 ? (
              /* Welcome State */
              <div className="welcome-container">
                <div className="maya-avatar-large">M</div>
                <div className="welcome-eyebrow">Personal Brand Photoshoot</div>
                <h2 className="welcome-title">Ready to create something beautiful?</h2>
                <p className="welcome-description">I'm Maya, your creative director. I'll help you create images that tell your story authentically. What kind of energy are you feeling today?</p>
              </div>
            ) : (
              /* Messages */
              <div>
                {messages.map((message, index) => (
                  <div key={index} className={`editorial-message ${message.role}`}>
                    <div className="message-header">
                      {message.role === 'maya' && (
                        <>
                          <div className="message-avatar">M</div>
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
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          {message.imagePreview.map((imageUrl, imgIndex) => (
                            <div key={imgIndex} className="relative group cursor-pointer">
                              <img
                                src={imageUrl}
                                alt={`Generated image ${imgIndex + 1}`}
                                className="w-full h-48 object-cover rounded transition-transform hover:scale-105"
                                onClick={() => setSelectedImage(imageUrl)}
                              />
                              
                              {/* Heart save button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveToGallery(imageUrl);
                                }}
                                disabled={savingImages.has(imageUrl)}
                                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-full transition-all shadow-lg opacity-0 group-hover:opacity-100"
                                title={savedImages.has(imageUrl) ? 'Saved to gallery' : 'Save to gallery'}
                              >
                                {savingImages.has(imageUrl) ? (
                                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : savedImages.has(imageUrl) ? (
                                  <span className="text-red-500 text-sm">♥</span>
                                ) : (
                                  <span className="text-gray-400 hover:text-red-500 text-sm transition-colors">♡</span>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Generation button */}
                      {message.canGenerate && message.generatedPrompt && (
                        <div className="mt-4 pt-4 border-t border-gray-300">
                          <button
                            onClick={() => generateImages(message.generatedPrompt!)}
                            disabled={isGenerating}
                            className="px-6 py-3 bg-black text-white font-medium tracking-wider uppercase text-xs hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                          >
                            {isGenerating ? `Generating... ${generationProgress}%` : 'Generate Photos'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="typing-indicator">
                    <div className="message-avatar">M</div>
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                    <div className="typing-text">Maya is creating your vision...</div>
                  </div>
                )}
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
                placeholder="Tell Maya what kind of photos you want to create..."
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
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="send-btn"
              >
                Send
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
              <div className="text-sm font-medium">Maya AI Generated Photo</div>
              <div className="text-xs text-white/80">Click heart to save permanently</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}