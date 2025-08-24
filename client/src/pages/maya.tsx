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
  
  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [savingImages, setSavingImages] = useState(new Set<string>());
  const [savedImages, setSavedImages] = useState(new Set<string>());
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Chat history component
  const ChatHistoryLinks = ({ onChatSelect }: { onChatSelect: (chatId: number) => void }) => {
    const { data: chats, isLoading } = useQuery<MayaChat[]>({
      queryKey: ['/api/maya-chats'],
      enabled: !!user,
      staleTime: 30000,
    });

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
              {chat.chatSummary || 'Personal brand photography session'}
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
      if (response.messages) {
        setMessages(response.messages);
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
    setMessages([]);
    setCurrentChatId(null);
    window.history.replaceState({}, '', '/maya');
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await apiRequest('/api/member-maya-chat', 'POST', {
        message: input.trim(),
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

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error", 
        description: "Failed to send message. Please try again."
      });
    } finally {
      setIsTyping(false);
    }
  };

  const generateImages = async (prompt: string) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const response = await apiRequest('/api/generate-images', 'POST', {
        prompt,
        chatId: currentChatId
      });

      if (response.predictionId) {
        // Poll for completion
        const pollForImages = async () => {
          try {
            const statusResponse = await apiRequest(`/api/check-generation/${response.predictionId}`);
            
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
    const styleMessages = {
      'editorial': 'Editorial luxury - magazine sophistication',
      'natural': 'Natural beauty - effortless elegance', 
      'professional': 'Professional power - CEO energy',
      'creative': 'Creative artistic - unique expression',
      'lifestyle': 'Lifestyle natural - authentic moments',
      'confident': 'Confident power - unapologetic strength'
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
      
      {/* Maya Chat Interface - Exact Mockup Implementation */}
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
        
        /* Hero Section */
        .hero {
          height: 100vh;
          background: var(--black);
          color: var(--white);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 80px;
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
        
        /* Hero Content */
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
            margin-top: 60px;
          }
        }
      ` }} />

      {/* Hero Section */}
      <section className="hero">
        {/* Hero Background Image - Maya's photo */}
        <div className="hero-bg">
          <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya - Your Celebrity Stylist" />
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-eyebrow">Your personal brand photoshoot begins</div>
          <h1 className="hero-title">Maya</h1>
          <p className="hero-subtitle">Your Celebrity Stylist</p>
          <button className="hero-cta" onClick={scrollToChat}>Begin Your Session</button>
        </div>
      </section>

      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
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
        <main className="chat-area">
          {/* Chat Header */}
          <div className="chat-header">
            <h1 className="chat-title">Maya Studio Session</h1>
            <p className="chat-subtitle">Your personal brand photographer</p>
          </div>

          {/* Messages Container */}
          <div className="messages-container">
            {messages.length === 0 ? (
              /* Welcome State */
              <div className="welcome-state">
                <div className="maya-avatar">
                  <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya - Your Creative Director" />
                </div>
                <div className="welcome-eyebrow">Personal Brand Photoshoot</div>
                <h2 className="welcome-title">Ready to create something beautiful?</h2>
                <p className="welcome-description">I'm Maya, your creative director. I'll help you create images that tell your story authentically. What kind of energy are you feeling today?</p>
                
                {/* Quick Style Selection */}
                <div className="style-quickselect">
                  <div className="style-option" onClick={() => handleStyleSelect('editorial')}>
                    <div className="style-preview">Editorial</div>
                    <div className="style-label">Magazine Luxury</div>
                  </div>
                  <div className="style-option" onClick={() => handleStyleSelect('natural')}>
                    <div className="style-preview">Natural</div>
                    <div className="style-label">Effortless Beauty</div>
                  </div>
                  <div className="style-option" onClick={() => handleStyleSelect('professional')}>
                    <div className="style-preview">Professional</div>
                    <div className="style-label">CEO Energy</div>
                  </div>
                  <div className="style-option" onClick={() => handleStyleSelect('creative')}>
                    <div className="style-preview">Creative</div>
                    <div className="style-label">Artistic Expression</div>
                  </div>
                  <div className="style-option" onClick={() => handleStyleSelect('lifestyle')}>
                    <div className="style-preview">Lifestyle</div>
                    <div className="style-label">Your Real Life</div>
                  </div>
                  <div className="style-option" onClick={() => handleStyleSelect('confident')}>
                    <div className="style-preview">Confident</div>
                    <div className="style-label">Pure Power</div>
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
                      
                      {/* Generation button */}
                      {message.canGenerate && message.generatedPrompt && (
                        <div className="generate-btn">
                          <button
                            onClick={() => generateImages(message.generatedPrompt!)}
                            disabled={isGenerating}
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
                    <div className="message-avatar">
                      <img src="https://i.postimg.cc/mkqSzq3M/out-1-20.png" alt="Maya" />
                    </div>
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                    <div className="typing-text">Maya is creating your vision...</div>
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
                placeholder="TELL MAYA WHAT KIND OF PHOTOS YOU WANT TO CREATE..."
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
    </>
  );
}