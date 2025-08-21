import React, { KeyboardEvent, memo, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
// Switch component removed - creating simple alternative
import { MemberNavigation } from '../components/member-navigation';
import { GlobalFooter } from '../components/global-footer';
// Removed Bridge System - Using only main consulting chat
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../components/ui/button';

// Agent images - TRULY unique images for each agent (no duplicates)
const AgentElena = "/attached_assets/out-0%20(20)_1753426218042.png";    // Strategic Leader
const AgentMaya = "/attached_assets/out-0%20(22)_1753426218045.png";     // Brand Expert  
const AgentVictoria = "/attached_assets/out-0%20(26)_1753426218043.png"; // Content Strategist
const AgentAria = "/attached_assets/out-0%20(28)_1753426218042.png";     // Business Operations
const AgentZara = "/attached_assets/out-0%20(29)_1753426218044.png";     // Technical Architect
const AgentRachel = "/attached_assets/out-0%20(32)_1753426290403.png";   // Marketing Strategist
const AgentAva = "/attached_assets/out-0%20(33)_1753426218039.png";      // QA Testing
const AgentQuinn = "/attached_assets/out-0%20(34)_1753426218040.png";    // Workflow Coordinator
const AgentSophia = "/attached_assets/out-0%20(37)_1753426218041.png";   // Social Media Expert
const AgentMartha = "/attached_assets/out-0%20(42)_1753426218042.png";   // Process Enhancement
const AgentDiana = "/attached_assets/out-1%20(18)_1753426218043.png";    // Analytics Specialist
const AgentWilma = "/attached_assets/out-1%20(27)_1753426218043.png";    // Documentation Expert
const AgentOlga = "/attached_assets/out-2%20(18)_1753426218045.png";     // Revenue Operations
const AgentFlux = "/attached_assets/out-2%20(23)_1753426218044.png";     // Image Generation

// OPTIMIZED CHAT MESSAGE COMPONENT - Prevents unnecessary re-renders
const OptimizedChatMessage = memo(({ message }: { message: ChatMessage }) => {
  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] p-6 ${
        message.type === 'user' 
          ? 'bg-black text-white ml-4 shadow-sm' 
          : 'bg-white text-black mr-4 border border-gray-100 shadow-sm'
      }`}>
        {message.type === 'agent' && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-500">
              {message.agentName}
            </span>
            {/* Elegant Tool Usage Indicators */}
            {formatToolResults(message.content).length > 0 && (
              <div className="flex items-center gap-2">
                {formatToolResults(message.content).map(tool => (
                  <span key={tool} className="inline-flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      {tool === 'str_replace_based_edit_tool' ? 'Files' :
                       tool === 'search_filesystem' ? 'Search' :
                       tool === 'bash' ? 'Execute' :
                       tool === 'web_search' ? 'Research' : tool}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="text-sm leading-relaxed">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({children}) => <h1 className="text-lg font-semibold mb-3 text-black" style={{ fontFamily: 'Times New Roman, serif' }}>{children}</h1>,
              h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-black" style={{ fontFamily: 'Times New Roman, serif' }}>{children}</h2>,
              h3: ({children}) => <h3 className="text-sm font-semibold mb-2 text-black" style={{ fontFamily: 'Times New Roman, serif' }}>{children}</h3>,
              strong: ({children}) => <strong className="font-semibold text-black">{children}</strong>,
              em: ({children}) => <em className="italic text-gray-700">{children}</em>,
              p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
              ul: ({children}) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
              li: ({children}) => <li className="text-sm">{children}</li>,
              blockquote: ({children}) => <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 mb-3">{children}</blockquote>,
              code: ({children, className}) => {
                const isInline = !className;
                return isInline 
                  ? <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-black">{children}</code>
                  : <code className="block bg-gray-50 p-4 rounded text-xs font-mono text-black whitespace-pre-wrap overflow-x-auto">{children}</code>;
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
});

interface ConsultingAgent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  image: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: string;
  agentName?: string;
  streaming?: boolean;
  fileOperations?: FileOperation[];
  toolsUsed?: string[];
  completionSummary?: CompletionSummaryLegacy;
}

interface FileOperation {
  type: 'create' | 'modify' | 'delete' | 'search';
  path: string;
  status: 'in-progress' | 'completed' | 'error';
  description?: string;
}

interface CompletionSummaryLegacy {
  filesModified: number;
  toolsUsed: string[];
  executionTime: number;
  status: 'success' | 'partial' | 'error';
}

interface Conversation {
  id: number;
  conversationId: string;
  agentName: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Streaming interfaces for professional Replit-like experience
interface StreamingChunk {
  type: 'text' | 'tool_use' | 'file_operation' | 'completion_summary';
  content: string;
  toolName?: string;
  fileName?: string;
  operation?: 'view' | 'edit' | 'create' | 'search';
  timestamp?: number;
}

interface ToolIndicator {
  name: string;
  icon: string;
  active: boolean;
  fileName?: string;
}

const createClaudeConversation = async (agentName: string) => {
  // Generate unique conversation ID for agent
  const conversationId = `admin_${agentName}_${Date.now()}`;
  
  // Return immediately - conversation will be created on first message
  return {
    success: true,
    conversationId,
    agentName
  };
};

const loadConversationHistory = async (agentName: string) => {
  try {
    console.log(`📜 Loading conversation history for: ${agentName}`);
    
    const response = await fetch(`/api/consulting-agents/admin/agents/conversation-history/${agentName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'sandra-admin-2025'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load conversation history: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`📜 Loaded ${data.messages?.length || 0} messages from conversation history`);
    
    return {
      success: true,
      messages: data.messages || [],
      conversations: data.conversations || [],
      currentConversationId: data.currentConversationId,
      agentName
    };
  } catch (error) {
    console.error('📜 Error loading conversation history:', error);
    return {
      success: false,
      messages: [],
      conversations: [],
      currentConversationId: null,
      agentName
    };
  }
};

const listAgentConversations = async (agentName: string, limit = 10) => {
  // Use same endpoint as loadConversationHistory for consistency
  const result = await loadConversationHistory(agentName);
  return {
    success: result.success,
    conversations: result.conversations || [],
    agentName
  };
};

const clearConversation = async (agentName: string) => {
  // Simplified: Clear local state, agent memory handled by backend
  return {
    success: true,
    agentName
  };
};

// Tool detection for agent responses - simplified and accurate
const formatToolResults = (content: string): string[] => {
  const tools: string[] = [];
  
  // Look for actual tool usage patterns in Claude responses
  if (content.includes('str_replace_based_edit_tool') || content.includes('File Operation') || content.includes('created') || content.includes('modified')) {
    tools.push('Files');
  }
  if (content.includes('search_filesystem') || content.includes('searching') || content.includes('found')) {
    tools.push('Search');
  }
  if (content.includes('bash') || content.includes('command') || content.includes('executed')) {
    tools.push('Terminal');
  }
  if (content.includes('web_search') || content.includes('research')) {
    tools.push('Research');
  }
  
  return tools;
};

export default function AdminConsultingAgents() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [selectedAgent, setSelectedAgent] = useState<ConsultingAgent | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [fileEditMode, setFileEditMode] = useState(true);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Using only main consulting chat system - Bridge system removed

  // Define agents with CORRECT technical specialties - restored from backup
  const consultingAgents: ConsultingAgent[] = [
    {
      id: 'elena',
      name: 'Elena',
      role: 'Database Architecture Expert',
      specialty: 'Database optimization, schema design, query performance',
      image: '/attached_assets/out-0%20(20)_1753426218042.png'
    },
    {
      id: 'aria',
      name: 'Aria',
      role: 'System Health & Performance Expert',
      specialty: 'Performance monitoring, optimization, system health',
      image: '/attached_assets/out-0%20(28)_1753426218046.png'
    },
    {
      id: 'zara',
      name: 'Zara',
      role: 'Technical Architect & UI/UX Expert',
      specialty: 'System architecture, full-stack implementation, UI/UX',
      image: '/attached_assets/out-0%20(29)_1753426218047.png'
    },
    {
      id: 'maya',
      name: 'Maya',
      role: 'AI Integration Specialist',
      specialty: 'AI models, machine learning, intelligent features',
      image: '/attached_assets/out-0%20(22)_1753426218045.png'
    },
    {
      id: 'victoria',
      name: 'Victoria',
      role: 'Business Process Automation Expert',
      specialty: 'Workflow automation, business logic, process optimization',
      image: '/attached_assets/out-0%20(26)_1753426218046.png'
    },
    {
      id: 'rachel',
      name: 'Rachel',
      role: 'Requirements Analysis Expert',
      specialty: 'User stories, specifications, feature analysis',
      image: '/attached_assets/out-0%20(32)_1753426218048.png'
    },
    {
      id: 'ava',
      name: 'Ava',
      role: 'Analytics & Insights Expert',
      specialty: 'Data analysis, metrics, insights',
      image: '/attached_assets/out-0%20(33)_1753426218048.png'
    },
    {
      id: 'quinn',
      name: 'Quinn',
      role: 'Security & Compliance Expert',
      specialty: 'Security audits, compliance, risk management',
      image: '/attached_assets/out-0%20(34)_1753426218049.png'
    },
    {
      id: 'sophia',
      name: 'Sophia',
      role: 'Social Media & Content Expert',
      specialty: 'Content strategy, social media, engagement',
      image: '/attached_assets/out-0%20(37)_1753426218050.png'
    },
    {
      id: 'martha',
      name: 'Martha',
      role: 'User Experience Research Expert',
      specialty: 'User research, feedback analysis, UX optimization',
      image: '/attached_assets/out-0%20(42)_1753426218052.png'
    },
    {
      id: 'diana',
      name: 'Diana',
      role: 'DevOps & Deployment Expert',
      specialty: 'CI/CD, deployment, infrastructure',
      image: '/attached_assets/out-1%20(18)_1753426219061.png'
    },
    {
      id: 'wilma',
      name: 'Wilma',
      role: 'Documentation & Knowledge Expert',
      specialty: 'Technical writing, documentation, knowledge base',
      image: '/attached_assets/out-1%20(27)_1753426219064.png'
    },
    {
      id: 'olga',
      name: 'Olga',
      role: 'Quality Assurance Expert',
      specialty: 'Testing, validation, quality control',
      image: '/attached_assets/out-2%20(18)_1753426220072.png'
    },
    {
      id: 'flux',
      name: 'Flux',
      role: 'Integration & API Expert',
      specialty: 'API design, integrations, data flow',
      image: '/attached_assets/out-2%20(23)_1753426220074.png'
    }
  ];

  // Auto-select agent from URL parameter or localStorage and load conversation history
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const agentParam = urlParams.get('agent');
    
    if (agentParam && !selectedAgent) {
      const targetAgent = consultingAgents.find(agent => agent.id === agentParam);
      if (targetAgent) {
        setSelectedAgent(targetAgent);
        localStorage.setItem('selectedAgentId', targetAgent.id);
      }
    } else if (!selectedAgent && !agentParam) {
      // Restore selected agent from localStorage on page refresh
      const savedAgentId = localStorage.getItem('selectedAgentId');
      if (savedAgentId) {
        const targetAgent = consultingAgents.find(agent => agent.id === savedAgentId);
        if (targetAgent) {
          console.log(`📜 RESTORING: Selected agent ${targetAgent.name} from localStorage`);
          setSelectedAgent(targetAgent);
        }
      }
    }
  }, [location, selectedAgent, consultingAgents]);

  // Unified conversation loading - uses same endpoint as manual selection
  useEffect(() => {
    if (!selectedAgent) return;
    
    const loadHistory = async () => {
      try {
        console.log(`📜 PAGE REFRESH: Loading conversation history for ${selectedAgent.name}`);
        const historyResult = await loadConversationHistory(selectedAgent.id);
        
        if (historyResult.success && historyResult.messages.length > 0) {
          console.log(`📜 PAGE REFRESH: Loaded ${historyResult.messages.length} previous messages`);
          setMessages(historyResult.messages);
          setConversationId(historyResult.currentConversationId);
        } else {
          console.log(`📜 PAGE REFRESH: No previous conversation found, starting fresh`);
          setMessages([]);
          setConversationId(null);
        }
      } catch (error) {
        console.error('PAGE REFRESH: Failed to load conversation history:', error);
        setMessages([]);
        setConversationId(null);
      }
    };

    loadHistory();
  }, [selectedAgent?.id]);

  // Check if user is Sandra (admin access required)
  if (!user || (user.email !== 'ssa@ssasocial.com' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Admin Access Required
          </h1>
          <p className="text-gray-400">Only Sandra can access consulting agents.</p>
        </div>
      </div>
    );
  }

  // Streaming agent communication with real-time updates
  const sendMessage = async () => {
    if (!selectedAgent || !message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Create streaming agent message
    const agentMessageId = Date.now().toString() + '-agent';
    const streamingAgentMessage: ChatMessage = {
      id: agentMessageId,
      type: 'agent',
      content: '',
      timestamp: new Date().toISOString(),
      agentName: selectedAgent.name,
      streaming: true,
      toolsUsed: []
    };

    setMessages(prev => [...prev, streamingAgentMessage]);

    try {
      // Create abort controller for this request
      const controller = new AbortController();
      setAbortController(controller);
      
      // Use existing conversation ID or create new one if none exists
      const finalConversationId = conversationId || `admin_${selectedAgent.id}_${Date.now()}`;
      
      // Update conversation ID if it was newly created
      if (!conversationId) {
        setConversationId(finalConversationId);
      }
      
      // FIXED: Proper Server-Sent Events implementation with enhanced error handling
      const response = await fetch('/api/consulting-agents/admin/consulting-chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Authorization': 'Bearer sandra-admin-2025'
        },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: userMessage.content,
          conversationId: finalConversationId,
          fileEditMode: fileEditMode,
          adminToken: 'sandra-admin-2025'
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent communication failed: ${response.status}`);
      }

      // FIXED: Proper streaming response handling with better buffer management
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // ENHANCED: Better chunk processing with buffer management
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // Keep last incomplete line in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonData = line.slice(6).trim();
                  if (jsonData === '') continue; // Skip empty data lines
                  
                  const data = JSON.parse(jsonData);
                  console.log('📡 STREAMING:', data.type, data);
                  
                  // ENHANCED: Better handling of different stream events
                  switch (data.type) {
                    case 'message_start':
                      setMessages(prev => prev.map(msg => 
                        msg.id === agentMessageId 
                          ? { ...msg, content: `${data.agentName || selectedAgent.name}: ${data.message || ''}\n\n` }
                          : msg
                      ));
                      break;
                      
                    case 'text_delta':
                      setMessages(prev => prev.map(msg => 
                        msg.id === agentMessageId 
                          ? { ...msg, content: msg.content + (data.content || '') }
                          : msg
                      ));
                      break;
                      
                    case 'tool_start':
                      setMessages(prev => prev.map(msg => 
                        msg.id === agentMessageId 
                          ? { 
                              ...msg, 
                              content: msg.content + `\n\n🔧 Using ${data.toolName}...`,
                              toolsUsed: [...(msg.toolsUsed || []), data.toolName]
                            }
                          : msg
                      ));
                      break;
                      
                    case 'continuing':
                      setMessages(prev => prev.map(msg => 
                        msg.id === agentMessageId 
                          ? { 
                              ...msg, 
                              content: msg.content + `\n\n🔄 ${data.message}`
                            }
                          : msg
                      ));
                      break;
                      
                    case 'tool_complete':
                      setMessages(prev => prev.map(msg => 
                        msg.id === agentMessageId 
                          ? { 
                              ...msg, 
                              content: msg.content + ` ✅ ${data.message}\n\n`
                            }
                          : msg
                      ));
                      break;
                      
                    case 'completion':
                      setMessages(prev => prev.map(msg => 
                        msg.id === agentMessageId 
                          ? { ...msg, streaming: false }
                          : msg
                      ));
                      setIsLoading(false);
                      console.log(`✅ Agent ${selectedAgent.name} streaming completed`);
                      break;
                      
                    case 'error':
                    case 'stream_error':
                      setMessages(prev => prev.map(msg => 
                        msg.id === agentMessageId 
                          ? { 
                              ...msg, 
                              content: msg.content + `\n\n❌ **Error:** ${data.message}`,
                              streaming: false 
                            }
                          : msg
                      ));
                      setIsLoading(false);
                      break;
                }
              } catch (parseError) {
                console.error('Error parsing stream data:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      // Handle abort differently from other errors
      if ((error as Error).name === 'AbortError') {
        console.log('🛑 Request aborted by user');
        setMessages(prev => prev.map(msg => 
          msg.id === agentMessageId 
            ? { 
                ...msg, 
                content: msg.content + '\n\n⚠️ **Agent stopped by user**',
                streaming: false 
              }
            : msg
        ));
      } else {
        console.error('Agent communication error:', error);
        setMessages(prev => prev.map(msg => 
          msg.id === agentMessageId 
            ? { 
                ...msg, 
                content: msg.content + `\n\n❌ **Communication Error:** ${error instanceof Error ? error.message : 'Unknown error'}`,
                streaming: false 
              }
            : msg
        ));
      }
    } finally {
      setIsLoading(false);
      setAbortController(null); // Clean up controller
    }
  };
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleClearChat = async () => {
    if (!selectedAgent) return;

    try {
      await clearConversation(selectedAgent.id);
      setMessages([]);
      setConversationId(null);
      // Create fresh conversation ID
      const newConversationId = `admin_${selectedAgent.id}_${Date.now()}`;
      setConversationId(newConversationId);
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    }
  };

  const handleNewChat = async () => {
    if (!selectedAgent) return;

    // Reset frontend state
    setMessages([]);
    setConversationId(null);
    
    // Create a completely new conversation
    try {
      const conversation = await createClaudeConversation(selectedAgent.id);
      setConversationId(conversation.conversationId);
    } catch (error) {
      console.error('Failed to create new conversation:', error);
    }
  };

  // Simple loading state management
  const stopAgent = () => {
    console.log('🛑 STOP AGENT: User requested stop');
    
    // Abort the current streaming request
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      console.log('✅ STOP AGENT: Request aborted');
    }
    
    // Update any streaming message to show it was stopped
    setMessages(prev => prev.map(msg => 
      msg.streaming 
        ? { 
            ...msg, 
            content: msg.content + '\n\n⚠️ **Agent stopped by user**',
            streaming: false 
          }
        : msg
    ));
    
    // Clean up loading state
    setIsLoading(false);
    console.log('✅ STOP AGENT: Cleanup complete');
  };

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/images/42585527/tracker_376_img_1_1753351123712.png"
            alt="Consulting Command Center"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-8">
          <div className="text-xs tracking-[0.4em] uppercase opacity-70 mb-6">
            Strategic Advisory Council
          </div>
          
          <h1 className="font-serif text-[clamp(3rem,8vw,8rem)] leading-[0.8] font-light uppercase tracking-wide mb-6">
            Consulting Agents
          </h1>
          
          <p className="text-lg max-w-2xl mx-auto opacity-80 font-light leading-relaxed">
            Your specialized advisory council. Each agent analyzes your codebase and provides strategic insights 
            with precise instructions for Replit AI implementation.
          </p>
          
          {/* Mode Toggle */}
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-4 bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3">
              <span className="text-sm text-white/90 font-light tracking-wide" style={{ fontFamily: 'Times New Roman, serif' }}>
                READ ONLY
              </span>
              <button
                onClick={() => setFileEditMode(!fileEditMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 ${fileEditMode ? 'bg-white' : 'bg-white/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition ${fileEditMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-white/90 font-light tracking-wide" style={{ fontFamily: 'Times New Roman, serif' }}>
                FILE EDIT
              </span>
            </div>
          </div>
          
          {/* Mode Status Banner */}
          <div className="mt-6 max-w-3xl mx-auto">
            <div className={`border ${fileEditMode ? 'border-white/40 bg-white/10' : 'border-white/30 bg-white/5'} backdrop-blur-sm py-3 px-6`}>
              <p className="text-sm text-white/90 text-center font-light tracking-wide" style={{ fontFamily: 'Times New Roman, serif' }}>
                {fileEditMode ? (
                  <>MODE: FILE EDIT - AGENTS CAN CREATE, MODIFY, AND UPDATE FILES DIRECTLY</>
                ) : (
                  <>MODE: READ ONLY - AGENTS PROVIDE ANALYSIS AND INSTRUCTIONS WITHOUT FILE MODIFICATION</>
                )}
              </p>
            </div>
          </div>

        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Agent Selection Panel */}
          <div>
            <div className="mb-12">
              <h2 className="font-serif text-[2.5rem] leading-none font-light uppercase tracking-wider text-black mb-4">
                Select Agent
              </h2>
              <div className="w-24 h-px bg-black mb-8"></div>
              <p className="text-lg text-gray-600 font-light leading-relaxed">
                Choose your strategic advisor for comprehensive codebase analysis and actionable recommendations.
              </p>
            </div>

            {/* Agent Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {consultingAgents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={async () => {
                    setSelectedAgent(agent);
                    // Save selected agent to localStorage for persistence
                    localStorage.setItem('selectedAgentId', agent.id);
                    
                    // Load conversation history when agent is selected
                    try {
                      console.log(`📜 MANUAL SELECTION: Loading conversation history for ${agent.name}`);
                      const historyResult = await loadConversationHistory(agent.id);
                      
                      if (historyResult.success && historyResult.messages.length > 0) {
                        console.log(`📜 MANUAL SELECTION: Loaded ${historyResult.messages.length} previous messages`);
                        setMessages(historyResult.messages);
                        setConversationId(historyResult.currentConversationId);
                      } else {
                        console.log(`📜 MANUAL SELECTION: No previous conversation found, starting fresh`);
                        setMessages([]);
                        setConversationId(null);
                      }
                    } catch (error) {
                      console.error('MANUAL SELECTION: Failed to load conversation history:', error);
                      setMessages([]);
                      setConversationId(null);
                    }
                  }}
                  className={`relative group cursor-pointer transition-all duration-300 aspect-square overflow-hidden ${
                    selectedAgent?.id === agent.id 
                      ? 'ring-2 ring-black' 
                      : 'hover:scale-[1.02]'
                  }`}
                >
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                  />
                  

                  
                  <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    selectedAgent?.id === agent.id ? 'bg-opacity-30' : 'bg-opacity-50 group-hover:bg-opacity-30'
                  }`}>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="text-xs tracking-[0.2em] uppercase opacity-70 mb-1">
                        {agent.role}
                      </div>
                      <div className="font-serif text-lg font-light uppercase tracking-wide mb-2">
                        {agent.name}
                      </div>
                      <div className="text-xs text-white/90 leading-tight">
                        {agent.specialty}
                      </div>
                    </div>
                  </div>
                  
                  {selectedAgent?.id === agent.id && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex flex-col h-[600px]">
            {selectedAgent ? (
              <>
                {/* Chat Header with Management Controls */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedAgent.image}
                        alt={selectedAgent.name}
                        className="w-16 h-16 object-cover rounded-sm"
                      />
                      <div>
                        <h3 className="font-serif text-2xl font-light uppercase tracking-wide text-black">
                          {selectedAgent.name}
                        </h3>
                        <p className="text-sm text-gray-600 uppercase tracking-wide">
                          {selectedAgent.role}
                        </p>
                      </div>
                    </div>
                    
                    {/* Bridge system removed for streamlined chat */}

                    {/* Chat Management Controls */}
                    <div className="flex items-center gap-3">
                      {/* STOP AGENT: Show during loading */}
                      {isLoading && (
                        <button
                          onClick={stopAgent}
                          className="px-3 py-1 text-xs font-light text-red-600 hover:text-red-700 border border-red-300 hover:border-red-500 transition-colors uppercase tracking-wider"
                          title="Stop agent execution"
                        >
                          Stop Agent
                        </button>
                      )}
                      {messages.length > 0 && !isLoading && (
                        <>
                          <button
                            onClick={handleClearChat}
                            className="px-3 py-1 text-xs font-light text-gray-600 hover:text-black border border-gray-300 hover:border-black transition-colors uppercase tracking-wider"
                            title="Clear conversation (agent memory preserved)"
                          >
                            Clear
                          </button>
                          <button
                            onClick={handleNewChat}
                            className="px-3 py-1 text-xs font-light text-white bg-black hover:bg-gray-800 transition-colors uppercase tracking-wider"
                            title="Start fresh conversation"
                          >
                            New Chat
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-8 mb-6 px-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-6 ${
                        msg.type === 'user' 
                          ? 'bg-black text-white ml-4 shadow-sm' 
                          : 'bg-white text-black mr-4 border border-gray-100 shadow-sm'
                      }`}>
                        {msg.type === 'agent' && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs uppercase tracking-wide text-gray-500">
                              {msg.agentName}
                            </span>
                            {/* Elegant Tool Usage Indicators */}
                            {formatToolResults(msg.content).length > 0 && (
                              <div className="flex items-center gap-2">
                                {formatToolResults(msg.content).map(tool => (
                                  <span key={tool} className="inline-flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                                      {tool === 'str_replace_based_edit_tool' ? 'Files' :
                                       tool === 'search_filesystem' ? 'Search' :
                                       tool === 'bash' ? 'Execute' :
                                       tool === 'web_search' ? 'Research' : tool}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-sm leading-relaxed">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({children}) => <h1 className="text-lg font-semibold mb-3 text-black" style={{ fontFamily: 'Times New Roman, serif' }}>{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-black" style={{ fontFamily: 'Times New Roman, serif' }}>{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-semibold mb-2 text-black" style={{ fontFamily: 'Times New Roman, serif' }}>{children}</h3>,
                              strong: ({children}) => <strong className="font-semibold text-black">{children}</strong>,
                              em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                              p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
                              ul: ({children}) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                              li: ({children}) => <li className="text-sm">{children}</li>,
                              code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{children}</code>,
                              pre: ({children}) => <pre className="bg-gray-50 p-3 rounded border text-xs font-mono overflow-x-auto mb-3">{children}</pre>,
                              blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3">{children}</blockquote>
                            }}
                          >
                            {msg.content || 'Agent response processed.'}
                          </ReactMarkdown>
                        </div>
                        {msg.timestamp && (
                          <div className="text-xs text-gray-400 mt-4 pt-2 border-t border-gray-100">
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* CONSOLIDATED LOADING: Single loading state managed by streaming messages */}
                  
                  {messages.length === 0 && !isLoading && (
                    <div className="text-center py-16 px-8">
                      <div className="mb-6">
                        <div className="w-12 h-12 rounded-full bg-gray-100 border flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">💭</span>
                        </div>
                        <h3 className="text-lg font-light text-black mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                          Ready for Strategic Consultation
                        </h3>
                        <p className="text-gray-600 text-sm font-light">
                          {selectedAgent.name} is ready to analyze your codebase and provide actionable insights.
                        </p>
                      </div>
                      
                      {/* Quick Suggestion Buttons */}
                      <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {[
                          "Analyze current architecture",
                          "Review recent changes", 
                          "Optimize user experience",
                          "Check for improvements"
                        ].map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setMessage(suggestion)}
                            className="px-3 py-1 text-xs border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all font-light uppercase tracking-wider"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                      <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-light mb-3 text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {selectedAgent?.name} - {selectedAgent?.role}
                        </h3>
                        <p className="text-sm text-gray-500 font-light leading-relaxed mb-6">
                          {selectedAgent?.specialty}
                        </p>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">
                          Start your conversation below
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 pt-6 bg-gray-50">
                  <div className="flex gap-4 p-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Ask ${selectedAgent?.name} for strategic analysis...`}
                      className="flex-1 resize-none border border-gray-200 rounded-sm p-4 font-light leading-relaxed focus:outline-none focus:border-black focus:bg-white transition-none shadow-sm"
                      rows={3}
                      disabled={isLoading}
                      autoComplete="off"
                      spellCheck={false}
                      style={{
                        backgroundColor: 'white',
                        color: 'black'
                      }}
                    />
                    <div className="flex flex-col gap-2">
                      {isLoading && (
                        <button
                          onClick={stopAgent}
                          className="px-6 py-2 border border-red-300 text-red-600 font-light uppercase tracking-wide hover:border-red-500 hover:text-red-700 transition-colors text-xs"
                        >
                          Stop Agent
                        </button>
                      )}
                      <button
                        onClick={sendMessage}
                        disabled={isLoading || !message.trim()}
                        className="px-8 py-4 bg-black text-white font-light uppercase tracking-wide hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="font-serif text-2xl font-light text-gray-400 mb-4">
                    Select an Agent
                  </h3>
                  <p className="text-gray-500 font-light">
                    Choose a consulting agent to begin strategic analysis
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bridge system removed - using streamlined consulting chat only */}

      <GlobalFooter />
    </div>
  );
}

// Add missing export
export default AdminConsultingAgents;