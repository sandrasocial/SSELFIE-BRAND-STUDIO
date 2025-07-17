import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, 
  Edit3,
  MessageSquare,
  Save, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
import { FileTreeExplorer } from './FileTreeExplorer';
import { MultiTabEditor } from './MultiTabEditor';
import { FormattedAgentMessage } from './FormattedAgentMessage';

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

interface CollapsibleCodeBlockProps {
  content: string;
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

function CollapsibleCodeBlock({ content }: CollapsibleCodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if content has code blocks or is very long
  const hasCodeBlocks = content.includes('```') || content.includes('<') || content.includes('{');
  const isLongContent = content.length > 300;
  const shouldCollapse = hasCodeBlocks || isLongContent;
  
  if (!shouldCollapse) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }
  
  const preview = content.substring(0, 150) + (content.length > 150 ? '...' : '');
  
  return (
    <div className="space-y-2">
      <div className="whitespace-pre-wrap">
        {isExpanded ? content : preview}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-gray-500 hover:text-black border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3 h-3 inline mr-1" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3 inline mr-1" />
            Show more
          </>
        )}
      </button>
    </div>
  );
}

export function OptimizedVisualEditor({ className = '' }: OptimizedVisualEditorProps) {
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    // Load conversation history from localStorage
    const savedConversations = localStorage.getItem('visual-editor-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        const agentKey = new URLSearchParams(window.location.search).get('agent') || 'victoria';
        return parsed[agentKey] || [];
      } catch (e) {
        console.warn('Failed to parse saved conversations:', e);
        return [];
      }
    }
    return [];
  });
  const [messageInput, setMessageInput] = useState('');
  const [selectedTextColor, setSelectedTextColor] = useState('#000000');
  const [selectedFontSize, setSelectedFontSize] = useState(16);
  const [selectedMargin, setSelectedMargin] = useState('16px');
  const [customCSSClass, setCustomCSSClass] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [currentAgent, setCurrentAgent] = useState<Agent>(() => {
    const agentIdFromUrl = new URLSearchParams(window.location.search).get('agent');
    return agentIdFromUrl ? agents.find(a => a.id === agentIdFromUrl) || agents[0] : agents[0];
  });
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [workflowActive, setWorkflowActive] = useState(false);
  const [workflowStage, setWorkflowStage] = useState('Design');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Save conversations to localStorage whenever messages change
  useEffect(() => {
    const saveConversations = () => {
      const savedConversations = localStorage.getItem('visual-editor-conversations');
      let conversations = {};
      
      if (savedConversations) {
        try {
          conversations = JSON.parse(savedConversations);
        } catch (e) {
          console.warn('Failed to parse existing conversations:', e);
        }
      }

      conversations[currentAgent.id] = chatMessages;
      localStorage.setItem('visual-editor-conversations', JSON.stringify(conversations));
    };

    if (chatMessages.length > 0) {
      saveConversations();
    }
  }, [chatMessages, currentAgent.id]);

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
    
    // Load conversation history for new agent
    const savedConversations = localStorage.getItem('visual-editor-conversations');
    let newAgentMessages: ChatMessage[] = [];
    
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        newAgentMessages = parsed[nextAgent.id] || [];
      } catch (e) {
        console.warn('Failed to load conversations for new agent:', e);
      }
    }
    
    setCurrentAgent(nextAgent);
    setWorkflowStage(nextAgent.workflowStage);
    setChatMessages(newAgentMessages);

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
      // Get conversation history for agent to learn and improve - proper format
      const conversationHistory = chatMessages.map(msg => ({
        type: msg.type, // Keep original 'user' and 'agent' format
        content: msg.content
      }));

      console.log('📤 Sending to agent:', {
        agentId,
        messageLength: message.length,
        conversationHistoryLength: conversationHistory.length,
        workflowStage
      });

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

      console.log('📥 Agent response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Agent response error:', errorText);
        throw new Error(`Agent response failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Agent response data:', data);
      
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
          // Look for CSS injection patterns
          const cssMatch = responseText.match(/```css\n([\s\S]*?)\n```/);
          if (cssMatch) {
            console.log('🎨 Victoria provided CSS changes:', cssMatch[1]);
            injectChangesToLivePreview(cssMatch[1]);
          }
          
          // Look for HTML/component changes
          const htmlMatch = responseText.match(/```html\n([\s\S]*?)\n```/);
          if (htmlMatch) {
            console.log('🏗️ Victoria provided HTML changes:', htmlMatch[1]);
          }
          
          // Check for file creation JSON response
          if (responseText.includes('```json') && responseText.includes('file_creation')) {
            console.log('📁 Victoria provided file creation JSON - files should be created automatically');
            toast({
              title: 'Victoria is creating files!',
              description: 'New components are being added to the codebase',
            });
          }
        }

        // Check if server responded with filesCreated array - immediate dev preview update
        if (data.filesCreated && data.filesCreated.length > 0) {
          console.log('✅ Files successfully created:', data.filesCreated);
          
          // Immediate refresh of dev preview to show new files
          if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
          }
          
          // Show success notification
          toast({
            title: `${data.agentName} created files!`,
            description: `Check dev preview - files are live! Say "approve" to hand off to next agent.`,
          });
        }

        // Check for approval and handoff signals in USER messages (when Sandra says "approve")
        const userApproval = chatMessages[chatMessages.length - 2]?.content?.toLowerCase().includes('approve');
        if (userApproval && agentId === 'victoria') {
          console.log('🎯 Sandra approved design - handing off to Maya for implementation');
          setTimeout(() => {
            handoffToNextAgent(agentId, 'Design approved by Sandra - implement technical features and optimize performance');
          }, 1500);
        } else if (responseText.includes('HANDOFF:') || responseText.includes('Ready for next stage')) {
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
      <PanelGroup direction="horizontal" className="h-full md:flex-row flex-col">
        {/* Chat Panel - Resizable */}
        <Panel defaultSize={35} minSize={25} maxSize={50} className="md:min-w-0 min-h-[40vh] md:min-h-0">
          <div 
            ref={chatPanelRef}
            className={`h-full border-r md:border-r border-b md:border-b-0 border-gray-200 bg-white flex flex-col ${isDragOver ? 'bg-blue-50 border-blue-300' : ''}`}
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
        {/* Chat Header with Agent Workflow - Compact */}
        <div className="p-2 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-100"
                onClick={() => window.location.href = '/sandra-command'}
                title="Back to Dashboard"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="w-6 h-6 bg-black flex items-center justify-center">
                <span className="text-white text-xs font-medium">{currentAgent.name[0]}</span>
              </div>
              <div>
                <div className="font-medium text-xs">{currentAgent.name}</div>
                <div className="text-xs text-gray-500">{currentAgent.role}</div>
              </div>
            </div>
            <Button
              variant={showPropertiesPanel ? "default" : "outline"}
              size="sm"
              className="border-black text-black hover:bg-black hover:text-white text-xs px-2 py-1"
              onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
            >
              Settings
            </Button>
          </div>

          {/* Workflow Progress - Compact */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Workflow</span>
              {workflowActive && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-black border border-gray-300 px-1 py-0">
                  {workflowStage}
                </Badge>
              )}
            </div>
            <div className="flex space-x-1">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className={`flex-1 h-1 ${
                    agent.id === currentAgent.id
                      ? 'bg-black'
                      : agents.findIndex(a => a.id === currentAgent.id) > index
                      ? 'bg-gray-400'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions & Workflow Starters - Collapsible */}
          {!workflowActive && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-600">Quick Actions & Workflows</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowQuickActions(!showQuickActions)}
                >
                  {showQuickActions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
              
              {showQuickActions && (
                <div className="space-y-3">
                  {/* Quick Start Workflows */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">Workflows:</div>
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

                  {/* Quick Commands */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">Quick Commands:</div>
                    <div className="space-y-1">
                      {quickCommands.map((command, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs h-7 border-gray-300 text-gray-700 hover:bg-gray-100"
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
                        className="w-full justify-start text-xs h-7 bg-purple-50 border-purple-200 hover:bg-purple-100"
                        onClick={generateImagesWithVictoria}
                        disabled={isLoading}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span className="ml-2">
                          {isLoading ? 'Generating...' : 'Generate Images'}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs for Chat, Gallery, Flatlay Library, File Tree, and Editor */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 mx-1 md:mx-2 mt-1 md:mt-2">
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs">Gallery</TabsTrigger>
            <TabsTrigger value="flatlays" className="text-xs">Flatlays</TabsTrigger>
            <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
            <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            {/* Chat Messages - Expanded Space */}
            <div className="flex-1 overflow-y-auto p-1 md:p-2 space-y-1 md:space-y-2" style={{ minHeight: '300px', maxHeight: 'calc(100vh - 250px)' }}>
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
                <div key={index} className="max-w-[95%] w-full">
                  {message.type === 'user' ? (
                    <div className="ml-2 bg-black text-white p-2 rounded-lg text-sm">
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ) : message.isHandoff ? (
                    <div className="mx-1 bg-blue-50 border border-blue-200 text-blue-900 p-2 rounded-lg text-sm">
                      <CollapsibleCodeBlock content={message.content} />
                    </div>
                  ) : (
                    <div className="mr-2">
                      <FormattedAgentMessage
                        content={message.content}
                        agentName={agent?.name}
                        timestamp={message.timestamp}
                      />
                    </div>
                  )}
                  
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

            {/* Chat Input with Upload - Multi-line */}
            <div className="px-1 py-0.5 border-t border-gray-200">
              <div className="flex space-x-1">
                <div className="flex flex-col space-y-1">
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
                    <Paperclip className="w-3 h-3" />
                  </Button>
                </div>
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Ask ${currentAgent.name} for ${currentAgent.workflowStage.toLowerCase()} help or upload inspiration images...`}
                  className="flex-1 text-sm md:text-sm text-xs resize-none border border-gray-200 p-2 rounded"
                  rows={3}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(messageInput);
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="bg-black text-white hover:bg-gray-800 self-end"
                  onClick={() => sendMessage(messageInput)}
                  disabled={!messageInput.trim() || isLoading}
                >
                  Send
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

          <TabsContent value="files" className="flex-1 flex flex-col mt-0">
            <FileTreeExplorer 
              selectedAgent={currentAgent.id}
              onFileSelect={(filePath, content) => {
                // Add file content to chat context for agent
                const fileMessage: ChatMessage = {
                  type: 'user',
                  content: `I'm looking at file: ${filePath}\n\nFile content:\n\`\`\`\n${content.substring(0, 1000)}${content.length > 1000 ? '...\n[Content truncated - file is ' + content.length + ' characters]' : ''}\n\`\`\`\n\nPlease analyze this file and help me understand or improve it.`,
                  timestamp: new Date()
                };
                setChatMessages(prev => [...prev, fileMessage]);
                
                // Switch to chat tab to see the context
                setActiveTab('chat');
                
                toast({
                  title: 'File Loaded',
                  description: `${filePath} content added to chat context`,
                });
              }}
            />
          </TabsContent>

          <TabsContent value="editor" className="flex-1 flex flex-col mt-0">
            <MultiTabEditor 
              selectedAgent={currentAgent.id}
              onFileChange={(filePath, content) => {
                // Notify when files are saved - could trigger dev preview refresh
                toast({
                  title: 'File Updated',
                  description: `${filePath} changes saved`,
                });
                
                // Refresh live preview if it's a key file
                if (filePath.includes('component') || filePath.includes('page')) {
                  if (iframeRef.current) {
                    setTimeout(() => {
                      if (iframeRef.current) {
                        iframeRef.current.src = iframeRef.current.src;
                      }
                    }, 1000);
                  }
                }
              }}
            />
          </TabsContent>
        </Tabs>
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-2 bg-gray-100 hover:bg-gray-200 transition-colors" />

        {/* Main Live Preview Panel - Resizable */}
        <Panel defaultSize={65} minSize={30} className="md:min-w-0 min-h-[60vh] md:min-h-0">
          <div className="h-full flex flex-col">
        {/* Top Toolbar */}
        <div className="border-b border-gray-200 px-2 md:px-4 py-1 md:py-2 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-black text-white border-black">
              <div className="w-2 h-2 bg-white mr-2"></div>
              LIVE PREVIEW
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-black text-black hover:bg-black hover:text-white"
              onClick={() => {
                if (iframeRef.current) {
                  setIframeLoading(true);
                  // Force complete reload with cache busting
                  const currentSrc = iframeRef.current.src.split('?')[0]; // Remove existing params
                  iframeRef.current.src = currentSrc + '?refresh=' + Date.now();
                }
              }}
            >
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="border-black text-black hover:bg-black hover:text-white">
              Save
            </Button>
            <Button variant="default" size="sm" className="bg-black text-white hover:bg-gray-800">
              Deploy
            </Button>
          </div>
        </div>

            {/* Live Development Preview */}
            <div className="flex-1 relative">
              {/* Loading overlay */}
              {iframeLoading && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <div className="text-sm text-gray-600">Loading SSELFIE Studio...</div>
                  </div>
                </div>
              )}
              
              <iframe
                ref={iframeRef}
                src={window.location.origin}
                className="w-full h-full border-0"
                title="Live SSELFIE Studio"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-downloads allow-presentation"
                allow="fullscreen; picture-in-picture; web-share; camera; microphone; geolocation"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => {
                  console.log('🚀 Live SSELFIE Studio loaded in visual editor');
                  setIframeLoading(false);
                  
                  // Enhanced image loading fix for iframe
                  setTimeout(() => {
                    try {
                      const iframeDoc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
                      if (iframeDoc) {
                        // Add meta tags for proper image loading
                        const metaReferrer = iframeDoc.createElement('meta');
                        metaReferrer.setAttribute('name', 'referrer');
                        metaReferrer.setAttribute('content', 'no-referrer-when-downgrade');
                        iframeDoc.head?.appendChild(metaReferrer);
                        
                        // Enhanced image loading fix
                        const fixImages = () => {
                          const images = iframeDoc.querySelectorAll('img');
                          console.log(`🖼️ Found ${images.length} images in iframe`);
                          
                          images.forEach((img, index) => {
                            if (!img.complete || img.naturalWidth === 0) {
                              console.log(`🔄 Reloading image ${index + 1}:`, img.src);
                              const originalSrc = img.src;
                              
                              // Set crossorigin attribute for better loading
                              img.crossOrigin = 'anonymous';
                              img.referrerPolicy = 'no-referrer-when-downgrade';
                              
                              // Force reload with cache busting
                              img.src = '';
                              setTimeout(() => {
                                img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 'v=' + Date.now();
                              }, 100);
                            }
                          });
                        };
                        
                        // Initial fix
                        fixImages();
                        
                        // Fix again after DOM changes
                        const observer = new MutationObserver(() => {
                          fixImages();
                        });
                        observer.observe(iframeDoc.body, { childList: true, subtree: true });
                        
                        // Add hover effects for elements
                        setTimeout(() => {
                          const hoverStyles = `
                            * { transition: box-shadow 0.2s ease !important; }
                            *:hover { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important; }
                          `;
                          injectChangesToLivePreview(hoverStyles);
                        }, 1000);
                      }
                    } catch (error) {
                      console.warn('Could not access iframe content:', error);
                    }
                  }, 500);
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