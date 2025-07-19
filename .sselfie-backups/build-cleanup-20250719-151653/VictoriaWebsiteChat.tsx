import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Eye } from 'lucide-react';

interface VictoriaWebsiteChatProps {
  onboardingData: any;
  onWebsiteGenerated: (websiteData: any) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function VictoriaWebsiteChat({ onboardingData, onWebsiteGenerated }: VictoriaWebsiteChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [websitePreview, setWebsitePreview] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initial Victoria greeting with user context
  useEffect(() => {
    if (onboardingData && messages.length === 0) {
      const greeting: Message = {
        id: 'initial',
        role: 'assistant',
        content: `Hey beautiful! I'm here to help you build your website - and oh my gosh, I am SO excited to create this with you! 

${user?.firstName}, I've been reading through your story about "${onboardingData?.personalBrandName || 'your amazing brand'}" and honestly? I'm getting chills. Your journey, your vision, the way you want to help ${onboardingData?.targetAudience || 'your people'} - this is going to be stunning.

Here's the thing - I don't just build websites, I build digital homes where your ideal clients feel instantly connected to YOU. Like, the moment they land on your page, they should think "Yes, this person gets me."

So let's start with your homepage. What's the ONE thing you want someone to feel when they see your website? Like, if your best friend was describing what you do to someone, what would they say?`,
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [onboardingData, user, messages.length]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Victoria chat mutation
  const victoriaChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/victoria-website-chat', {
        message,
        onboardingData,
        conversationHistory: messages,
        userId: user?.id
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Add Victoria's response
      const victoriaMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, victoriaMessage]);

      // If Victoria generated website HTML, show preview
      if (data.websiteHtml) {
        setWebsitePreview(data.websiteHtml);
      }

      // If complete website is generated, notify parent
      if (data.isComplete && data.websiteData) {
        onWebsiteGenerated(data.websiteData);
      }
      
      setIsLoading(false);
    },
    onError: (error: any) => {
      console.error('Victoria chat error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble right now. Could you try rephrasing your request?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Send to Victoria
    setIsLoading(true);
    victoriaChatMutation.mutate(inputMessage.trim());
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Victoria Chat Sidebar */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-serif" style={{ fontFamily: 'Times New Roman, serif' }}>
            Victoria Website Consultant
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Building: {onboardingData?.personalBrandName || 'Your Website'}
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`${message.role === 'user' ? 'ml-8' : 'mr-8'}`}>
              <div className={`${
                message.role === 'user' 
                  ? 'bg-black text-white ml-auto max-w-[80%]' 
                  : 'bg-gray-50 text-black max-w-[80%]'
              } p-4 rounded-lg`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))}
          
          {isLoading && (
            <div className="mr-8">
              <div className="bg-gray-50 p-4 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Victoria is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your vision or ask Victoria for website changes..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-black text-white hover:bg-gray-800"
              size="sm"
            >
              {isLoading ? <Loader2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Live Website Preview */}
      <div className="w-1/2 flex flex-col bg-gray-50">
        {/* Preview Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif" style={{ fontFamily: 'Times New Roman, serif' }}>
              Live Preview
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Eye className="h-4 w-4" />
              <span>Real-time updates</span>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 p-6">
          {websitePreview ? (
            <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden bg-white">
              <iframe
                ref={iframeRef}
                srcDoc={websitePreview}
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin"
                title="Website Preview"
              />
            </div>
          ) : (
            <div className="w-full h-full border border-gray-300 rounded-lg flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Eye className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-serif mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Website Preview
                </h4>
                <p className="text-sm text-gray-600">
                  Your website will appear here as Victoria builds it
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}