import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WorkspaceNavigation } from '@/components/workspace-navigation';

interface ChatMessage {
  role: 'user' | 'victoria';
  content: string;
  timestamp: string;
}

export default function VictoriaChat() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to chat with Victoria AI",
        variant: "destructive",
      });
      setLocation('/pricing');
      return;
    }
  }, [user, isLoading, setLocation, toast]);

  // Initialize with Victoria's welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        role: 'victoria',
        content: `Hi ${user.firstName || 'there'}! I'm Victoria, your personal brand strategist. I help ambitious women like you build powerful personal brands that attract dream clients and opportunities.\n\nWhether you're launching a business, growing your following, or positioning yourself as an expert in your field - I'm here to guide you every step of the way.\n\nWhat's your biggest brand challenge right now? Let's figure this out together!`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [user, messages.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/victoria-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          chatHistory: messages
        }),
      });

      const data = await response.json();

      const victoriaMessage: ChatMessage = {
        role: 'victoria',
        content: data.message || "I'm strategizing! Give me a moment and ask me again about your brand goals.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, victoriaMessage]);
    } catch (error) {
      console.error('Victoria chat error:', error);
      toast({
        title: "Connection Error",
        description: "Victoria is having trouble connecting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <WorkspaceNavigation />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-times text-4xl font-light tracking-[-0.02em] text-black mb-4">
            VICTORIA AI
          </h1>
          <p className="text-base font-light text-[#666666]">
            Your Personal Brand Strategist
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white border border-gray-200">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 ${
                  message.role === 'user' 
                    ? 'bg-black text-white' 
                    : 'bg-[#f5f5f5] text-black'
                }`}>
                  {message.role === 'victoria' && (
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-black text-white text-xs flex items-center justify-center mr-2">
                        V
                      </div>
                      <span className="text-xs tracking-[0.2em] uppercase">Victoria</span>
                    </div>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-60 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#f5f5f5] text-black p-4 max-w-[80%]">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-black text-white text-xs flex items-center justify-center mr-2">
                      V
                    </div>
                    <span className="text-xs tracking-[0.2em] uppercase">Victoria</span>
                  </div>
                  <div className="text-sm">Thinking...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 sm:p-6">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Victoria about your brand strategy, content ideas, business growth..."
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
    </div>
  );
}