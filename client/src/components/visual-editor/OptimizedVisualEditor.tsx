import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
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
  Wand2,
  Image,
  Heart,
  Star,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface ChatMessage {
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface AIImage {
  id: number;
  imageUrl: string;
  prompt?: string;
  style?: string;
  isFavorite: boolean;
  isSelected: boolean;
}

interface FlatlayImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description: string;
}

interface FlatlayCollection {
  id: string;
  name: string;
  description: string;
  aesthetic: string;
  backgroundImage: string;
  images: FlatlayImage[];
}

interface OptimizedVisualEditorProps {
  className?: string;
}

export function OptimizedVisualEditor({ className = '' }: OptimizedVisualEditorProps) {
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedTextColor, setSelectedTextColor] = useState('#000000');
  const [selectedFontSize, setSelectedFontSize] = useState(16);
  const [selectedMargin, setSelectedMargin] = useState('16px');
  const [customCSSClass, setCustomCSSClass] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Fetch user's AI gallery
  const { data: aiImages = [] } = useQuery<AIImage[]>({
    queryKey: ['/api/ai-images'],
  });

  // Flatlay collections data
  const flatlayCollections: FlatlayCollection[] = [
    {
      id: 'luxury-minimal',
      name: 'Luxury Minimal',
      description: 'Clean white backgrounds, designer accessories, minimal styling',
      aesthetic: 'Clean sophistication with generous white space',
      backgroundImage: 'https://i.postimg.cc/1tfNMJvk/file-16.png',
      images: [
        { id: 'lm-1', url: 'https://i.postimg.cc/1tfNMJvk/file-16.png', title: 'Clean Workspace', category: 'Luxury Minimal', description: 'Clean sophisticated lifestyle flatlay' },
        { id: 'lm-2', url: 'https://i.postimg.cc/6qZ4xTJz/file-19.png', title: 'Minimal Setup', category: 'Luxury Minimal', description: 'Clean sophisticated lifestyle flatlay' },
        { id: 'lm-3', url: 'https://i.postimg.cc/4NzH8K1x/file-20.png', title: 'Beauty Minimal', category: 'Luxury Minimal', description: 'Clean sophisticated lifestyle flatlay' },
        { id: 'lm-4', url: 'https://i.postimg.cc/V5ysqFhW/file-21.png', title: 'Planning Flatlay', category: 'Luxury Minimal', description: 'Clean sophisticated lifestyle flatlay' },
        { id: 'lm-5', url: 'https://i.postimg.cc/yY9cwp7B/file-22.png', title: 'Executive Setup', category: 'Luxury Minimal', description: 'Clean sophisticated lifestyle flatlay' }
      ]
    },
    {
      id: 'editorial-magazine',
      name: 'Editorial Magazine',
      description: 'Dark moody flatlays with fashion magazines, sophisticated lighting',
      aesthetic: 'Sophisticated editorial magazine style with dark luxury elements',
      backgroundImage: 'https://i.postimg.cc/02VLGyr8/1.png',
      images: [
        { id: 'em-1', url: 'https://i.postimg.cc/02VLGyr8/1.png', title: 'Vogue Editorial', category: 'Editorial Magazine', description: 'Editorial Magazine aesthetic flatlay' },
        { id: 'em-2', url: 'https://i.postimg.cc/DZ4xvx1J/2.png', title: 'Dark Magazine', category: 'Editorial Magazine', description: 'Editorial Magazine aesthetic flatlay' },
        { id: 'em-3', url: 'https://i.postimg.cc/vmGLpBxK/3.png', title: 'Fashion Editorial', category: 'Editorial Magazine', description: 'Editorial Magazine aesthetic flatlay' }
      ]
    },
    {
      id: 'business-professional',
      name: 'Business Professional',
      description: 'Professional business flatlays with laptops, planners, and office elements',
      aesthetic: 'Clean professional business aesthetic',
      backgroundImage: 'https://i.postimg.cc/6Q8hP6vF/businesspro-01.png',
      images: [
        { id: 'bp-1', url: 'https://i.postimg.cc/6Q8hP6vF/businesspro-01.png', title: 'Professional Setup', category: 'Business Professional', description: 'Business Professional flatlay' },
        { id: 'bp-2', url: 'https://i.postimg.cc/L8pydC1W/businesspro-02.png', title: 'Office Essentials', category: 'Business Professional', description: 'Business Professional flatlay' }
      ]
    }
  ];

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

  // Handle image selection
  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl);
      } else {
        return [...prev, imageUrl];
      }
    });
  };

  // Send selected images to Victoria
  const sendSelectedImagesToVictoria = () => {
    if (selectedImages.length === 0) {
      toast({
        title: 'No Images Selected',
        description: 'Please select some images first',
        variant: 'destructive',
      });
      return;
    }

    const imageList = selectedImages.map((url, index) => `${index + 1}. ${url}`).join('\n');
    const message = `I've selected these images to use in the design:\n\n${imageList}\n\nPlease use these images in the layout. Make them look amazing with your editorial style!`;
    
    sendMessage(message);
    setActiveTab('chat'); // Switch back to chat tab
  };

  // Generate new AI images via Victoria using existing endpoint
  const generateImagesWithVictoria = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/generate-user-images', {
        category: 'luxury-editorial',
        subcategory: 'design-content'
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Images Generating',
          description: 'Victoria is creating new images for your design',
        });
        
        // Send message to Victoria about the new images
        const message = "I just generated new editorial images for you to use in the design. They'll appear in your gallery shortly. Please use them to create a consistent luxury style across the pages.";
        sendMessage(message);
        
        // Poll for completion if we got a prediction ID
        if (data.predictionId) {
          pollForImageCompletion(data.predictionId);
        }
      }
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Could not generate images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for image generation completion
  const pollForImageCompletion = async (predictionId: string) => {
    const checkStatus = async () => {
      try {
        const response = await apiRequest('GET', `/api/check-generation/${predictionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'succeeded' && data.output) {
            toast({
              title: 'Images Ready!',
              description: 'Your new editorial images are available in the gallery',
            });
            // Refresh gallery data
            window.location.reload();
          } else if (data.status === 'failed') {
            toast({
              title: 'Generation Failed',
              description: 'Image generation failed. Please try again.',
              variant: 'destructive',
            });
          } else if (data.status === 'processing') {
            // Continue polling
            setTimeout(checkStatus, 3000);
          }
        }
      } catch (error) {
        console.error('Error checking generation status:', error);
      }
    };
    checkStatus();
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
    <div className={`h-screen bg-white ${className}`}>
      <PanelGroup direction="horizontal" className="h-full">
        {/* Chat Panel - Resizable */}
        <Panel defaultSize={30} minSize={20} maxSize={50}>
          <div className="h-full border-r border-gray-200 bg-white flex flex-col">
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
            variant={showPropertiesPanel ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs for Chat, Gallery, and Flatlay Library */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs">Gallery</TabsTrigger>
            <TabsTrigger value="flatlays" className="text-xs">Flatlays</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
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
                
                {/* Victoria Image Generation Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs bg-purple-50 border-purple-200 hover:bg-purple-100"
                  onClick={generateImagesWithVictoria}
                  disabled={isLoading}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="ml-2">
                    {isLoading ? 'Generating...' : 'Generate Images'}
                  </span>
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
          </TabsContent>

          <TabsContent value="gallery" className="flex-1 flex flex-col mt-0">
            {/* Gallery Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">Your AI Gallery</h4>
                <Badge variant="secondary" className="text-xs">
                  {selectedImages.length} selected
                </Badge>
              </div>
              {selectedImages.length > 0 && (
                <Button
                  size="sm"
                  className="w-full bg-black text-white"
                  onClick={sendSelectedImagesToVictoria}
                >
                  <Image className="w-4 h-4 mr-1" />
                  Send to Victoria ({selectedImages.length})
                </Button>
              )}
            </div>

            {/* Gallery Images Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {aiImages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">
                  <div className="mb-2">🖼️</div>
                  <div>No AI images yet</div>
                  <div className="text-xs">Generate some images first in Maya AI or AI Photoshoot</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {aiImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative cursor-pointer transition-all duration-200 ${
                        selectedImages.includes(image.imageUrl)
                          ? 'ring-2 ring-black ring-offset-2'
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                      onClick={() => toggleImageSelection(image.imageUrl)}
                    >
                      <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <img
                          src={image.imageUrl}
                          alt={image.prompt || 'AI Generated'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      {selectedImages.includes(image.imageUrl) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {selectedImages.indexOf(image.imageUrl) + 1}
                          </span>
                        </div>
                      )}
                      {image.isFavorite && (
                        <div className="absolute top-2 left-2">
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="flatlays" className="flex-1 flex flex-col mt-0">
            {/* Flatlay Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">Flatlay Library</h4>
                <Badge variant="secondary" className="text-xs">
                  {selectedImages.length} selected
                </Badge>
              </div>
              {selectedImages.length > 0 && (
                <Button
                  size="sm"
                  className="w-full bg-black text-white"
                  onClick={sendSelectedImagesToVictoria}
                >
                  <Image className="w-4 h-4 mr-1" />
                  Send to Victoria ({selectedImages.length})
                </Button>
              )}
            </div>

            {/* Flatlay Collections */}
            <div className="flex-1 overflow-y-auto">
              {flatlayCollections.map((collection) => (
                <div key={collection.id} className="border-b border-gray-200">
                  <div className="p-4">
                    <h5 className="font-medium text-sm mb-2">{collection.name}</h5>
                    <p className="text-xs text-gray-600 mb-3">{collection.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {collection.images.slice(0, 6).map((image) => (
                        <div
                          key={image.id}
                          className={`relative cursor-pointer transition-all duration-200 ${
                            selectedImages.includes(image.url)
                              ? 'ring-2 ring-black ring-offset-1'
                              : 'hover:ring-2 hover:ring-gray-300'
                          }`}
                          onClick={() => toggleImageSelection(image.url)}
                        >
                          <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          {selectedImages.includes(image.url) && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {selectedImages.indexOf(image.url) + 1}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-2 bg-gray-100 hover:bg-gray-200 transition-colors" />

        {/* Main Live Preview Panel - Resizable */}
        <Panel defaultSize={70} minSize={30}>
          <div className="h-full flex flex-col">
        {/* Top Toolbar */}
        <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-500 text-white">
              <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
              LIVE PREVIEW
            </Badge>
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
        </Panel>

        {/* Properties Panel - Only shows when button clicked */}
        {showPropertiesPanel && (
          <>
            <PanelResizeHandle className="w-2 bg-gray-100 hover:bg-gray-200 transition-colors" />
            <Panel defaultSize={30} minSize={15} maxSize={40}>
              <div className="h-full border-l border-gray-200 bg-white flex flex-col">
                {/* Properties Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-medium text-sm">Properties</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPropertiesPanel(false)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Live Style Controls */}
                <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-sm mb-3">Text Color</h4>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="color"
                value={selectedTextColor}
                onChange={(e) => setSelectedTextColor(e.target.value)}
                className="w-8 h-8 rounded border"
              />
              <Input
                value={selectedTextColor}
                onChange={(e) => setSelectedTextColor(e.target.value)}
                className="text-sm"
                placeholder="#000000"
              />
            </div>

            <h4 className="font-medium text-sm mb-2">Font Size</h4>
            <div className="mb-1 text-xs text-gray-500">{selectedFontSize}px</div>
            <input
              type="range"
              min="12"
              max="72"
              value={selectedFontSize}
              onChange={(e) => setSelectedFontSize(parseInt(e.target.value))}
              className="w-full mb-4"
            />

            <h4 className="font-medium text-sm mb-2">Margin</h4>
            <Input
              value={selectedMargin}
              onChange={(e) => setSelectedMargin(e.target.value)}
              className="text-sm mb-4"
              placeholder="16px"
            />

            <h4 className="font-medium text-sm mb-2">Custom CSS Class</h4>
            <Input
              value={customCSSClass}
              onChange={(e) => setCustomCSSClass(e.target.value)}
              className="text-sm mb-4"
              placeholder="E.G. MY-CUSTOM-CLASS"
            />
                </div>

                {/* Apply to Live Preview */}
                <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-sm mb-3">Apply to Live Preview</h4>
            <Button
              variant="default"
              size="sm"
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={() => {
                const styles = `
                  .live-edit-selection, .selected-element {
                    color: ${selectedTextColor} !important;
                    font-size: ${selectedFontSize}px !important;
                    margin: ${selectedMargin} !important;
                    transition: all 0.3s ease !important;
                  }
                  ${customCSSClass ? `.${customCSSClass} { border: 2px solid #3b82f6; }` : ''}
                `;
                injectChangesToLivePreview(styles);
                toast({
                  title: 'Styles Applied',
                  description: 'Live preview updated',
                });
              }}
            >
              🎨 Apply Styles Live
            </Button>
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-sm mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                Add Heading
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                Add Text Block
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                Add Button
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                Upload Image
              </Button>
            </div>
                </div>

                {/* Victoria Quick Commands */}
                <div className="p-4">
            <h4 className="font-medium text-sm mb-3">Victoria Quick Commands</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-sm"
                onClick={() => {
                  const luxuryStyles = `
                    * { font-family: 'Times New Roman', serif !important; }
                    h1, h2, h3 { font-weight: 300 !important; letter-spacing: 0.5px !important; }
                    body { background: #ffffff !important; color: #0a0a0a !important; }
                  `;
                  injectChangesToLivePreview(luxuryStyles);
                  toast({ title: 'Luxury Typography Applied' });
                }}
              >
                ✨ Apply Luxury Typography
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-sm"
                onClick={() => {
                  const editorialStyles = `
                    .container { max-width: 1200px !important; margin: 0 auto !important; }
                    section { padding: 4rem 2rem !important; }
                    .editorial-spacing { margin-bottom: 3rem !important; }
                  `;
                  injectChangesToLivePreview(editorialStyles);
                  toast({ title: 'Editorial Layout Applied' });
                }}
              >
                📖 Editorial Layout
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-sm"
                onClick={() => {
                  const vogueModeStyles = `
                    body { background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%) !important; }
                    h1 { font-size: 4rem !important; font-weight: 100 !important; text-align: center !important; }
                    .hero { min-height: 100vh !important; display: flex !important; align-items: center !important; }
                  `;
                  injectChangesToLivePreview(vogueModeStyles);
                  toast({ title: 'Vogue Mode Applied' });
                }}
              >
                👑 Vogue Mode
              </Button>
                </div>
                </div>
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}