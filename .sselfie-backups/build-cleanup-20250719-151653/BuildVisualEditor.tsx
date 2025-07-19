import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { LivePreview } from './LivePreview';
import { GalleryTabs } from './GalleryTabs';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface BuildVisualEditorProps {
  className?: string;
}

export function BuildVisualEditor({ className = '' }: BuildVisualEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedBuilding, setHasStartedBuilding] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check if user has completed AI training (BUILD access requirement)
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: !!user,
  });

  // Fetch user's onboarding data for Victoria context
  const { data: onboardingData } = useQuery({
    queryKey: ['/api/onboarding-data'],
    enabled: !!user,
  });

  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Load conversation history on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('build-chat-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        if (parsed && Array.isArray(parsed)) {
          setChatMessages(parsed);
          setHasStartedBuilding(parsed.length > 0);
        }
      } catch (e) {
        console.warn('Failed to parse saved conversations:', e);
      }
    }
  }, []);

  // Save conversations to localStorage whenever messages change
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem('build-chat-conversations', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!messageInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageInput.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setIsLoading(true);
    setHasStartedBuilding(true);

    try {
      const response = await fetch('/api/victoria-website-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          onboardingData: onboardingData || {},
          conversationHistory: chatMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userId: user?.id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'I apologize, but I encountered an issue. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // Refresh iframe to show any changes
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }

    } catch (error) {
      console.error('Victoria chat error:', error);
      toast({
        title: "Communication Error",
        description: "There was an issue connecting with Victoria. Please try again.",
        variant: "destructive",
      });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Check if user has access to BUILD feature
  const hasBuildAccess = userModel?.trainingStatus === 'completed';

  if (!hasBuildAccess) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-8">
          <h1 className="font-serif text-4xl mb-6 text-black font-light uppercase tracking-wide">
            Almost There
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            You need to complete your AI training first before you can build your website. 
            Head back to your workspace to get started with TRAIN.
          </p>
          <a
            href="/workspace"
            className="inline-block px-8 py-4 text-xs uppercase tracking-wide border border-black hover:bg-black hover:text-white transition-all duration-300"
          >
            Go to Workspace
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen bg-white flex ${className}`}>
      {/* Left Panel - Victoria Chat */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
              Build Your Website
            </h1>
            <a
              href="/workspace"
              className="text-sm text-gray-500 hover:text-black transition-colors px-3 py-1 border border-gray-300 hover:border-black"
            >
              Back to Workspace
            </a>
          </div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-serif text-lg">V</span>
            </div>
            <div>
              <h3 className="font-serif text-lg text-black">Victoria</h3>
              <p className="text-gray-500 text-sm">Your Website Consultant</p>
            </div>
          </div>
          <p className="text-gray-600 font-light leading-relaxed italic">
            "Hey beautiful! I am SO pumped to build your website. Every website should feel like a warm invitation to your ideal clients."
          </p>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {!hasStartedBuilding && (
            <div className="text-center py-8">
              <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                Ready to Build Something That Changes Everything?
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Here's the thing... your website needs to hit people right in the heart. Tell me your story, your mission, who lights you up to help. I'm going to create something that feels like home to your ideal clients.
              </p>
              <p className="text-sm text-gray-500 italic">
                "Trust me on this - the best websites come from real conversations about what you're truly meant to do."
              </p>
            </div>
          )}

          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-50 text-black border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className="text-xs opacity-60 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                  <p className="text-sm text-gray-600">Victoria is thinking...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex space-x-3">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell Victoria about your business..."
              className="flex-1 border-gray-300 focus:border-black focus:ring-0"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !messageInput.trim()}
              className="px-6 bg-black hover:bg-gray-800 text-white"
            >
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Center Panel - Live Website Preview */}
      <div className="w-1/3 border-r border-gray-200">
        <LivePreview 
          onboardingData={onboardingData}
          className="h-full"
        />
      </div>

      {/* Right Panel - Gallery & Photo Management */}
      <div className="w-1/3">
        <GalleryTabs 
          className="h-full"
          onImageSelect={(imageUrl) => {
            // TODO: Update website with selected image
            console.log('Selected image:', imageUrl);
          }}
        />
      </div>
    </div>
  );
}