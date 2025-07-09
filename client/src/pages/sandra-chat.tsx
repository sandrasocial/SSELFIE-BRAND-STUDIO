import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: string;
  role: 'user' | 'sandra';
  content: string;
  timestamp: Date;
  promptSuggestion?: string;
}

interface PromptSuggestion {
  style: string;
  description: string;
  prompt: string;
}

export default function SandraChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'sandra',
      content: "Hey gorgeous! I'm Sandra, your personal AI photoshoot director. Tell me what kind of vibe you're going for - are you thinking editorial drama, business power, artistic storytelling? I'll create the perfect prompt to get your AI generating exactly what you want.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/sandra-chat', {
        message,
        chatHistory: messages.slice(-5) // Send last 5 messages for context
      });
      return response.json();
    },
    onSuccess: (data) => {
      const sandraMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'sandra',
        content: data.message,
        timestamp: new Date(),
        promptSuggestion: data.promptSuggestion
      };
      setMessages(prev => [...prev, sandraMessage]);
      setIsTyping(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  const generateImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/generate-custom-prompt', {
        prompt
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Photoshoot Started!",
        description: "Sandra is creating your custom images now...",
      });
      // Could redirect to AI generator or show progress
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    chatMutation.mutate(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUsePrompt = (prompt: string) => {
    generateImageMutation.mutate(prompt);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-serif text-black">SANDRA AI CHAT</h1>
          <p className="text-sm text-gray-600 mt-1">Your personal photoshoot director</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6 mb-24">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                {message.role === 'sandra' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">S</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Sandra</span>
                  </div>
                )}
                
                <Card className={`${
                  message.role === 'user' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-50 text-black'
                }`}>
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    
                    {message.promptSuggestion && (
                      <div className="mt-4 p-3 bg-white rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            CUSTOM PROMPT
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => handleUsePrompt(message.promptSuggestion!)}
                            disabled={generateImageMutation.isPending}
                            className="text-xs"
                          >
                            {generateImageMutation.isPending ? 'GENERATING...' : 'USE THIS PROMPT'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 font-mono">
                          {message.promptSuggestion}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Sandra</span>
                </div>
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">Sandra is thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the photoshoot style you want..."
              className="flex-1"
              disabled={chatMutation.isPending}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || chatMutation.isPending}
              className="px-6"
            >
              SEND
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Ask Sandra about editorial, business, artistic, or luxury photoshoot styles
          </p>
        </div>
      </div>
    </div>
  );
}