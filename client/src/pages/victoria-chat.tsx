import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  sender: 'user' | 'victoria';
  message: string;
  timestamp: string;
}

interface VictoriaChatResponse {
  message: string;
  sessionId: string;
  timestamp: string;
}

export default function VictoriaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/victoria-chat", {
        message: userMessage.message,
        sessionId: sessionId || undefined
      }) as VictoriaChatResponse;

      // Update sessionId if this is the first message
      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
      }

      const victoriaMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'victoria',
        message: response.message,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, victoriaMessage]);

    } catch (error) {
      console.error('Victoria chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to send message to Victoria. Please try again.",
        variant: "destructive",
      });
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Coming Soon Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-4xl mx-auto px-6 py-3 text-center">
          <p className="text-sm text-yellow-800">
            Victoria AI is currently in development. This feature will be available after launch.
          </p>
        </div>
      </div>
      
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                Victoria AI Brand Strategist
              </h1>
              <p className="text-gray-600 mt-1">
                Your personal brand strategist and landing page expert
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/workspace")}
              className="border-black text-black hover:bg-gray-50"
            >
              ‹ Back to Workspace
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="text-center py-4">
              <h2 className="text-lg font-medium text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                Chat with Victoria
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Get expert brand strategy advice and landing page help
              </p>
            </div>
            <Separator />
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Start Your Brand Strategy Session
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Ask Victoria about your business goals, landing page needs, or brand strategy
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>"Help me create a landing page for my coaching business"</p>
                      <p>"What's the best template for my wellness brand?"</p>
                      <p>"How can I position myself as an expert in my field?"</p>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${message.sender === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-black'} p-4 space-y-2`}>
                      <div className="text-sm font-medium">
                        {message.sender === 'user' ? 'You' : 'Victoria'}
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.message}
                      </div>
                      <div className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-black p-4 max-w-[70%]">
                      <div className="text-sm font-medium mb-2">Victoria</div>
                      <div className="text-sm text-gray-600">
                        Thinking about your brand strategy...
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="flex-shrink-0 border-t border-gray-200 p-6">
              <div className="flex space-x-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Victoria about your brand strategy..."
                  className="flex-1 border-gray-300 focus:border-black"
                  disabled={isLoading}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-black text-white hover:bg-gray-800 px-6"
                >
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}