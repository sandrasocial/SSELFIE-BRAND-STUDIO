import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: number;
  role: 'user' | 'victoria';
  content: string;
  artifactHtml?: string;
  artifactCss?: string;
  timestamp?: string;
}

interface VictoriaChat {
  id: number;
  title: string;
  landingPageHtml?: string;
  landingPageCss?: string;
  templateUsed?: string;
}

// Soul Resets template HTML as foundation
const SOUL_RESETS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} | {{BUSINESS_NAME}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2c5f5d;
            background: white;
        }
        .hero { 
            height: 100vh; 
            background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600') center/cover;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
        }
        .hero-content { max-width: 800px; padding: 0 2rem; }
        .hero h1 { 
            font-family: 'Times New Roman', serif;
            font-size: 4rem;
            font-weight: 300;
            letter-spacing: 0.1em;
            margin-bottom: 2rem;
        }
        .hero p { 
            font-size: 1.25rem;
            font-weight: 300;
            margin-bottom: 3rem;
            opacity: 0.95;
        }
        .cta-button {
            background: #7ba3a0;
            color: white;
            border: none;
            padding: 1rem 2.5rem;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .cta-button:hover { background: #5a7c7a; }
        .section { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; }
        .section h2 {
            font-family: 'Times New Roman', serif;
            font-size: 2.5rem;
            font-weight: 300;
            text-align: center;
            margin-bottom: 3rem;
            color: #2c5f5d;
        }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem; }
        .feature { text-align: center; }
        .feature h3 {
            font-family: 'Times New Roman', serif;
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #2c5f5d;
        }
        .feature p { color: #5a7c7a; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .section { padding: 3rem 1rem; }
        }
    </style>
</head>
<body>
    <div class="hero">
        <div class="hero-content">
            <h1>{{BUSINESS_NAME}}</h1>
            <p>{{TAGLINE}}</p>
            <button class="cta-button">{{CTA_TEXT}}</button>
        </div>
    </div>
    
    <div class="section">
        <h2>{{SECTION_TITLE}}</h2>
        <div class="features">
            <div class="feature">
                <h3>{{FEATURE_1_TITLE}}</h3>
                <p>{{FEATURE_1_DESC}}</p>
            </div>
            <div class="feature">
                <h3>{{FEATURE_2_TITLE}}</h3>
                <p>{{FEATURE_2_DESC}}</p>
            </div>
            <div class="feature">
                <h3>{{FEATURE_3_TITLE}}</h3>
                <p>{{FEATURE_3_DESC}}</p>
            </div>
        </div>
    </div>
</body>
</html>`;

export default function VictoriaBuilder() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentHtml, setCurrentHtml] = useState(SOUL_RESETS_TEMPLATE);
  const [currentCss, setCurrentCss] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Get chat history
  const { data: chatData } = useQuery({
    queryKey: ['/api/victoria-chat-history', chatId],
    enabled: !!chatId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/victoria-chat-messages', chatId],
    enabled: !!chatId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/victoria-chat', {
        message,
        chatHistory: messages,
        conversationId: chatId ? parseInt(chatId) : undefined,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/victoria-chat-messages'] });
      setCurrentMessage('');
      setIsTyping(false);
    },
    onError: (error) => {
      toast({
        title: "Message failed",
        description: "Could not send message to Victoria",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  // Update preview when HTML changes
  useEffect(() => {
    if (previewRef.current && currentHtml) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(currentHtml);
        doc.close();
      }
    }
  }, [currentHtml]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || sendMessageMutation.isPending) return;
    
    setIsTyping(true);
    sendMessageMutation.mutate(currentMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Live Preview - Left Side (60%) */}
      <div className="w-3/5 border-r border-gray-200 flex flex-col">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-light text-black">Live Preview</h2>
          <p className="text-sm text-gray-600 font-light">Your landing page updates in real-time</p>
        </div>
        
        <div className="flex-1 bg-white">
          <iframe
            ref={previewRef}
            className="w-full h-full border-0"
            title="Landing Page Preview"
            sandbox="allow-same-origin"
          />
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                className="text-black border-black hover:bg-black hover:text-white"
              >
                Desktop
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-500"
              >
                Mobile
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                size="sm"
                className="text-black border-black hover:bg-black hover:text-white"
              >
                Save Draft
              </Button>
              <Button 
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
              >
                Publish Live
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Victoria Chat - Right Side (40%) */}
      <div className="w-2/5 flex flex-col">
        <div className="bg-black text-white px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black text-sm font-medium">V</span>
            </div>
            <div>
              <h3 className="font-medium">Victoria</h3>
              <p className="text-sm text-gray-300">Brand Strategist & Landing Page Expert</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!messages.length && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Hi gorgeous! I'm Victoria, your brand strategist and landing page expert. 
                I'll help you create a stunning business website that converts visitors into clients.
              </p>
              <p className="text-gray-400 text-sm">
                Tell me about your business and let's build something amazing together!
              </p>
            </div>
          )}
          
          {messages.map((message: ChatMessage) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-black'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.artifactHtml && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    ✓ Landing page code generated
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-black rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">Victoria is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your business and vision for your landing page..."
              className="flex-1 min-h-[60px] max-h-32 resize-none border-gray-300 focus:border-black focus:ring-black"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || sendMessageMutation.isPending}
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