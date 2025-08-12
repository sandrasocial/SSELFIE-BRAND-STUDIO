import { KeyboardEvent } from 'react';
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
// import { MayaChatInterface } from '@/components/maya/MayaChatInterface';

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

// Chat History Links Component - integrated into Maya Dashboard
function ChatHistoryLinks({ onChatSelect }: { onChatSelect: (chatId: number) => void }) {
  const { data: chats = [] } = useQuery<MayaChat[]>({
    queryKey: ['/api/maya-chats'],
    retry: false,
  });

  if (!chats || chats.length === 0) {
    return (
      <div className="p-4 text-center bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-500 font-light">Start your first style session</div>
        <div className="text-xs text-gray-400 mt-1">Maya will guide you through creating your perfect images</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chats.slice(0, 5).map((chat: MayaChat) => (
        <div 
          key={chat.id} 
          className="text-xs text-gray-600 hover:text-black cursor-pointer transition-colors leading-relaxed"
          onClick={() => onChatSelect(chat.id)}
        >
          {chat.chatTitle}
        </div>
      ))}
      {chats.length > 5 && (
        <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          {chats.length - 5} more sessions
        </div>
      )}
    </div>
  );
}

export default function Maya() {
  const { user, isLoading } = useAuth();
  
  // CRITICAL FIX: Prevent chat refresh from useAuth re-renders
  const [isInitialized, setIsInitialized] = useState(false);
  
  // LUXURY LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          {/* LUXURY LOADING ANIMATION */}
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
    // ABSOLUTELY BULLETPROOF: Multiple layers of protection
    if (user && user.id && !initializationRef.current && !isGenerating) {
      console.log('🚀 Maya: Initializing chat ONCE - PERMANENT LOCK');
      initializationRef.current = true; // PERMANENT LOCK
      setIsInitialized(true);
      
      if (chatIdFromUrl && !chatLoadedRef.current) {
        console.log('📂 Maya: Loading existing chat from URL:', chatIdFromUrl);
        chatLoadedRef.current = true; // PERMANENT CHAT LOAD LOCK
        
        // CRITICAL: Clear URL parameter IMMEDIATELY to prevent refresh loops
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
        console.log('🧹 Maya: URL parameter cleared immediately');
        
        loadChatHistory(parseInt(chatIdFromUrl));
      } else if (!chatIdFromUrl && messages.length === 0) {
        // Initialize with Maya's welcome message for new session
        console.log('💬 Maya: Creating new chat with welcome message'); 
        setMessages([{
          role: 'maya',
          content: `Hey ${user.firstName || 'beautiful'}! I'm Maya - your fashion-obsessed celebrity stylist and creative director! 💫\n\nI live for creating stunning, trend-forward editorial moments that tell YOUR unique story. I'm all about that 2025 fashion energy - urban street style, quiet luxury, and authentic creative expression.\n\nTell me what kind of vibe you're feeling today and I'll create something incredible for you! Think fashion week energy, not basic portrait poses.\n\nWhat's calling to your creative soul?`,
          timestamp: new Date().toISOString()
        }]);
      }
    }
  }, [user?.id]); // Minimal dependencies

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
      // Create chat if this is the first user message (messages.length === 1 means only Maya's welcome)
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
          // Invalidate chat history to refresh sidebar immediately
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
          
          // Get the saved message ID for future updates
          if (mayaMessageResponse.ok) {
            const savedMayaMessage = await mayaMessageResponse.json();
            // Update the message in state with the database ID
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

          // Invalidate chat history to refresh sidebar
          queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });
        } catch (saveError) {
          console.error('Error saving messages to history:', saveError);
          // Don't show error to user - just log it
        }
      }
    } catch (error) {
      console.error('Maya chat error:', error);
      // Remove toast - Maya explains everything in chat
    } finally {
      setIsTyping(false);
    }
  };

  // 🔑 FIXED: Poll tracker for image completion with robust authentication
  const pollForTrackerCompletion = async (trackerId: number) => {
    const maxAttempts = 40; // 2 minutes total (3 second intervals)
    let attempts = 0;
    let authRetries = 0;
    const maxAuthRetries = 3;
    
    // Wait for authentication to stabilize before starting polling
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const poll = async () => {
      try {
        attempts++;
        setGenerationProgress(Math.min(90, (attempts / maxAttempts) * 90));
        
        // Poll tracker status
        const response = await fetch(`/api/generation-tracker/${trackerId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        // Handle authentication errors with retries
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
        // Maya polling successfully
        
        if (tracker.status === 'completed' && tracker.imageUrls && tracker.imageUrls.length > 0) {
          console.log('✅ Maya: Generation completed! Images:', tracker.imageUrls);
          console.log('🔍 Maya: BEFORE State Update - About to update messages with images');
          
          // STOP ALL POLLING IMMEDIATELY
          setGenerationProgress(100);
          setIsGenerating(false);  
          setGeneratedImages(tracker.imageUrls);
          
          // CRITICAL FIX: Use callback pattern to prevent state reset
          setMessages(prevMessages => {
            console.log('🔍 Maya: INSIDE State Update - Messages count:', prevMessages.length);
            console.log('🔍 Maya: INSIDE State Update - Messages:', prevMessages.map(m => `${m.role}: ${m.content?.substring(0, 50)}...`));
            
            // Find the last Maya message
            const lastMayaIndex = prevMessages.map(m => m.role).lastIndexOf('maya');
            if (lastMayaIndex >= 0) {
              console.log('🔄 Maya: Found Maya message at index', lastMayaIndex, 'updating with images');
              
              // Create new array with updated message - NO STATE RESET
              const updatedMessages = [...prevMessages];
              updatedMessages[lastMayaIndex] = {
                ...updatedMessages[lastMayaIndex],
                imagePreview: tracker.imageUrls
              };
              
              console.log('✅ Maya: Updated messages count:', updatedMessages.length);
              console.log('✅ Maya: Updated message has images:', !!updatedMessages[lastMayaIndex].imagePreview);
              
              // CRITICAL: BLOCK ALL REFRESH TRIGGERS DURING IMAGE UPDATE
              initializationRef.current = true; // TRIPLE LOCK
              chatLoadedRef.current = true; // TRIPLE LOCK
              
              // Images successfully added to chat
              
              // CRITICAL: Ensure URL is completely clean after image completion
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, '', cleanUrl);
              console.log('🧹 Maya: URL cleaned after image completion');
              
              // ASYNC database save - don't block
              const messageId = updatedMessages[lastMayaIndex].id;
              if (currentChatId && messageId) {
                console.log('💾 Maya: Scheduling database save for message', messageId);
                // Completely async - no blocking
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
          
          // Success notification - completely async
          requestAnimationFrame(() => {
            toast({
              title: "Photoshoot Complete!",
              description: `${tracker.imageUrls.length} stunning photos are ready to view!`,
            });
          });
          
          console.log('🛑 Maya: STOPPING POLLING - Images added to chat');
          return; // STOP POLLING
        }
        
        if (tracker.status === 'failed') {
          setIsGenerating(false);
          // Remove toast - Maya explains everything in chat
          return;
        }
        
        // Continue polling
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setIsGenerating(false);
          // Remove toast - Maya explains everything in chat
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

  // 🔑 NEW: Generate images using tracker system (preview-first workflow)
  const generateImages = async (prompt: string) => {
    console.log('MAYA: Starting image generation:', { prompt, user });
    setIsGenerating(true);
    setGeneratedImages([]);
    setGenerationProgress(0);
    setCurrentTrackerId(null);
    
    try {
      console.log('🔐 Maya: Making authenticated request to /api/maya-generate-images');
      const data = await apiRequest('/api/maya-generate-images', 'POST', {
        customPrompt: prompt
      });
      console.log('📡 Maya: Server response:', data);

      // Handle successful response
      if (data.success) {
        
        // Check if images are already available (immediate completion)
        if (data.images && data.images.length > 0) {
          console.log('✅ Maya: Images completed immediately!', data.images);
          setGeneratedImages(data.images);
          setGenerationProgress(100);
          setIsGenerating(false);
          
          toast({
            title: "Photoshoot Complete!",
            description: "Your stunning photos are ready to view!",
          });
          return;
        }

        // Start live progress tracking with trackerId (working pattern from 2 days ago)
        if (data.trackerId) {
          console.log('🎬 Maya: Starting live progress tracking with tracker:', data.trackerId);
          setCurrentTrackerId(data.trackerId);
          
          toast({
            title: "Maya is creating your photoshoot",
            description: "Watch your editorial photos generate in real-time!",
          });
          
          // Start polling for completion
          pollForTrackerCompletion(data.trackerId);
          return;
        }
        
        // Check if it's a model validation error
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
      // Remove toast - Maya explains everything in chat
      setIsGenerating(false);
    }
  };

  // 🔑 NEW: Save selected preview images to permanent gallery
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
      
      // Mark images as saved
      selectedUrls.forEach(url => {
        setSavedImages(prev => new Set([...Array.from(prev), url]));
      });
      
      // Refresh both gallery endpoints to show newly saved images
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
      
      // Remove toast - Maya explains everything in chat
    } catch (error) {
      console.error('Error saving to gallery:', error);
      // Remove toast - Maya explains everything in chat
    }
  };

  // Save single image to gallery with heart click
  const saveToGallery = async (imageUrl: string) => {
    if (savedImages.has(imageUrl) || savingImages.has(imageUrl)) return;
    
    setSavingImages(prev => new Set([...Array.from(prev), imageUrl]));
    
    try {
      // Extract tracker ID from image URL if currentTrackerId is null
      let trackerId = currentTrackerId;
      if (!trackerId) {
        const match = imageUrl.match(/tracker_(\d+)_/);
        if (match) {
          trackerId = parseInt(match[1]);
          console.log('🔴 HEART CLICK: Extracted tracker ID from URL:', trackerId);
        }
      }
      
      if (!trackerId) {
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
        throw new Error(data.error || 'Failed to save images');
      }
      
      // Mark image as saved - this should turn the heart red
      setSavedImages(prev => new Set([...Array.from(prev), imageUrl]));
      
      // Refresh both gallery endpoints to show newly saved images
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
      
    } catch (error) {
      console.error('Error saving to gallery:', error);
    } finally {
      setSavingImages(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(imageUrl);
        return newSet;
      });
    }
  };

  const loadChatHistory = async (chatId: number) => {
    try {
      console.log('Loading chat history for chatId:', chatId);
      
      // Load SPECIFIC chat messages (SESSION-BASED)
      const messagesResponse = await fetch(`/api/maya-chats/${chatId}/messages`, {
        credentials: 'include'
      });
      
      if (messagesResponse.ok) {
        const dbMessages = await messagesResponse.json();
        console.log('Loaded messages from database:', dbMessages);
        
        // If no messages found, start with Maya's welcome
        if (!dbMessages || dbMessages.length === 0) {
          setMessages([{
            role: 'maya',
            content: `Hey ${user?.firstName || 'gorgeous'}! Welcome back to our conversation. What new vision are we creating today?`,
            timestamp: new Date().toISOString()
          }]);
        } else {
          const formattedMessages: ChatMessage[] = dbMessages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.createdAt,
            generatedPrompt: msg.generatedPrompt,
            canGenerate: !!msg.generatedPrompt,
            imagePreview: msg.imagePreview ? (() => {
              try {
                const parsed = JSON.parse(msg.imagePreview);
                // Filter for valid S3 URLs
                if (Array.isArray(parsed)) {
                  return parsed.filter(url => 
                    typeof url === 'string' && 
                    (url.startsWith('http') || url.startsWith('https'))
                  );
                }
                return undefined;
              } catch (e) {
                console.warn('Failed to parse image preview:', e);
                return undefined;
              }
            })() : undefined
          }));
          setMessages(formattedMessages);
        }
        setCurrentChatId(chatId);
        
        // Clear any generated images from previous session
        setGeneratedImages([]);
        setCurrentTrackerId(null);
      } else {
        console.error('Failed to load messages:', messagesResponse.status);
        // Fallback to new conversation
        setMessages([{
          role: 'maya',
          content: `Hey ${user?.firstName || 'gorgeous'}! I'm Maya. Let's create something amazing together!`,
          timestamp: new Date().toISOString()
        }]);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback to new conversation
      setMessages([{
        role: 'maya',
        content: `Hey ${user?.firstName || 'gorgeous'}! I'm Maya. Let's create something amazing together!`,
        timestamp: new Date().toISOString()
      }]);
      setCurrentChatId(chatId);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Maya AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      {/* Editorial Hero Section */}
      <EditorialImageBreak 
        src="https://i.postimg.cc/sgmtqFrQ/out-0-1.webp"
        alt="Maya - Your Celebrity Stylist & Personal Brand Expert"
        height="large"
        overlay={true}
        overlayText="MAYA - YOUR CELEBRITY STYLIST"
      />

      {/* Main Chat Interface */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Chat Area - Main Column */}
            <div className="lg:col-span-2">
              <div className="bg-[#f5f5f5] min-h-[500px] flex flex-col">
                {/* Chat Header */}
                <div className="border-b border-gray-200 p-6 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-times text-xl font-light text-black">Chat with Maya</h3>
                      <p className="text-sm text-[#666666] mt-1">Your photoshoot session</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMessages([{
                            role: 'maya',
                            content: `Hey ${user?.firstName || 'gorgeous'}! Ready for another amazing photoshoot? What's the vision this time?`,
                            timestamp: new Date().toISOString()
                          }]);
                          setCurrentChatId(null);
                          window.history.replaceState({}, '', '/maya');
                        }}
                        className="text-sm"
                      >
                        New Session
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Welcome Message */}
                  {messages.length <= 1 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-white mx-auto mb-6 overflow-hidden border border-gray-200">
                        <img 
                          src="https://i.postimg.cc/sgmtqFrQ/out-0-1.webp"
                          alt="Maya"
                          className="w-full h-full object-cover object-center top"
                        />
                      </div>
                      <h4 className="font-times text-xl font-light text-black mb-4">
                        Hey {user?.firstName || 'gorgeous'}!
                      </h4>
                      <p className="text-sm text-[#666666] mb-6 max-w-md mx-auto leading-relaxed">
                        I'm Maya - your warmest, most fashionable best friend who happens to style A-listers! Choose a trending style to get started:
                      </p>
                      <div className="space-y-3 text-xs text-[#666666] max-w-sm mx-auto">
                        <div className="p-3 bg-white border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer" 
                             onClick={() => setInput("Street Fashion Shoot - Urban cool with quiet luxury touches")}>
                          <span className="font-medium">Street Fashion Shoot</span> - Urban cool with quiet luxury
                        </div>
                        <div className="p-3 bg-white border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                             onClick={() => setInput("Golden Hour Portrait - Soft romantic lighting for magazine glow")}>
                          <span className="font-medium">Golden Hour Portrait</span> - Soft romantic lighting
                        </div>
                        <div className="p-3 bg-white border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                             onClick={() => setInput("Scandinavian Nature - Clean minimal vibes with natural beauty")}>
                          <span className="font-medium">Scandinavian Nature</span> - Clean minimal vibes
                        </div>
                        <div className="p-3 bg-white border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                             onClick={() => setInput("Close-Up Elegance - Editorial portraits that capture essence")}>
                          <span className="font-medium">Close-Up Elegance</span> - Editorial portraits
                        </div>
                        <div className="p-3 bg-white border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                             onClick={() => setInput("Mob Wife Aesthetic - Oversized power pieces with dramatic flair")}>
                          <span className="font-medium">Mob Wife Aesthetic</span> - Oversized power pieces
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chat Messages */}
                  {messages.length > 1 && messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-2xl ${message.role === 'user' ? 'bg-black text-white' : 'bg-white text-black border border-gray-200'} p-4 sm:p-6`}>
                        <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                          {message.content}
                        </div>
                        
                        {/* Generate Images Button */}
                        {message.role === 'maya' && message.canGenerate && message.generatedPrompt && !message.imagePreview && (
                          <div className="mt-4">
                            <Button
                              onClick={() => generateImages(message.generatedPrompt!)}
                              disabled={isGenerating}
                              className="bg-black text-white hover:bg-gray-800 text-sm"
                            >
                              {isGenerating ? 'Creating Your Photos...' : 'Create These Photos'}
                            </Button>
                            
                            {/* Progress Bar */}
                            {isGenerating && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-xs mb-2">
                                  <span className="text-gray-600">Maya is creating your photos...</span>
                                  <span className="text-gray-600">{Math.round(generationProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 h-2">
                                  <div 
                                    className="h-2 bg-black transition-all duration-300 ease-out"
                                    style={{ width: `${generationProgress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  Estimated time: 35-50 seconds • Creating your professional photos
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 🔑 NEW: Enhanced Image Preview Grid with Heart-Save */}
                        {message.role === 'maya' && message.imagePreview && (
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium text-black">Your Maya Photos</h4>
                              <p className="text-xs text-gray-500">Click to view full size • Heart to save permanently</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {message.imagePreview.map((imageUrl, imgIndex) => (
                                <div key={imgIndex} className="relative group">
                                  <div className="relative overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                                    <img 
                                      src={imageUrl}
                                      alt={`Maya generated image ${imgIndex + 1}`}
                                      className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                      onClick={() => setSelectedImage(imageUrl)}
                                    />
                                    
                                    {/* Heart Save Button */}
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
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: savedImages.has(imageUrl) ? 'rgba(255, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                        border: 'none',
                                        color: savedImages.has(imageUrl) ? '#ffffff' : '#666666',
                                        fontSize: '16px',
                                        cursor: savingImages.has(imageUrl) ? 'not-allowed' : 'pointer',
                                        borderRadius: '50%',
                                        transition: 'all 300ms ease',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                        zIndex: 10
                                      }}
                                      title={savedImages.has(imageUrl) ? 'Saved to gallery' : 'Save to gallery'}
                                      onMouseEnter={(e) => {
                                        if (!savingImages.has(imageUrl)) {
                                          e.currentTarget.style.background = savedImages.has(imageUrl) ? 'rgba(255, 68, 68, 1)' : 'rgba(255, 255, 255, 1)';
                                          e.currentTarget.style.transform = 'scale(1.1)';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!savingImages.has(imageUrl)) {
                                          e.currentTarget.style.background = savedImages.has(imageUrl) ? 'rgba(255, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.9)';
                                          e.currentTarget.style.transform = 'scale(1)';
                                        }
                                      }}
                                    >
                                      {savingImages.has(imageUrl) ? '⟳' : (savedImages.has(imageUrl) ? '♥' : '♡')}
                                    </button>
                                    
                                    {/* Subtle Saved Indicator */}
                                    {savedImages.has(imageUrl) && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                        <div className="text-white text-xs font-medium">
                                          ✓ Saved
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors pointer-events-none"></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Preview Status Message */}
                            <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                              <strong>Preview Mode:</strong> These are temporary preview images. Click the heart (♡) to save your favorites permanently to your gallery.
                            </div>
                          </div>
                        )}
                        
                        <div className={`text-xs mt-3 ${message.role === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                          {message.role === 'user' ? 'You' : 'Maya'} • {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white text-black border border-gray-200 p-4 sm:p-6 max-w-2xl">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <div className="text-xs mt-3 text-gray-500">Maya is typing...</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 p-6 bg-white">
                  <div className="flex gap-3">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tell Maya what kind of photos you want to create..."
                      className="flex-1 min-h-[60px] resize-none border-gray-300 focus:border-black focus:ring-black"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || isTyping}
                      className="bg-black text-white hover:bg-gray-800 px-6"
                    >
                      Send
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar - Previous Sessions */}
            <div className="lg:col-span-1">
              <div className="bg-[#f5f5f5] p-6 min-h-[500px]">
                <h3 className="font-times text-lg font-light text-black mb-6">Previous Sessions</h3>
                <ChatHistoryLinks onChatSelect={(chatId) => {
                  loadChatHistory(chatId);
                  window.history.replaceState({}, '', `/maya?chat=${chatId}`);
                }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔑 ENHANCED: Full-size Image Modal with Heart-Save */}
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