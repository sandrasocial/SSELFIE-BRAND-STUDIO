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
  Paperclip,
  Code,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { FileTreeExplorer } from './FileTreeExplorer';
import { MultiTabEditor } from './MultiTabEditor';
import { FormattedAgentMessage } from './FormattedAgentMessage';
import { ElenaCoordinationPanel } from './ElenaCoordinationPanel';
import { ConversationThread } from './ConversationThread';
import { EnhancedInput } from './EnhancedInput';
import { MessageInteraction } from './MessageInteraction';
import { CodeIntelligence } from './CodeIntelligence';
import { EnhancedSyntaxHighlighter } from './SyntaxHighlighter';
import { CodeFormatter } from './CodeFormatter';
import { CodeEditor } from './CodeEditor';
import { FileManagement } from './FileManagement';
import { ProjectOrganization } from './ProjectOrganization';
import { WorkspaceIntelligence } from './WorkspaceIntelligence';

import { AgentChatControls } from './AgentChatControls';
import { QuickActionsPopup } from './QuickActionsPopup';
import { FileCreationConfirmation } from './FileCreationConfirmation';
import AgentEnhancementDashboard from '../admin/AgentEnhancementDashboard';
import { workspaceFlatlayCollections } from '@/data/workspace-flatlay-collections';

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
  workflowId?: string;
  workflowProgress?: WorkflowProgress;
  isWorkflowMessage?: boolean;
}

interface WorkflowProgress {
  workflowId: string;
  workflowName: string;
  currentStep: number;
  totalSteps: number;
  status: 'creating' | 'ready' | 'executing' | 'completed' | 'failed';
  currentAgent?: string;
  estimatedTimeRemaining?: string;
  completedTasks: string[];
  nextActions: string[];
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
    id: 'elena',
    name: 'Elena',
    role: 'AI Agent Director & CEO',
    expertise: ['Workflow Creation', 'Agent Coordination', 'Strategic Planning', 'Task Orchestration'],
    color: 'bg-black',
    nextAgent: 'olga',
    workflowStage: 'Strategy'
  },

  {
    id: 'aria',
    name: 'Aria',
    role: 'UX Designer AI',
    expertise: ['Luxury Design', 'Editorial Layouts', 'Typography', 'Component Design'],
    color: 'bg-purple-500',
    nextAgent: 'zara',
    workflowStage: 'Design'
  },
  {
    id: 'zara',
    name: 'Zara',
    role: 'Dev AI',
    expertise: ['React/TypeScript', 'Database Design', 'API Development', 'Performance'],
    color: 'bg-blue-500',
    nextAgent: 'rachel',
    workflowStage: 'Development'
  },
  {
    id: 'rachel',
    name: 'Rachel',
    role: 'Voice AI',
    expertise: ['Brand Voice', 'Conversion Copy', 'Email Campaigns', 'Content Strategy'],
    color: 'bg-pink-500',
    nextAgent: 'ava',
    workflowStage: 'Content'
  },
  {
    id: 'ava',
    name: 'Ava',
    role: 'Automation AI',
    expertise: ['Workflow Design', 'API Integration', 'Email Automation', 'Business Logic'],
    color: 'bg-green-500',
    nextAgent: 'quinn',
    workflowStage: 'Automation'
  },
  {
    id: 'quinn',
    name: 'Quinn',
    role: 'QA AI',
    expertise: ['Quality Testing', 'User Experience', 'Performance Audit', 'Bug Detection'],
    color: 'bg-orange-500',
    nextAgent: 'sophia',
    workflowStage: 'Quality Assurance'
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Social Media Manager AI',
    expertise: ['Instagram Growth', 'Content Strategy', 'Community Building', 'Analytics'],
    color: 'bg-teal-500',
    nextAgent: 'martha',
    workflowStage: 'Social Media'
  },
  {
    id: 'martha',
    name: 'Martha',
    role: 'Marketing/Ads AI',
    expertise: ['Performance Marketing', 'A/B Testing', 'Revenue Optimization', 'Analytics'],
    color: 'bg-red-500',
    nextAgent: 'diana',
    workflowStage: 'Marketing'
  },
  {
    id: 'diana',
    name: 'Diana',
    role: 'Personal Mentor & Business Coach AI',
    expertise: ['Strategic Planning', 'Business Coaching', 'Decision Making', 'Team Coordination'],
    color: 'bg-indigo-500',
    nextAgent: 'wilma',
    workflowStage: 'Strategy'
  },
  {
    id: 'wilma',
    name: 'Wilma',
    role: 'Workflow AI',
    expertise: ['Process Optimization', 'Automation Design', 'Efficiency', 'System Integration'],
    color: 'bg-yellow-500',
    nextAgent: 'olga',
    workflowStage: 'Workflow'
  },
  {
    id: 'olga',
    name: 'Olga',
    role: 'Repository Organizer AI',
    expertise: ['File Organization', 'Architecture Cleanup', 'Dependency Analysis', 'Safe Refactoring'],
    color: 'bg-cyan-500',
    nextAgent: 'aria',
    workflowStage: 'Organization'
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
            ▲ Show less
          </>
        ) : (
          <>
            ▼ Show more
          </>
        )}
      </button>
    </div>
  );
}

export function OptimizedVisualEditor({ className = '' }: OptimizedVisualEditorProps) {
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // If agent parameter is provided, start with agent chat tab
    const agentParam = new URLSearchParams(window.location.search).get('agent');
    return agentParam ? 'agent' : 'chat';
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [selectedTextColor, setSelectedTextColor] = useState('#000000');
  const [selectedFontSize, setSelectedFontSize] = useState(16);
  const [selectedMargin, setSelectedMargin] = useState('16px');
  const [customCSSClass, setCustomCSSClass] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [agentController, setAgentController] = useState<AbortController | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [workflowPollingInterval, setWorkflowPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  // Removed iframeLoading state - no longer using iframes
  const [currentAgent, setCurrentAgent] = useState<Agent>(() => {
    const agentIdFromUrl = new URLSearchParams(window.location.search).get('agent');
    if (agentIdFromUrl) {
      const foundAgent = agents.find(a => a.id === agentIdFromUrl);
      if (foundAgent) return foundAgent;
    }
    // Default to 'elena' (Agent Director) for workflow creation
    return agents.find(a => a.id === 'elena') || agents[0];
  });
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [workflowActive, setWorkflowActive] = useState(false);
  const [workflowStage, setWorkflowStage] = useState('Design');
  const [activeWorkingAgent, setActiveWorkingAgent] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load conversation history from database when agent changes
  useEffect(() => {
    const loadConversationHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await fetch(`/api/admin/agent-conversation-history/${currentAgent.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminToken: 'sandra-admin-2025' })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.conversations && data.conversations.length > 0) {
            const formattedMessages: ChatMessage[] = data.conversations.map((conv: any) => [
              {
                type: 'user' as const,
                content: conv.user_message,
                timestamp: new Date(conv.timestamp),
                agentName: currentAgent.id
              },
              {
                type: 'agent' as const,
                content: conv.agent_response,
                timestamp: new Date(conv.timestamp),
                agentName: currentAgent.id,
                // Restore workflow context if it exists in the response
                workflowId: conv.agent_response.includes('Workflow ID:') ? 
                  conv.agent_response.match(/Workflow ID:\s*(\w+)/)?.[1] : undefined
              }
            ]).flat();
            setChatMessages(formattedMessages);
            
            // If Elena and we have workflow messages, start polling active workflows
            if (currentAgent.id === 'elena') {
              const workflowMessages = formattedMessages.filter(msg => msg.workflowId);
              if (workflowMessages.length > 0) {
                const lastWorkflowId = workflowMessages[workflowMessages.length - 1].workflowId;
                if (lastWorkflowId) {
                  console.log(`🔄 Restored Elena conversation with workflow ${lastWorkflowId}, checking status...`);
                  // Check workflow status and start polling if still active
                  fetch(`/api/elena/workflow-status/${lastWorkflowId}`)
                    .then(res => res.json())
                    .then(statusData => {
                      if (statusData.success && statusData.progress.status === 'executing') {
                        console.log('🚀 Resuming workflow polling for active workflow');
                        startWorkflowProgressPolling(lastWorkflowId);
                      }
                    })
                    .catch(err => console.log('Could not check workflow status:', err));
                }
              }
            }
          } else {
            setChatMessages([]);
          }
        }
      } catch (error) {
        console.error('Failed to load conversation history:', error);
        setChatMessages([]);
      } finally {
        // Delay to prevent immediate save attempts on loaded messages
        setTimeout(() => setIsLoadingHistory(false), 100);
      }
    };

    loadConversationHistory();
  }, [currentAgent.id]);

  // Save conversations to database whenever NEW messages are added (not when loading history)
  useEffect(() => {
    // Don't save while loading conversation history
    if (isLoadingHistory) return;
    
    const saveConversations = async () => {
      if (chatMessages.length < 2) return; // Need at least user + agent message
      
      try {
        const lastMessage = chatMessages[chatMessages.length - 1];
        if (lastMessage.type === 'agent' && lastMessage.content) {
          // Save the complete conversation pair to database
          const userMessage = chatMessages[chatMessages.length - 2];
          if (userMessage && userMessage.type === 'user' && userMessage.content) {
            // Only save if both messages have actual content
            const userContent = typeof userMessage.content === 'string' ? userMessage.content.trim() : '';
            const agentContent = typeof lastMessage.content === 'string' ? lastMessage.content.trim() : '';
            
            if (userContent.length > 0 && agentContent.length > 0) {
              // Check if this conversation pair is already in the database (avoid duplicates)
              const isNewConversation = !chatMessages.some((msg, index) => 
                index < chatMessages.length - 2 && 
                msg.type === 'user' && 
                msg.content === userContent &&
                chatMessages[index + 1]?.content === agentContent
              );
              
              if (isNewConversation) {
                const response = await fetch('/api/admin/agent-conversation-save', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    adminToken: 'sandra-admin-2025',
                    agentId: currentAgent.id || 'unknown',
                    userMessage: userContent,
                    agentResponse: agentContent
                  })
                });
                
                if (!response.ok) {
                  const errorText = await response.text();
                  console.error('Failed to save conversation:', errorText);
                } else {
                  console.log('✅ Conversation saved successfully for', currentAgent.id);
                }
              } else {
                console.log('⚠️ Skipping save - duplicate conversation detected');
              }
            } else {
              console.log('⚠️ Skipping save - empty content:', { userLength: userContent.length, agentLength: agentContent.length });
            }
          }
        }
      } catch (error) {
        console.error('Failed to save conversation:', error);
      }
    };

    // Only attempt to save if we have actual messages with content and we're not loading history
    if (chatMessages.length >= 2 && !isLoadingHistory) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage.type === 'agent' && lastMessage.content) {
        // Add a small delay to ensure the message is finalized
        setTimeout(saveConversations, 500);
      }
    }
  }, [chatMessages, currentAgent.id, isLoadingHistory]);

  // Auto-scroll chat to bottom when new messages are added (only for agent chat)
  useEffect(() => {
    if (activeTab === 'chat' && chatContainerRef.current) {
      const scrollToBottom = () => {
        const container = chatContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      };
      
      // Small delay to ensure content is rendered
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [chatMessages, activeTab]);

  // Fetch user's AI gallery
  const { data: aiImages = [] } = useQuery<AIImage[]>({
    queryKey: ['/api/ai-images'],
  });

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

  // Handle file selection from FileCreationConfirmation component
  const handleFileSelect = (filePath: string) => {
    console.log('File selected for editing:', filePath);
    toast({
      title: 'File Selected',
      description: `Selected file: ${filePath}`,
    });
    // TODO: Open the selected file in the editor if needed
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

  // Workflow progress polling function
  const startWorkflowProgressPolling = (workflowId: string) => {
    // Clear any existing polling
    if (workflowPollingInterval) {
      clearInterval(workflowPollingInterval);
    }
    
    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/elena/workflow-status/${workflowId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.progress) {
            // Update the last workflow message with progress
            setChatMessages(prev => {
              const updated = [...prev];
              const lastWorkflowIndex = updated.findLastIndex(msg => msg.workflowId === workflowId);
              if (lastWorkflowIndex !== -1) {
                updated[lastWorkflowIndex] = {
                  ...updated[lastWorkflowIndex],
                  workflowProgress: data.progress,
                  content: `**Workflow Progress Update**\n\n**Step:** ${data.progress.currentStep}/${data.progress.totalSteps}\n**Current Agent:** ${data.progress.currentAgent || 'Coordinating'}\n**Status:** ${data.progress.status}\n\n**Completed Tasks:**\n${data.progress.completedTasks.join('\n')}\n\n**Next Actions:**\n${data.progress.nextActions.join('\n')}`
                };
              }
              return updated;
            });
            
            // Stop polling if workflow is completed or failed
            if (data.progress.status === 'completed' || data.progress.status === 'failed') {
              if (workflowPollingInterval) {
                clearInterval(workflowPollingInterval);
                setWorkflowPollingInterval(null);
              }
              
              // Add completion message
              const completionMessage: ChatMessage = {
                type: 'agent',
                content: data.progress.status === 'completed' 
                  ? `**🎉 Workflow Completed Successfully!**\n\nAll agents have completed their assigned tasks. The workflow has been executed and your files have been updated.`
                  : `**❌ Workflow Failed**\n\nThe workflow encountered an error and could not be completed. Please check the logs for details.`,
                timestamp: new Date(),
                agentName: 'elena',
                workflowStage: 'Complete'
              };
              setChatMessages(prev => [...prev, completionMessage]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to poll workflow progress:', error);
      }
    };
    
    // Start polling every 3 seconds
    const interval = setInterval(pollProgress, 3000);
    setWorkflowPollingInterval(interval);
    
    // Initial poll
    pollProgress();
  };

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (workflowPollingInterval) {
        clearInterval(workflowPollingInterval);
      }
    };
  }, [workflowPollingInterval]);

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

  // Agent control handlers
  const handleStopAgent = () => {
    if (agentController) {
      try {
        agentController.abort();
      } catch (error) {
        console.log('Agent already stopped');
      }
      setAgentController(null);
    }
    setIsLoading(false);
    setIsPaused(false);
    
    const stopMessage: ChatMessage = {
      type: 'agent',
      content: '🛑 **Work stopped by user**\n\nI\'ve stopped my current task. Let me know how you\'d like to proceed!',
      timestamp: new Date(),
      agentName: currentAgent.name,
    };
    setChatMessages(prev => [...prev, stopMessage]);
  };

  const handlePauseAgent = () => {
    setIsPaused(!isPaused);
    const pauseMessage: ChatMessage = {
      type: 'agent',
      content: isPaused 
        ? '▶️ **Work resumed**\n\nContinuing where I left off...'
        : '⏸️ **Work paused**\n\nI\'ve paused my current task. Click resume when you\'re ready to continue.',
      timestamp: new Date(),
      agentName: currentAgent.name,
    };
    setChatMessages(prev => [...prev, pauseMessage]);
  };

  const handleRollbackAgent = () => {
    // Remove last 2 messages (user + agent response)
    setChatMessages(prev => prev.slice(0, -2));
    
    const rollbackMessage: ChatMessage = {
      type: 'agent',
      content: '↶ **Rolled back**\n\nI\'ve undone my last response. What would you like me to do instead?',
      timestamp: new Date(),
      agentName: currentAgent.name,
    };
    setChatMessages(prev => [...prev, rollbackMessage]);
  };

  // Send message to specific agent with conversation memory
  const sendMessageToAgent = async (agentId: string, message: string) => {
    if (!message.trim() || isPaused) return;

    // Create abort controller for this request
    const controller = new AbortController();
    setAgentController(controller);
    setIsLoading(true);
    setActiveWorkingAgent(agentId); // Start pulsating indicator

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

      // Elena workflow handling - creation and execution
      const isWorkflowCreationRequest = message.toLowerCase().includes('create workflow') || 
                                      message.toLowerCase().includes('design workflow') ||
                                      message.toLowerCase().includes('new workflow');
      
      const isWorkflowExecutionRequest = message.toLowerCase().includes('execute workflow') || 
                                       message.toLowerCase().includes('start workflow') ||
                                       message.toLowerCase().includes('run workflow');
      
      let endpoint = '/api/admin/agents/chat';
      if (agentId === 'elena' && isWorkflowCreationRequest) {
        endpoint = '/api/admin/elena/create-workflow';
      } else if (agentId === 'elena' && isWorkflowExecutionRequest) {
        // Check for workflow ID in conversation history
        const lastWorkflowMessage = chatMessages.slice().reverse().find(msg => msg.workflowId);
        if (lastWorkflowMessage?.workflowId) {
          endpoint = '/api/admin/elena/execute-workflow';
        }
      }
      
      let requestBody;
      if (agentId === 'elena' && isWorkflowCreationRequest) {
        requestBody = {
          request: message,
          userId: 'admin-sandra',
          adminToken: 'sandra-admin-2025'
        };
      } else if (agentId === 'elena' && isWorkflowExecutionRequest) {
        const lastWorkflowMessage = chatMessages.slice().reverse().find(msg => msg.workflowId);
        if (lastWorkflowMessage?.workflowId) {
          requestBody = {
            workflowId: lastWorkflowMessage.workflowId,
            userId: 'admin-sandra',
            adminToken: 'sandra-admin-2025'
          };
        } else {
          // If no workflow ID found, treat as regular Elena chat
          endpoint = '/api/admin/agents/chat';
          requestBody = {
            agentId: agentId,
            message: message,
            adminToken: 'sandra-admin-2025',
            conversationHistory: conversationHistory,
            workflowContext: {
              stage: workflowStage,
              previousWork: chatMessages.filter(msg => msg.agentName && msg.agentName !== agentId).slice(-3)
            }
          };
        }
      } else {
        requestBody = {
          agentId: agentId,
          message: message,
          adminToken: 'sandra-admin-2025',
          conversationHistory: conversationHistory,
          workflowContext: {
            stage: workflowStage,
            previousWork: chatMessages.filter(msg => msg.agentName && msg.agentName !== agentId).slice(-3)
          }
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      console.log('📥 Agent response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Agent response error:', errorText);
        throw new Error(`Agent response failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Agent response data:', data);
      
      if (data.message || data.response || data.workflow) {
        const agent = agents.find(a => a.id === agentId);
        
        // Handle Elena workflow creation response
        if (agentId === 'elena' && data.workflow) {
          const workflowMessage: ChatMessage = {
            type: 'agent',
            content: `**Workflow Created: ${data.workflow.name}**\n\n${data.workflow.description}\n\n**Steps:**\n${data.workflow.steps.map((step: any, index: number) => 
              `${index + 1}. ${step.agentName}: ${step.taskDescription}`
            ).join('\n')}\n\n**Estimated Duration:** ${data.workflow.estimatedDuration}\n\n**Status:** Ready for execution\n\nSay "execute workflow" to begin execution, or "modify workflow" to make changes.`,
            timestamp: new Date(),
            agentName: 'elena',
            workflowStage: 'Strategy',
            workflowId: data.workflow.id,
            workflowProgress: {
              workflowId: data.workflow.id,
              workflowName: data.workflow.name,
              currentStep: 0,
              totalSteps: data.workflow.steps.length,
              status: 'ready',
              estimatedTimeRemaining: data.workflow.estimatedDuration,
              completedTasks: [],
              nextActions: [data.workflow.steps[0]?.taskDescription || 'Ready to begin']
            },
            isWorkflowMessage: true
          };
          setChatMessages(prev => [...prev, workflowMessage]);
        } else if (agentId === 'elena' && (data.executionId || data.success)) {
          // Handle Elena workflow execution response
          const workflowId = data.workflowId || chatMessages.slice().reverse().find(msg => msg.workflowId)?.workflowId;
          const executionMessage: ChatMessage = {
            type: 'agent',
            content: `**Workflow Execution Started**\n\n🚀 Starting workflow execution${data.executionId ? ` with ID: ${data.executionId}` : ''}\n\nI am now coordinating all agents to complete the workflow steps. You will see live progress updates as each agent completes their tasks.\n\n**Status:** Executing\n**Progress:** 0% complete`,
            timestamp: new Date(),
            agentName: 'elena',
            workflowStage: 'Executing',
            workflowId: workflowId || 'unknown',
            workflowProgress: {
              workflowId: workflowId || 'unknown',
              workflowName: 'Executing Workflow',
              currentStep: 0,
              totalSteps: 1,
              status: 'executing',
              estimatedTimeRemaining: 'In progress...',
              completedTasks: [],
              nextActions: ['Starting workflow execution...']
            },
            isWorkflowMessage: true
          };
          setChatMessages(prev => [...prev, executionMessage]);
          
          // Start polling for workflow progress
          if (workflowId) {
            startWorkflowProgressPolling(workflowId);
          }
        } else {
          const agentMessage: ChatMessage = {
            type: 'agent',
            content: data.message || data.response,
            timestamp: new Date(),
            agentName: agentId,
            workflowStage: agent?.workflowStage
          };
          setChatMessages(prev => [...prev, agentMessage]);
        }

        // Show notification for file operations (code blocks automatically written)
        const responseText = data.message || data.response;
        if (responseText.includes('Files Modified Successfully') || responseText.includes('✅') || responseText.includes('Files Created:') || responseText.includes('Created:**')) {
          toast({
            title: `${agent?.name} updated files`,
            description: 'Code changes applied automatically. File tree refreshing...',
          });
          
          // Trigger file tree refresh and live preview refresh
          setTimeout(() => {
            if ((window as any).refreshFileTree) {
              (window as any).refreshFileTree();
            }
            
            // Trigger live preview refresh if available
            if ((window as any).refreshLivePreview) {
              (window as any).refreshLivePreview();
            }
          }, 1000);
        }

        // Check for continuous work patterns - if agent wants to continue working
        const shouldContinueWorking = (
          responseText.includes('CONTINUING WORK') ||
          responseText.includes('NEXT STEP') ||
          responseText.includes('Let me also') ||
          responseText.includes('I\'ll continue') ||
          responseText.includes('Now I need to') ||
          responseText.includes('IMMEDIATE ACTION') ||
          responseText.includes('PROGRESS UPDATE') ||
          // Agent-specific continuous work patterns
          (agentId === 'zara' && responseText.includes('```')) || // Zara continues after code changes
          (agentId === 'aria' && responseText.includes('design')) || // Aria continues with design iterations
          (agentId === 'rachel' && responseText.includes('copy')) || // Rachel continues with copywriting
          (agentId === 'ava' && responseText.includes('workflow')) || // Ava continues with automation
          (agentId === 'quinn' && responseText.includes('testing')) || // Quinn continues with QA
          (agentId === 'sophia' && responseText.includes('social')) || // Sophia continues with social media
          (agentId === 'martha' && responseText.includes('marketing')) || // Martha continues with marketing
          (agentId === 'diana' && responseText.includes('strategy')) || // Diana continues with strategy
          (agentId === 'wilma' && responseText.includes('optimization')) // Wilma continues with workflows
        );

        // Auto-continue working if agent indicates more work needed
        if (shouldContinueWorking && !responseText.includes('COMPLETION REPORT')) {
          setTimeout(() => {
            sendMessageToAgent(agentId, `Continue with your next step. Work continuously like Replit agents until the task is complete.`);
          }, 2000); // Brief pause to let user see progress
        }

        // Auto-apply changes based on agent type
        if (agentId === 'aria') {
          // Look for CSS injection patterns
          const cssMatch = responseText.match(/```css\n([\s\S]*?)\n```/);
          if (cssMatch) {
            console.log('🎨 Aria provided CSS changes:', cssMatch[1]);
            injectChangesToLivePreview(cssMatch[1]);
          }
          
          // Look for HTML/component changes
          const htmlMatch = responseText.match(/```html\n([\s\S]*?)\n```/);
          if (htmlMatch) {
            console.log('🏗️ Aria provided HTML changes:', htmlMatch[1]);
          }
          
          // Check for file creation JSON response
          if (responseText.includes('```json') && responseText.includes('file_creation')) {
            console.log('📁 Aria provided file creation JSON - files should be created automatically');
            toast({
              title: 'Aria is creating files!',
              description: 'New components are being added to the codebase',
            });
          }
        }

        // Check if server responded with filesCreated array - immediate dev preview update
        if (data.filesCreated && data.filesCreated.length > 0) {
          console.log('✅ Files successfully created:', data.filesCreated);
          
          // Immediate refresh of dev preview to show new files
          if (iframeRef.current) {
            // Add cache-busting parameter to ensure fresh reload
            const currentSrc = iframeRef.current.src;
            const separator = currentSrc.includes('?') ? '&' : '?';
            iframeRef.current.src = `${currentSrc}${separator}_refresh=${Date.now()}`;
          }
          
          // Show success notification
          toast({
            title: `${data.agentName} created files!`,
            description: `Check dev preview - files are live! Say "approve" to hand off to next agent.`,
          });
        }

        // Elena workflow execution handling
        if (agentId === 'elena') {
          const userMessage = chatMessages[chatMessages.length - 2]?.content?.toLowerCase();
          if (userMessage?.includes('execute workflow') || userMessage?.includes('run workflow')) {
            // Find the most recent workflow message
            const workflowMessage = [...chatMessages].reverse().find(msg => msg.isWorkflowMessage && msg.workflowId);
            if (workflowMessage && workflowMessage.workflowId) {
              executeWorkflow(workflowMessage.workflowId);
            }
          }
        }

        // Check for approval and handoff signals in USER messages (when Sandra says "approve")
        const userApproval = chatMessages[chatMessages.length - 2]?.content?.toLowerCase().includes('approve');
        if (userApproval && agentId === 'aria') {
          console.log('Sandra approved design - handing off to Zara for implementation');
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
      if (error.name === 'AbortError') {
        console.log('Agent request aborted by user');
      } else {
        toast({
          title: 'Error',
          description: `Failed to send message to ${agents.find(a => a.id === agentId)?.name}`,
          variant: 'destructive',
        });
      }
    } finally {
      setAgentController(null);
      setIsLoading(false);
      setActiveWorkingAgent(null); // Stop pulsating indicator
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

  // Execute workflow created by Elena
  const executeWorkflow = async (workflowId: string) => {
    try {
      setWorkflowActive(true);
      
      const progressMessage: ChatMessage = {
        type: 'agent',
        content: `**Workflow Execution Started**\n\nExecuting workflow with live progress monitoring. You will see each agent complete their tasks in real-time.`,
        timestamp: new Date(),
        agentName: 'elena',
        workflowStage: 'Execution',
        isWorkflowMessage: true
      };
      
      setChatMessages(prev => [...prev, progressMessage]);

      const response = await fetch('/api/admin/elena/execute-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          workflowId,
          adminToken: 'sandra-admin-2025'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Workflow Started',
          description: 'Live progress monitoring activated. Check dev preview for updates.',
        });
        
        // Start polling for workflow progress
        startWorkflowProgressMonitoring(workflowId);
      }
    } catch (error) {
      console.error('Workflow execution error:', error);
      toast({
        title: 'Execution Failed',
        description: 'Could not start workflow execution.',
        variant: 'destructive',
      });
    }
  };

  // Monitor workflow progress in real-time
  const startWorkflowProgressMonitoring = (workflowId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/elena/workflow-progress/${workflowId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminToken: 'sandra-admin-2025' })
        });
        const data = await response.json();
        
        if (data.success && data.progress) {
          const progressUpdate: ChatMessage = {
            type: 'agent',
            content: `**Progress Update: Step ${data.progress.currentStep}/${data.progress.totalSteps}**\n\n${data.progress.currentAgent ? `Current: ${data.progress.currentAgent}` : ''}\n\n**Completed:**\n${data.progress.completedTasks.map((task: string) => `• ${task}`).join('\n')}\n\n**Next:**\n${data.progress.nextActions.map((action: string) => `• ${action}`).join('\n')}`,
            timestamp: new Date(),
            agentName: 'elena',
            workflowStage: 'Execution',
            workflowProgress: data.progress,
            isWorkflowMessage: true
          };
          
          setChatMessages(prev => [...prev, progressUpdate]);
          
          // Stop monitoring when workflow is complete
          if (data.progress.status === 'completed' || data.progress.status === 'failed') {
            clearInterval(interval);
            setWorkflowActive(false);
          }
        }
      } catch (error) {
        console.error('Progress monitoring error:', error);
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds
  };

  // Start workflow from beginning
  const startWorkflow = (initialRequest: string) => {
    setWorkflowActive(true);
    setCurrentAgent(agents[0]);
    setWorkflowStage(agents[0].workflowStage);
    
    const workflowMessage: ChatMessage = {
      type: 'agent',
      content: `**Design Studio Workflow Started**\n\nStarting with ${agents[0].name} for ${agents[0].workflowStage}...`,
      timestamp: new Date(),
      isHandoff: true,
      workflowStage: 'Strategy'
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
      <PanelGroup direction="horizontal">
        {/* Chat Panel - Resizable */}
        <Panel defaultSize={33} minSize={25} maxSize={50}>
          <div className="h-full border-r border-gray-200 bg-white flex flex-col">
        <div 
          ref={chatPanelRef}
          className={`flex-1 flex flex-col min-h-0 ${isDragOver ? 'bg-blue-50 border-blue-300' : ''}`}
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
              {activeWorkingAgent ? (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border border-blue-300 px-1 py-0 animate-pulse">
                  {agents.find(a => a.id === activeWorkingAgent)?.name} Working...
                </Badge>
              ) : workflowActive && (
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
                    agent.id === activeWorkingAgent
                      ? 'bg-blue-500 animate-pulse' // Pulsating blue for working agent
                      : agent.id === currentAgent.id
                      ? 'bg-black'
                      : agents.findIndex(a => a.id === currentAgent.id) > index
                      ? 'bg-gray-400'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions & Workflow Starters - Minimal Popup */}
          {!workflowActive && (
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs font-medium text-gray-600">Quick Actions</div>
              <QuickActionsPopup
                isLoading={isLoading}
                onStartWorkflow={startWorkflow}
                onQuickCommand={(command) => {
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
                onGenerateImages={generateImagesWithVictoria}
                quickCommands={quickCommands}
              />
            </div>
          )}
        </div>

        {/* Tabs for Chat, Gallery, Flatlay Library, File Tree, and Editor */}
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value);
            // Track active tab for file watching
            (window as any).activeFileTab = value;
          }} 
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="flex w-full mx-1 md:mx-2 mt-1 md:mt-2 h-9 bg-gray-100 rounded-md p-1">
            <TabsTrigger value="chat" className="flex-1 text-xs h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Chat</TabsTrigger>
            <TabsTrigger value="threads" className="flex-1 text-xs h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Threads</TabsTrigger>
            <TabsTrigger value="elena" className="flex-1 text-xs h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm bg-black text-white">Elena</TabsTrigger>
            <TabsTrigger value="gallery" className="flex-1 text-xs h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Gallery</TabsTrigger>
            <TabsTrigger value="flatlays" className="flex-1 text-xs h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Flatlays</TabsTrigger>
            <TabsTrigger value="files" className="flex-1 text-xs h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Files</TabsTrigger>
            <TabsTrigger value="editor" className="flex-1 text-xs h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Editor</TabsTrigger>
            <TabsTrigger value="ai+" className="flex-1 text-xs h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">AI+</TabsTrigger>
            <TabsTrigger value="workspace" className="flex-1 text-xs h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Workspace</TabsTrigger>
          </TabsList>

          {/* Conversation Threading Tab */}
          <TabsContent value="threads" className="flex-1 flex flex-col mt-0 min-h-0">
            <ConversationThread 
              agentId={currentAgent.id}
              conversations={chatMessages}
              onLoadConversation={(conversation) => {
                setChatMessages(conversation.messages || []);
                setActiveTab('chat');
              }}
              onDeleteConversation={() => {
                // Refresh conversation list
              }}
            />
          </TabsContent>

          {/* Elena Coordination Tab */}
          <TabsContent value="elena" className="flex-1 flex flex-col mt-0 min-h-0">
            <ElenaCoordinationPanel 
              onAgentSelect={(agentId) => {
                setCurrentAgent(agents.find(a => a.id === agentId) || agents[0]);
                setActiveTab('chat');
              }}
              currentWorkflow={workflowActive ? 'Admin Dashboard Enhancement' : undefined}
            />
          </TabsContent>

          <TabsContent value="chat" className="flex flex-col">
            {/* Minimal Chat Controls - Subtle Icon */}
            <div className="flex justify-end px-2 py-1 flex-shrink-0">
              <AgentChatControls
                isLoading={isLoading}
                onStop={handleStopAgent}
                onPause={handlePauseAgent}
                onRollback={handleRollbackAgent}
                canRollback={chatMessages.length > 0}
              />
            </div>
            
            {/* Chat Messages - Flexible Container with proper height calculation */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-1 md:p-2 space-y-1 md:space-y-2 min-h-0">
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
                    <div className="ml-2 bg-black text-white p-2 rounded-lg text-sm relative">
                      <MessageInteraction
                        messageId={`user-${index}`}
                        content={message.content}
                        type="user"
                        timestamp={message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)}
                        isEditable={true}
                        onEdit={(newContent) => {
                          const updatedMessages = [...chatMessages];
                          updatedMessages[index].content = newContent;
                          setChatMessages(updatedMessages);
                        }}
                        onBranch={(messageId) => {
                          // Create new conversation branch from this message
                          console.log('Branching from message:', messageId);
                        }}
                        onReply={(content) => {
                          setMessageInput(`Regarding "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}" - `);
                        }}
                      />
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-60 mt-1">
                        {message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString() : new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : message.isHandoff ? (
                    <div className="mx-1 bg-blue-50 border border-blue-200 text-blue-900 p-2 rounded-lg text-sm">
                      <CollapsibleCodeBlock content={message.content} />
                    </div>
                  ) : (
                    <div className="mr-2 relative">
                      <MessageInteraction
                        messageId={`agent-${index}`}
                        content={message.content}
                        type="agent"
                        agentName={agent?.name}
                        timestamp={message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)}
                        onRegenerate={() => {
                          // Regenerate agent response
                          const lastUserMessage = chatMessages[index - 1];
                          if (lastUserMessage?.type === 'user') {
                            sendMessage(lastUserMessage.content);
                          }
                        }}
                        onBranch={(messageId) => {
                          console.log('Branching from agent message:', messageId);
                        }}
                        onReply={(content) => {
                          setMessageInput(`Following up on: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}" - `);
                        }}
                      />
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

            {/* Enhanced Chat Input - Category 2 Implementation */}
            <div className="px-1 py-1 border-t border-gray-200 flex-shrink-0 bg-white">
              <EnhancedInput
                value={messageInput}
                onChange={setMessageInput}
                onSend={sendMessage}
                onFileUpload={handleFileUpload}
                placeholder={`Ask ${currentAgent.name} for ${currentAgent.workflowStage.toLowerCase()} help or upload inspiration images...`}
                agentName={currentAgent.name}
                isLoading={isLoading}
                disabled={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="flex flex-col">
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
            <div className="flex-1 overflow-y-auto p-4">
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

          <TabsContent value="flatlays" className="flex flex-col">
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

            {/* Flatlay Collections - Using Workspace Data for Pro Members */}
            <div className="flex-1 overflow-y-auto">
              {workspaceFlatlayCollections.map((collection) => (
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
                              onError={(e) => {
                                // Fallback for broken images
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">Image not found</div>';
                                }
                              }}
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

          <TabsContent value="files" className="flex flex-col">
            {/* Files Header */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-sm">Files</h4>
              <p className="text-xs text-gray-600 mt-1">Select files from the Files tab to edit them here</p>
            </div>
            
            {/* File Tree Explorer */}
            <div className="flex-1 overflow-y-auto">
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
            </div>
          </TabsContent>

          <TabsContent value="editor" className="flex flex-col">
            {/* Editor Header with Category 3 Features */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Enhanced Code Editor
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">Category 3: Code Intelligence & Syntax Features</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  AI-Powered
                </Badge>
              </div>
            </div>
            
            {/* Code Intelligence Demo */}
            <div className="p-4 space-y-4">
              <CodeIntelligence
                content={`// Enhanced Code Intelligence Demo - Category 3 Features
// Try typing to see auto-completion, syntax highlighting, and error detection

interface AgentConfig {
  name: string;
  role: string;
  capabilities: string[];
  isActive: boolean;
}

function create${currentAgent.name}Agent(config: AgentConfig): AgentConfig {
  return {
    ...config,
    isActive: true,
    capabilities: [
      'conversation_threading',
      'enhanced_input',
      'code_intelligence',
      'syntax_highlighting'
    ]
  };
}

// Type here to test auto-completion (try 'interface', 'function', 'const')
`}
                language="typescript"
                onChange={(code) => {
                  // Add code changes to chat context
                  console.log('Code Intelligence: Code updated', code.length, 'characters');
                }}
                onLanguageChange={(lang) => {
                  console.log('Code Intelligence: Language changed to', lang);
                }}
                showLineNumbers={true}
                enableAutoComplete={true}
                enableErrorDetection={true}
                readOnly={false}
              />
            </div>
            
            {/* Multi Tab Editor */}
            <div className="flex-1 min-h-0">
              <MultiTabEditor 
              selectedAgent={currentAgent.id}
              onFileChange={(filePath, content) => {
                toast({
                  title: 'File Updated',
                  description: `${filePath} changes saved`,
                });
                
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
            </div>
          </TabsContent>

          <TabsContent value="enhancements" className="flex flex-col">
            {/* Enhancements Header */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-sm">Agent Enhancement System</h4>
              <p className="text-xs text-gray-600 mt-1">Advanced capabilities and collaboration framework for all 9 agents</p>
            </div>
            
            {/* Enhancement Dashboard */}
            <div className="flex-1 overflow-y-auto">
              <AgentEnhancementDashboard />
            </div>
          </TabsContent>

          <TabsContent value="ai+" className="flex flex-col">
            {/* AI+ Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    AI+ Code Intelligence
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">Category 3: Advanced code features & intelligent assistance</p>
                </div>
                <Badge variant="secondary" className="text-xs bg-black text-white">
                  Category 3/10
                </Badge>
              </div>
            </div>
            
            {/* AI+ Features Demo */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Code Intelligence */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Live Code Intelligence</h5>
                <CodeEditor
                  initialCode={`// Category 3: Code Intelligence Features Demo
// This editor includes all Replit AI agent parity features:

interface ${currentAgent.name}Capabilities {
  // ✓ Auto-completion
  syntaxHighlighting: boolean;
  errorDetection: boolean;
  codeFormatting: boolean;
  
  // ✓ Multi-language support
  supportedLanguages: ('typescript' | 'javascript' | 'css' | 'html')[];
  
  // ✓ Smart features
  codeFolding: boolean;
  lineNumbers: boolean;
}

// Try typing to see auto-completion in action
const ${currentAgent.id}Config: ${currentAgent.name}Capabilities = {
  syntaxHighlighting: true,
  errorDetection: true,
  codeFormatting: true,
  supportedLanguages: ['typescript', 'javascript', 'css', 'html'],
  codeFolding: true,
  lineNumbers: true
};

// Test error detection (remove the semicolon to see)
console.log('AI+ Code Intelligence is working!');`}
                  initialLanguage="typescript"
                  onCodeChange={(code) => console.log('AI+ Code changed:', code.length, 'chars')}
                  readOnly={false}
                  showFormatting={true}
                  showPreview={true}
                />
              </div>

              {/* Syntax Highlighter Demo */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Enhanced Syntax Highlighting</h5>
                <EnhancedSyntaxHighlighter
                  code={`// Professional syntax highlighting with Replit-style features
function createAgent(name: string, role: string) {
  return {
    id: name.toLowerCase(),
    name,
    role,
    capabilities: [
      'conversation_threading',
      'enhanced_input', 
      'code_intelligence'
    ],
    isActive: true
  };
}

// CSS styling example
const styles = {
  container: 'flex items-center space-x-2',
  button: 'bg-black text-white px-4 py-2 rounded',
  badge: 'text-xs bg-gray-100 text-gray-800'
};`}
                  language="typescript"
                  fileName="agent-example.ts"
                  showLineNumbers={true}
                  collapsible={true}
                  showCopyButton={true}
                  showDownloadButton={true}
                />
              </div>

              {/* Category 3 Progress */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-medium mb-3">Category 3 Implementation Status</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>✓ Syntax Highlighting</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>✓ Code Completion</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>✓ Multi-language Support</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>✓ Code Formatting</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>✓ Error Detection</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>✓ Code Folding</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                  <strong>Next:</strong> Category 4 features will focus on advanced file management, project organization, and workspace intelligence.
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workspace" className="flex flex-col">
            {/* Workspace Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Workspace Intelligence
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">Category 4: Advanced file management & project organization</p>
                </div>
                <Badge variant="secondary" className="text-xs bg-black text-white">
                  Category 4/10
                </Badge>
              </div>
            </div>
            
            {/* Workspace Features */}
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="files" className="flex flex-col h-full">
                <TabsList className="w-full mx-2 mt-2 h-8 bg-gray-100 rounded-md p-1">
                  <TabsTrigger value="files" className="flex-1 text-xs h-6 rounded-sm">File Manager</TabsTrigger>
                  <TabsTrigger value="project" className="flex-1 text-xs h-6 rounded-sm">Project Org</TabsTrigger>
                  <TabsTrigger value="intelligence" className="flex-1 text-xs h-6 rounded-sm">AI Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="files" className="flex-1 mt-2 mx-2">
                  <FileManagement
                    onFileSelect={(file) => {
                      console.log('File selected:', file.path);
                      toast({
                        title: 'File Selected',
                        description: `${file.name} - ${file.path}`,
                      });
                    }}
                    onFolderSelect={(folder) => {
                      console.log('Folder selected:', folder.path);
                    }}
                    showPreview={true}
                    allowMultiSelect={true}
                  />
                </TabsContent>

                <TabsContent value="project" className="flex-1 mt-2 mx-2">
                  <ProjectOrganization
                    onNavigateToFile={(path) => {
                      console.log('Navigate to file:', path);
                      toast({
                        title: 'Navigate to File',
                        description: path,
                      });
                    }}
                  />
                </TabsContent>

                <TabsContent value="intelligence" className="flex-1 mt-2 mx-2">
                  <WorkspaceIntelligence
                    onApplyInsight={(insightId) => {
                      console.log('Apply insight:', insightId);
                      toast({
                        title: 'Insight Applied',
                        description: 'AI recommendation has been implemented',
                      });
                    }}
                    onRefreshMetrics={() => {
                      console.log('Refreshing metrics...');
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
        </div>
          </div>
        </Panel>
        
        {/* Resize Handle */}
        <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center">
          <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
        </PanelResizeHandle>
        
        {/* Preview Panel - Resizable */}
        <Panel defaultSize={67} minSize={50}>
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
                const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit.dev');
                if (isProduction) {
                  // In production, open in new window to avoid cross-origin issues
                  window.open('/', '_blank', 'width=1200,height=800');
                } else {
                  // In development, refresh iframe or open new window
                  if (iframeRef.current) {
                    const currentSrc = iframeRef.current.src.split('?')[0];
                    iframeRef.current.src = currentSrc + '?refresh=' + Date.now();
                  } else {
                    window.open('http://localhost:5000', '_blank');
                  }
                }
              }}
            >
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="border-black text-black hover:bg-black hover:text-white">
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-black text-black hover:bg-black hover:text-white"
              onClick={() => window.open('/', '_blank')}
            >
              Open Preview
            </Button>
            <Button variant="default" size="sm" className="bg-black text-white hover:bg-gray-800">
              Deploy
            </Button>
          </div>
        </div>

            {/* Universal Live Preview - Works in all environments */}
            <div className="flex-1 relative">
              <iframe
                id="live-preview-iframe"
                ref={iframeRef}
                src={window.location.origin}
                className="w-full h-full border-0"
                title="Live Preview"
                sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation"
                onLoad={() => {
                  console.log('Live preview loaded successfully');
                  // Expose refresh function globally for auto-refresh
                  (window as any).refreshLivePreview = () => {
                    if (iframeRef.current) {
                      const currentSrc = iframeRef.current.src.split('?')[0];
                      iframeRef.current.src = currentSrc + '?refresh=' + Date.now();
                      console.log('🔄 Live preview auto-refreshed');
                    }
                  };
                }}
                onError={(e) => {
                  console.error('Live preview error:', e);
                }}
              />
            </div>
            
            {/* Properties Panel - Conditional */}
            {showPropertiesPanel && (
              <div className="w-1/3 h-full border-l border-gray-200 bg-white flex flex-col overflow-y-auto">
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
            )}
          </div>
        </Panel>
      </PanelGroup>
      
      {/* File Creation Confirmation System */}
      <FileCreationConfirmation onFileSelect={handleFileSelect} />
    </div>
  );
}