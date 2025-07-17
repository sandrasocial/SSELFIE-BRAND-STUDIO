import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit3,
  MessageSquare,
  Save, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Palette,
  Type,
  Layout,
  Wand2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface OptimizedVisualEditorProps {
  className?: string;
}

export function OptimizedVisualEditor({ className = '' }: OptimizedVisualEditorProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedTextColor, setSelectedTextColor] = useState('#000000');
  const [selectedFontSize, setSelectedFontSize] = useState(16);
  const [selectedMargin, setSelectedMargin] = useState('16px');
  const [customCSSClass, setCustomCSSClass] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Live CSS injection
  const injectChangesToLivePreview = (changes: string) => {
    if (iframeRef.current) {
      try {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const styleElement = iframeDoc.createElement('style');
          styleElement.innerHTML = changes;
          iframeDoc.head.appendChild(styleElement);
          console.log('🎨 Live changes applied');
        }
      } catch (error) {
        console.warn('Could not inject changes:', error);
      }
    }
  };

  // Send message to Victoria
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/admin/agent-chat-bypass', {
        agentId: 'victoria',
        message: message,
        conversationHistory: chatMessages.map(msg => ({
          type: msg.type === 'user' ? 'human' : 'assistant',
          content: msg.content
        }))
      });

      const data = await response.json();
      
      if (data.response) {
        const agentMessage: ChatMessage = {
          type: 'agent',
          content: data.response,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, agentMessage]);

        // Auto-apply CSS changes from Victoria's response
        const cssMatch = data.response.match(/```css\n([\s\S]*?)\n```/);
        if (cssMatch) {
          injectChangesToLivePreview(cssMatch[1]);
          toast({
            title: 'Victoria Applied Changes',
            description: 'Design updates applied to live preview',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message to Victoria',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickCommands = [
    {
      label: 'Luxury Typography',
      command: 'Apply luxury typography with Times New Roman and elegant spacing',
      icon: <Type className="w-4 h-4" />,
      styles: `
        * { font-family: 'Times New Roman', serif !important; }
        h1, h2, h3 { font-weight: 300 !important; letter-spacing: 0.5px !important; }
        body { background: #ffffff !important; color: #0a0a0a !important; }
      `
    },
    {
      label: 'Editorial Layout',
      command: 'Create editorial magazine-style layout with proper spacing',
      icon: <Layout className="w-4 h-4" />,
      styles: `
        .container { max-width: 1200px !important; margin: 0 auto !important; }
        section { padding: 4rem 2rem !important; }
        .editorial-spacing { margin-bottom: 3rem !important; }
      `
    },
    {
      label: 'Vogue Mode',
      command: 'Transform into ultra-luxury Vogue magazine aesthetic',
      icon: <Wand2 className="w-4 h-4" />,
      styles: `
        body { background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%) !important; }
        h1 { font-size: 4rem !important; font-weight: 100 !important; text-align: center !important; }
        .hero { min-height: 100vh !important; display: flex !important; align-items: center !important; }
      `
    }
  ];

  return (
    <div className={`h-screen flex bg-white ${className}`}>
      {/* Main Live Preview */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-500 text-white">
              <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
              LIVE PREVIEW
            </Badge>
            <Button
              variant={showChat ? "default" : "outline"}
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat with Victoria
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.src = iframeRef.current.src;
                }
              }}
            >
              🔄 Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Live Development Preview */}
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            src={window.location.origin}
            className="w-full h-full border-0"
            title="Live SSELFIE Studio"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            onLoad={() => {
              console.log('🚀 Live SSELFIE Studio loaded');
              // Add hover effects for elements
              setTimeout(() => {
                const hoverStyles = `
                  * { transition: box-shadow 0.2s ease !important; }
                  *:hover { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important; }
                `;
                injectChangesToLivePreview(hoverStyles);
              }, 1000);
            }}
          />
        </div>
      </div>

      {/* Collapsible Chat Panel */}
      {showChat && (
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">V</span>
              </div>
              <div>
                <div className="font-medium text-sm">Victoria</div>
                <div className="text-xs text-gray-500">UX Designer AI</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(false)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Commands */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-sm mb-3">Quick Commands</h4>
            <div className="space-y-2">
              {quickCommands.map((command, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    if (command.styles) {
                      injectChangesToLivePreview(command.styles);
                      toast({
                        title: 'Style Applied',
                        description: command.label,
                      });
                    } else {
                      sendMessage(command.command);
                    }
                  }}
                >
                  {command.icon}
                  <span className="ml-2">{command.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Live Style Controls */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-sm mb-3">Live Style Controls</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={selectedTextColor}
                    onChange={(e) => setSelectedTextColor(e.target.value)}
                    className="w-6 h-6 rounded border"
                  />
                  <Input
                    value={selectedTextColor}
                    onChange={(e) => setSelectedTextColor(e.target.value)}
                    className="text-xs"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Font Size: {selectedFontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={selectedFontSize}
                  onChange={(e) => setSelectedFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => {
                  const styles = `
                    .live-edit-selection {
                      color: ${selectedTextColor} !important;
                      font-size: ${selectedFontSize}px !important;
                      margin: ${selectedMargin} !important;
                      transition: all 0.3s ease !important;
                    }
                  `;
                  injectChangesToLivePreview(styles);
                }}
              >
                <Palette className="w-4 h-4 mr-1" />
                Apply Live
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                <div className="mb-2">💬</div>
                <div>Start chatting with Victoria!</div>
                <div className="text-xs">Ask for design help, code changes, or content updates.</div>
              </div>
            )}
            
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.type === 'user' 
                    ? 'ml-4 bg-black text-white' 
                    : 'mr-4 bg-gray-100 text-gray-900'
                } p-3 rounded-lg text-sm`}
              >
                {message.content}
              </div>
            ))}
            
            {isLoading && (
              <div className="mr-4 bg-gray-100 text-gray-900 p-3 rounded-lg text-sm">
                Victoria is thinking...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Ask Victoria for help..."
                className="flex-1 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(messageInput);
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => sendMessage(messageInput)}
                disabled={!messageInput.trim() || isLoading}
              >
                <span className="text-sm">Send</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}