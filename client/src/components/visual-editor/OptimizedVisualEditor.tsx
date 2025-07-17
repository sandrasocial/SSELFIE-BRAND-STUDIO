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
  Sparkles,
  Upload,
  Paperclip
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface ChatMessage {
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  imagePreview?: string[];
  uploadedImages?: string[];
  agentName?: string;
  handoffTo?: string;
  isHandoff?: boolean;
  workflowStage?: string;
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

interface Agent {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  color: string;
  nextAgent?: string;
  workflowStage: string;
}

const agents: Agent[] = [
  {
    id: 'victoria',
    name: 'Victoria',
    role: 'UX Designer AI',
    expertise: ['Design', 'UI/UX', 'Visual Editor', 'Components'],
    color: 'bg-purple-500',
    nextAgent: 'maya',
    workflowStage: 'Design'
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Dev AI',
    expertise: ['Development', 'Code', 'API', 'Technical Implementation'],
    color: 'bg-blue-500',
    nextAgent: 'rachel',
    workflowStage: 'Development'
  },
  {
    id: 'rachel',
    name: 'Rachel',
    role: 'Voice AI',
    expertise: ['Copywriting', 'Content', 'Voice', 'Marketing Copy'],
    color: 'bg-pink-500',
    nextAgent: 'ava',
    workflowStage: 'Content'
  },
  {
    id: 'ava',
    name: 'Ava',
    role: 'Automation AI',
    expertise: ['Workflows', 'Automation', 'Business Logic'],
    color: 'bg-green-500',
    nextAgent: 'quinn',
    workflowStage: 'Automation'
  },
  {
    id: 'quinn',
    name: 'Quinn',
    role: 'QA AI',
    expertise: ['Quality Assurance', 'Testing', 'Validation'],
    color: 'bg-orange-500',
    workflowStage: 'Quality Assurance'
  }
];

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent>(agents[0]);
  const [workflowActive, setWorkflowActive] = useState(false);
  const [workflowStage, setWorkflowStage] = useState('Design');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to show agent's message start when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current && chatMessages.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage.type === 'agent') {
        // Scroll to show the start of the agent's message, not the very bottom
        const scrollContainer = chatMessagesRef.current;
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        // Scroll to 80% of the way down to show agent message start
        scrollContainer.scrollTop = Math.max(0, maxScroll * 0.8);
      }
    }
  }, [chatMessages]);

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
        
        // Send message to Victoria about the new images with preview placeholder
        const message = "I just generated new editorial images for you to use in the design. They'll appear in your gallery shortly. Please use them to create a consistent luxury style across the pages.";
        const messageWithPreview: ChatMessage = {
          type: 'agent',
          content: message,
          timestamp: new Date(),
          imagePreview: [] // Will be populated when images are ready
        };
        setChatMessages(prev => [...prev, messageWithPreview]);
        
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
            
            // Update the last chat message with image previews
            setChatMessages(prev => {
              const updated = [...prev];
              const lastMessage = updated[updated.length - 1];
              if (lastMessage && lastMessage.type === 'agent' && !lastMessage.imagePreview?.length) {
                lastMessage.imagePreview = Array.isArray(data.output) ? data.output : [data.output];
              }
              return updated;
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

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      toast({
        title: 'Invalid Files',
        description: 'Please upload image files only.',
        variant: 'destructive',
      });
      return;
    }

    // Convert images to base64 for preview
    const imageUrls: string[] = [];
    const promises = imageFiles.map(file => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            imageUrls.push(e.target.result as string);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    await Promise.all(promises);
    
    // Show upload preview message
    const uploadMessage: ChatMessage = {
      type: 'user',
      content: `I've uploaded ${imageFiles.length} inspiration image${imageFiles.length > 1 ? 's' : ''} for you to analyze.`,
      timestamp: new Date(),
      uploadedImages: imageUrls
    };
    
    setChatMessages(prev => [...prev, uploadMessage]);
    
    // Send to Victoria with image context
    const contextMessage = `I've just uploaded ${imageFiles.length} inspiration image${imageFiles.length > 1 ? 's' : ''} for you to analyze. Please analyze the style, colors, composition, and design elements. Use these as inspiration for our design work.`;
    sendMessage(contextMessage);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Agent handoff system
  const handoffToNextAgent = async (currentAgentId: string, handoffContext: string) => {
    const current = agents.find(a => a.id === currentAgentId);
    const nextAgent = current?.nextAgent ? agents.find(a => a.id === current.nextAgent) : null;
    
    if (!nextAgent) {
      toast({
        title: 'Workflow Complete',
        description: 'All agents have completed their work!',
      });
      setWorkflowActive(false);
      return;
    }

    // Create handoff message
    const handoffMessage: ChatMessage = {
      type: 'agent',
      content: `🔄 **Handoff to ${nextAgent.name}**\n\n${current?.name} completed: ${handoffContext}\n\nNow passing to ${nextAgent.name} for ${nextAgent.workflowStage}...`,
      timestamp: new Date(),
      agentName: currentAgentId,
      handoffTo: nextAgent.id,
      isHandoff: true,
      workflowStage: nextAgent.workflowStage
    };

    setChatMessages(prev => [...prev, handoffMessage]);
    setCurrentAgent(nextAgent);
    setWorkflowStage(nextAgent.workflowStage);

    // Auto-send context to next agent
    setTimeout(() => {
      sendMessageToAgent(nextAgent.id, `Taking over from ${current?.name}. Context: ${handoffContext}. Please continue with ${nextAgent.workflowStage}.`);
    }, 1000);
  };

  // Send message to specific agent with conversation memory
  const sendMessageToAgent = async (agentId: string, message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);

    try {
      // Get conversation history for agent to learn and improve
      const conversationHistory = chatMessages.map(msg => ({
        type: msg.type === 'user' ? 'human' : 'assistant',
        content: msg.content
      }));

      const response = await apiRequest('POST', '/api/admin/agent-chat-bypass', {
        agentId: agentId,
        message: message,
        adminToken: 'sandra-admin-2025',
        conversationHistory: conversationHistory,
        workflowContext: {
          stage: workflowStage,
          previousWork: chatMessages.filter(msg => msg.agentName && msg.agentName !== agentId).slice(-3)
        }
      });

      const data = await response.json();
      
      if (data.message || data.response) {
        const agent = agents.find(a => a.id === agentId);
        const agentMessage: ChatMessage = {
          type: 'agent',
          content: data.message || data.response,
          timestamp: new Date(),
          agentName: agentId,
          workflowStage: agent?.workflowStage
        };
        setChatMessages(prev => [...prev, agentMessage]);

        // Auto-apply changes based on agent type
        const responseText = data.message || data.response;
        if (agentId === 'victoria') {
          const cssMatch = responseText.match(/```css\n([\s\S]*?)\n```/);
          if (cssMatch) {
            injectChangesToLivePreview(cssMatch[1]);
            toast({
              title: 'Victoria Applied Changes',
              description: 'Design updates applied to live preview',
            });
          }
        }

        // Check for handoff signals
        if (responseText.includes('HANDOFF:') || responseText.includes('Ready for next stage')) {
          const handoffContext = responseText.split('HANDOFF:')[1] || `${agent?.workflowStage} completed`;
          setTimeout(() => {
            handoffToNextAgent(agentId, handoffContext.trim());
          }, 2000);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to send message to ${agents.find(a => a.id === agentId)?.name}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to current agent
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: message,
      timestamp: new Date(),
      workflowStage: workflowStage
    };

    setChatMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    
    await sendMessageToAgent(currentAgent.id, message);
  };

  // Start workflow from beginning
  const startWorkflow = (initialRequest: string) => {
    setWorkflowActive(true);
    setCurrentAgent(agents[0]);
    setWorkflowStage(agents[0].workflowStage);
    
    const workflowMessage: ChatMessage = {
      type: 'agent',
      content: `🚀 **Design Studio Workflow Started**\n\nStarting with ${agents[0].name} for ${agents[0].workflowStage}...`,
      timestamp: new Date(),
      isHandoff: true,
      workflowStage: 'Design'
    };
    
    setChatMessages(prev => [...prev, workflowMessage]);
    sendMessageToAgent(agents[0].id, initialRequest);
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
        {/* Chat Panel - Optimized for Desktop */}
        <Panel defaultSize={35} minSize={25} maxSize={55}>
          <div 
            ref={chatPanelRef}
            className={`h-full border-r border-gray-200 bg-white flex flex-col ${isDragOver ? 'bg-blue-50 border-blue-300' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragOver && (
              <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center z-50 border-2 border-dashed border-blue-300">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-blue-700 font-medium">Drop inspiration images here</div>
                  <div className="text-blue-600 text-sm">Victoria will analyze them for you</div>
                </div>
              </div>
            )}
        {/* Chat Header with Agent Workflow - Desktop Optimized */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded">
                <span className="text-white text-base font-medium">{currentAgent.name[0]}</span>
              </div>
              <div>
                <div className="font-medium text-base">{currentAgent.name}</div>
                <div className="text-sm text-gray-500">{currentAgent.role}</div>
              </div>
            </div>
            <Button
              variant={showPropertiesPanel ? "default" : "outline"}
              size="sm"
              className="border-black text-black hover:bg-black hover:text-white"
              onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
            >
              Settings
            </Button>
          </div>

          {/* Workflow Progress - Desktop Optimized */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Design Studio Workflow</span>
              {workflowActive && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-black border border-gray-300">
                  Active: {workflowStage}
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className={`flex-1 h-3 rounded ${
                    agent.id === currentAgent.id
                      ? 'bg-black'
                      : agents.findIndex(a => a.id === currentAgent.id) > index
                      ? 'bg-gray-400'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              {agents.map(agent => (
                <span key={agent.id} className={agent.id === currentAgent.id ? 'font-medium text-black' : ''}>
                  {agent.name}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Workflow Starters */}
          {!workflowActive && (
            <div className="mt-3 space-y-1">
              <div className="text-xs font-medium text-gray-600 mb-2">Quick Start Workflows:</div>
              <div className="grid grid-cols-1 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 justify-start border-black text-black hover:bg-black hover:text-white"
                  onClick={() => startWorkflow("Create a new landing page design and implement it")}
                >
                  New Landing Page
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 justify-start border-black text-black hover:bg-black hover:text-white"
                  onClick={() => startWorkflow("Design and build a pricing section")}
                >
                  Pricing Section
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 justify-start border-black text-black hover:bg-black hover:text-white"
                  onClick={() => startWorkflow("Create an image gallery component")}
                >
                  Image Gallery
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs for Chat, Gallery, and Flatlay Library */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
            <TabsTrigger value="chat" className="text-sm">Chat</TabsTrigger>
            <TabsTrigger value="gallery" className="text-sm">Gallery</TabsTrigger>
            <TabsTrigger value="flatlays" className="text-sm">Flatlays</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 h-full">
            {/* Quick Commands - Desktop Optimized */}
            <div className="p-6 border-b border-gray-200">
              <h4 className="font-medium text-base mb-4">Quick Commands</h4>
              <div className="space-y-3">
                {quickCommands.map((command, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-sm h-11"
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

            {/* Chat Messages - Fixed Height */}
            <div 
              ref={chatMessagesRef}
              className="overflow-y-auto p-4 space-y-3" 
              style={{ height: 'calc(100vh - 500px)', minHeight: '200px' }}
            >
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 text-sm">
                  <div className="mb-2">Chat</div>
                  <div>Start chatting with {currentAgent.name}</div>
                  <div className="text-xs">Ask for {currentAgent.workflowStage.toLowerCase()}, upload images, or start a workflow</div>
                </div>
              )}
              
              {chatMessages.map((message, index) => {
                const agent = message.agentName ? agents.find(a => a.id === message.agentName) : null;
                return (
                <div
                  key={index}
                  className={`${
                    message.type === 'user' 
                      ? 'ml-4 bg-black text-white' 
                      : message.isHandoff
                      ? 'mx-2 bg-blue-50 border border-blue-200 text-blue-900'
                      : 'mr-4 bg-gray-100 text-gray-900'
                  } p-3 rounded-lg text-sm break-words whitespace-pre-wrap`}
                >
                  {/* Agent Name Header */}
                  {agent && !message.isHandoff && (
                    <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-200">
                      <div className="w-4 h-4 bg-black" />
                      <span className="font-medium text-xs">{agent.name}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-gray-500">{agent.workflowStage}</span>
                    </div>
                  )}
                  
                  {message.content}
                  
                  {/* Generated Image Preview like Maya */}
                  {message.imagePreview && message.imagePreview.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs opacity-70">Generated Images:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {message.imagePreview.map((imageUrl, imgIndex) => (
                          <div key={imgIndex} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Generated image ${imgIndex + 1}`}
                              className="w-full h-24 object-cover rounded border"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded flex items-center justify-center">
                              <button
                                className="opacity-0 group-hover:opacity-100 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded transition-opacity"
                                onClick={() => window.open(imageUrl, '_blank')}
                              >
                                View Full
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded Images Preview */}
                  {message.uploadedImages && message.uploadedImages.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs opacity-70">Uploaded Images:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {message.uploadedImages.map((imageUrl, imgIndex) => (
                          <div key={imgIndex} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Uploaded image ${imgIndex + 1}`}
                              className="w-full h-24 object-cover rounded border"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded flex items-center justify-center">
                              <button
                                className="opacity-0 group-hover:opacity-100 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded transition-opacity"
                                onClick={() => window.open(imageUrl, '_blank')}
                              >
                                View Full
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
              
              {isLoading && (
                <div className="mr-4 bg-gray-100 text-gray-900 p-3 rounded-lg text-sm">
                  {currentAgent.name} is thinking...
                </div>
              )}
            </div>

            {/* Chat Input with Upload - Fixed at Bottom */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex space-x-2">
                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 border-black text-black hover:bg-black hover:text-white"
                    title="Upload inspiration images"
                  >
                    Upload
                  </Button>
                </div>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Ask ${currentAgent.name} for ${currentAgent.workflowStage.toLowerCase()} help or upload inspiration images...`}
                  className="flex-1 text-sm h-9 border-2 border-black focus:border-black focus:ring-black"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(messageInput);
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="bg-black text-white hover:bg-gray-800 px-4"
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

            {/* Gallery Images Grid - Fixed scrolling */}
            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
              {aiImages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">
                  <div className="mb-2">Gallery</div>
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
                        <div className="absolute top-2 left-2 w-4 h-4 bg-black text-white flex items-center justify-center text-xs">
                          ♥
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

            {/* Flatlay Collections - Fixed scrolling */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
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

        {/* Main Live Preview Panel - Optimized for Desktop */}
        <Panel defaultSize={65} minSize={35}>
          <div className="h-full flex flex-col">
        {/* Top Toolbar - Desktop Optimized */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-6">
            <Badge variant="secondary" className="bg-black text-white border-black px-4 py-2">
              <div className="w-3 h-3 bg-white mr-3 rounded-full"></div>
              LIVE PREVIEW
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="default"
              className="border-black text-black hover:bg-black hover:text-white px-6"
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.src = iframeRef.current.src;
                }
              }}
            >
              Refresh
            </Button>
            <Button variant="outline" size="default" className="border-black text-black hover:bg-black hover:text-white px-6">
              Save
            </Button>
            <Button variant="default" size="default" className="bg-black text-white hover:bg-gray-800 px-6">
              Deploy
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
                {/* Properties Header - Desktop Optimized */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-medium text-sm">Properties</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-black hover:bg-gray-100"
                    onClick={() => setShowPropertiesPanel(false)}
                  >
                    ×
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
                  ${customCSSClass ? `.${customCSSClass} { border: 2px solid #000000; }` : ''}
                `;
                injectChangesToLivePreview(styles);
                toast({
                  title: 'Styles Applied',
                  description: 'Live preview updated',
                });
              }}
            >
              Apply Styles Live
            </Button>
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-sm mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-sm border-black text-black hover:bg-black hover:text-white">
                Add Heading
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm border-black text-black hover:bg-black hover:text-white">
                Add Text Block
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm border-black text-black hover:bg-black hover:text-white">
                Add Button
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm border-black text-black hover:bg-black hover:text-white">
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
                className="w-full justify-start text-sm border-black text-black hover:bg-black hover:text-white"
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
                Apply Luxury Typography
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-sm border-black text-black hover:bg-black hover:text-white"
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
                Editorial Layout
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-sm border-black text-black hover:bg-black hover:text-white"
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
                Vogue Mode
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