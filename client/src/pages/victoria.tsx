import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatMessage {
  role: 'user' | 'victoria';
  content: string;
  timestamp: string;
}

export default function Victoria() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
        content: `Hi ${user.firstName || 'there'}! I'm Victoria, your personal brand strategist. I help ambitious women like you build powerful personal brands that attract dream clients and opportunities.\n\nWhether you're launching a business, growing your following, or positioning yourself as an expert in your field - I'm here to guide you every step of the way.\n\nWhat's your biggest brand challenge right now? Let's figure this out together! 💪`,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Victoria AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-black">
              Victoria AI
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Your personal brand strategist
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation('/workspace')}
            className="text-sm"
          >
            ← Back to Studio
          </Button>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${message.role === 'user' ? 'bg-black text-white' : 'bg-gray-50 text-black'} p-4 sm:p-6`}>
                <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                  {message.content}
                </div>
                <div className={`text-xs mt-3 ${message.role === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                  {message.role === 'user' ? 'You' : 'Victoria'} • {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-50 text-black p-4 sm:p-6 max-w-2xl">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <div className="text-xs mt-3 text-gray-500">Victoria is strategizing...</div>
              </div>
            </div>
          )}
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
  );
}