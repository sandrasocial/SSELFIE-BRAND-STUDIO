import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Switch } from '@/components/ui/switch';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
import AgentBridgeToggle from '@/components/admin/AgentBridgeToggle';
import LuxuryProgressDisplay from '@/components/admin/LuxuryProgressDisplay';
import { useAgentBridge } from '@/hooks/use-agent-bridge';

// Agent images - same as admin dashboard
import AgentElena from '@assets/out-0 (33)_1753426218039.png';
import AgentMaya from '@assets/out-0 (34)_1753426218040.png';
import AgentVictoria from '@assets/out-0 (37)_1753426218041.png';
import AgentAria from '@assets/out-0 (20)_1753426218042.png';
import AgentZara from '@assets/out-0 (28)_1753426218042.png';
import AgentRachel from '@assets/out-0 (42)_1753426218042.png';
import AgentAva from '@assets/out-1 (27)_1753426218043.png';
import AgentQuinn from '@assets/out-0 (26)_1753426218043.png';
import AgentSophia from '@assets/out-1 (18)_1753426218043.png';
import AgentMartha from '@assets/out-0 (29)_1753426218044.png';
import AgentDiana from '@assets/out-2 (18)_1753426218045.png';
import AgentWilma from '@assets/out-0 (22)_1753426218045.png';
import AgentOlga from '@assets/out-0 (32)_1753426290403.png';

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
}

// Claude API functions
const sendClaudeMessage = async (agentName: string, message: string, conversationId: string, fileEditMode: boolean = false) => {
  const response = await fetch('/api/claude/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      agentName,
      message,
      conversationId,
      fileEditMode,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Failed to send message');
  }

  return response.json();
};

const createClaudeConversation = async (agentName: string) => {
  const response = await fetch('/api/claude/conversation/new', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ agentName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Failed to create conversation');
  }

  return response.json();
};

const loadConversationHistory = async (conversationId: string) => {
  try {
    console.log('📜 Frontend: Loading history for conversation:', conversationId);
    const response = await fetch(`/api/claude/conversation/${conversationId}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('📜 Frontend: History API failed:', response.status);
      const error = await response.json();
      throw new Error(error.details || 'Failed to load conversation history');
    }

    const data = await response.json();
    console.log('📜 Frontend: History API returned:', {
      success: data.success,
      messageCount: data.messages?.length || 0,
      hasMessages: !!data.messages && data.messages.length > 0
    });
    
    return data;
  } catch (error) {
    console.error('📜 Frontend: Load history error:', error);
    return {
      success: false,
      messages: [],
      conversationId
    };
  }
};

const clearConversation = async (agentName: string) => {
  const response = await fetch('/api/claude/conversation/clear', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ agentName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Failed to clear conversation');
  }

  return response.json();
};

// Tool result formatting functions
const formatToolResults = (content: string): string[] => {
  const tools: string[] = [];
  if (content.includes('[Codebase Search Results]')) tools.push('search_filesystem');
  if (content.includes('[File Operation:')) tools.push('str_replace_based_edit_tool');
  if (content.includes('[Command Execution]')) tools.push('bash');
  if (content.includes('[Web Search Results]')) tools.push('web_search');
  return tools;
};

// Clean message content - remove raw tool outputs for professional display
const cleanMessageContent = (content: string): string => {
  // First, preserve the original content for debugging
  console.log('🔍 Original agent response length:', content.length);
  console.log('🔍 Original response preview:', content.substring(0, 200));
  
  let cleaned = content
    .replace(/\n\n\[Codebase Search Results\][^]*?(?=\n\n|\n$|$)/g, '')
    .replace(/\n\n\[File Operation:[^]*?(?=\n\n|\n$|$)/g, '')
    .replace(/\n\n\[Command Execution\][^]*?(?=\n\n|\n$|$)/g, '')
    .replace(/\n\n\[Web Search Results\][^]*?(?=\n\n|\n$|$)/g, '')
    .replace(/\n\n\[.*?\][^]*?(?=\n\n|\n$|$)/g, '')
    .trim();
  
  console.log('🔍 Cleaned response length:', cleaned.length);
  console.log('🔍 Cleaned response preview:', cleaned.substring(0, 200));
  
  // Return the cleaned content regardless of length - don't replace with generic message
  return cleaned || content; // Fallback to original if cleaning went wrong
};

export default function AdminConsultingAgents() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [selectedAgent, setSelectedAgent] = useState<ConsultingAgent | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [fileEditMode, setFileEditMode] = useState(false);
  
  // Bridge System State
  const [bridgeEnabled, setBridgeEnabled] = useState(false);
  const { submitTask, isSubmitting, activeTasks, getHealth } = useAgentBridge();

  // Define agents with matching admin dashboard data
  const consultingAgents: ConsultingAgent[] = [
    {
      id: 'elena',
      name: 'Elena',
      role: 'Strategic Business Advisor',
      specialty: 'AI Agent Director & CEO who orchestrates all agents and provides strategic business coordination.',
      image: AgentElena
    },
    {
      id: 'aria',
      name: 'Aria',
      role: 'Visual Design Expert',
      specialty: 'Luxury editorial designer who maintains brand consistency and creates ultra WOW factor moments.',
      image: AgentAria
    },
    {
      id: 'zara',
      name: 'Zara',
      role: 'Technical Architecture',
      specialty: 'Technical mastermind who transforms vision into flawless code with luxury performance standards.',
      image: AgentZara
    },
    {
      id: 'maya',
      name: 'Maya',
      role: 'AI Photography Expert',
      specialty: 'Celebrity stylist and AI photographer who creates magazine-quality editorial concepts.',
      image: AgentMaya
    },
    {
      id: 'victoria',
      name: 'Victoria',
      role: 'UX Strategy Consultant',
      specialty: 'Website building expert who optimizes user experience and conversion rates.',
      image: AgentVictoria
    },
    {
      id: 'rachel',
      name: 'Rachel',
      role: 'Voice & Copywriting',
      specialty: 'Sandra\'s copywriting best friend who writes exactly like her authentic voice.',
      image: AgentRachel
    },
    {
      id: 'ava',
      name: 'Ava',
      role: 'Automation & Workflow Strategy',
      specialty: 'Invisible empire architect who makes everything run smoothly with Swiss-watch precision.',
      image: AgentAva
    },
    {
      id: 'quinn',
      name: 'Quinn',
      role: 'Quality Assurance & Luxury Standards',
      specialty: 'Luxury quality guardian with perfectionist attention to detail for $50,000 luxury suite standards.',
      image: AgentQuinn
    },
    {
      id: 'sophia',
      name: 'Sophia',
      role: 'Social Media Strategy & Community Growth',
      specialty: 'Elite Social Media Manager AI helping Sandra grow from 81K to 1M followers by 2026.',
      image: AgentSophia
    },
    {
      id: 'martha',
      name: 'Martha',
      role: 'Marketing & Performance Ads',
      specialty: 'Performance marketing expert who runs ads and finds opportunities while maintaining brand authenticity.',
      image: AgentMartha
    },
    {
      id: 'diana',
      name: 'Diana',
      role: 'Business Coaching & Strategic Mentoring',
      specialty: 'Sandra\'s strategic advisor and team director who provides business coaching and decision-making guidance.',
      image: AgentDiana
    },
    {
      id: 'wilma',
      name: 'Wilma',
      role: 'Workflow Architecture & Process Optimization',
      specialty: 'Workflow architect who designs efficient business processes and creates automation blueprints.',
      image: AgentWilma
    },
    {
      id: 'olga',
      name: 'Olga',
      role: 'Repository Organization & Architecture Analysis',
      specialty: 'Safe repository organization and cleanup specialist who never breaks anything.',
      image: AgentOlga
    }
  ];

  // Auto-select agent from URL parameter and load conversation history
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const agentParam = urlParams.get('agent');
    
    if (agentParam && !selectedAgent) {
      const targetAgent = consultingAgents.find(agent => agent.id === agentParam);
      if (targetAgent) {
        setSelectedAgent(targetAgent);
      }
    }
  }, [location, selectedAgent, consultingAgents]);

  // Load conversation history when agent is selected
  useEffect(() => {
    if (selectedAgent && !conversationId) {
      console.log('🔄 Loading conversation history for agent:', selectedAgent.id);
      loadAgentConversationHistory();
    }
  }, [selectedAgent]);

  // Clear messages when switching agents to prevent cross-contamination
  useEffect(() => {
    if (selectedAgent) {
      console.log('🔄 Clearing messages for agent switch:', selectedAgent.id);
      setMessages([]);
      setConversationId(null);
    }
  }, [selectedAgent?.id]);

  const loadAgentConversationHistory = async () => {
    if (!selectedAgent) return;

    setIsLoadingHistory(true);
    try {
      console.log('🔄 Loading conversation history for agent:', selectedAgent.id);
      
      // For Elena specifically, load ALL conversations from the last 24 hours
      if (selectedAgent.id === 'elena') {
        console.log('📜 ELENA: Loading ALL conversations from last 24 hours');
        
        // Get all Elena conversations from last 24 hours
        const existingConversations = await fetch('/api/claude/conversations/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ agentName: 'elena' })
        });

        if (existingConversations.ok) {
          const conversationList = await existingConversations.json();
          console.log('📜 ELENA: Found existing conversations:', conversationList.conversations?.length || 0);
          
          // Filter conversations from last 24 hours
          const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const recentConversations = conversationList.conversations?.filter((conv: any) => 
            new Date(conv.updatedAt || conv.createdAt) >= last24Hours
          ) || [];
          
          console.log('📜 ELENA: Found', recentConversations.length, 'conversations from last 24 hours');
          
          if (recentConversations.length > 0) {
            // Combine messages from ALL recent conversations
            let allMessages: ChatMessage[] = [];
            
            for (const conversation of recentConversations) {
              console.log('📜 ELENA: Loading conversation:', conversation.id, 'with', conversation.messageCount, 'messages');
              
              // Use the database ID directly for history loading
              const history = await loadConversationHistory(conversation.id.toString());
              if (history.messages && history.messages.length > 0) {
                const conversationMessages: ChatMessage[] = history.messages.map((msg: any, index: number) => ({
                  id: `${conversation.id}-${msg.timestamp || Date.now()}-${index}`,
                  type: msg.role === 'user' ? 'user' : 'agent',
                  content: msg.content,
                  timestamp: msg.timestamp || new Date().toISOString(),
                  agentName: msg.role === 'assistant' ? selectedAgent.name : undefined,
                }));
                
                allMessages = [...allMessages, ...conversationMessages];
              }
            }
            
            // Sort all messages by timestamp
            allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            
            console.log('📜 ELENA: Successfully loaded', allMessages.length, 'total messages from last 24 hours');
            
            // Use the most recent conversation ID for new messages
            setConversationId(recentConversations[0].id);
            setMessages(allMessages);
            setIsLoadingHistory(false);
            return;
          }
        }
      }
      
      // Fallback: Create new conversation for any agent or if Elena has no existing conversations
      console.log('🔄 Creating new conversation for agent:', selectedAgent.id);
      const conversation = await createClaudeConversation(selectedAgent.id);
      console.log('📞 Got conversation:', conversation.conversationId);
      setConversationId(conversation.conversationId);

      // Load existing messages if any
      try {
        console.log('📜 Attempting to load history for:', conversation.conversationId);
        const history = await loadConversationHistory(conversation.conversationId);
        console.log('📜 Raw history response:', history);
        
        if (history.messages && history.messages.length > 0) {
          console.log('📜 Loading conversation history:', history.messages.length, 'messages');
          
          const chatMessages: ChatMessage[] = history.messages.map((msg: any, index: number) => ({
            id: `${msg.timestamp || Date.now()}-${index}`,
            type: msg.role === 'user' ? 'user' : 'agent',
            content: msg.content,
            timestamp: msg.timestamp || new Date().toISOString(),
            agentName: msg.role === 'assistant' ? selectedAgent.name : undefined,
          }));
          
          setMessages(chatMessages);
        } else {
          console.log('📜 No messages found in history');
          setMessages([]);
        }
      } catch (historyError) {
        console.log('📜 Error loading conversation history:', historyError);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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

  const sendMessage = async () => {
    if (!selectedAgent || !message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Check if Agent Bridge is enabled for this agent
      if (bridgeEnabled) {
        // Use Agent Bridge for implementation
        console.log('🌉 Using Agent Bridge for:', selectedAgent.id);
        
        const bridgeResult = await submitTask(
          selectedAgent.id,
          userMessage.content,
          'high',
          {
            conversationContext: messages.map(m => m.content),
            completionCriteria: [
              'Implementation complete',
              'TypeScript compilation passes', 
              'Luxury design standards met'
            ],
            qualityGates: [
              'luxury_standards',
              'performance_optimized',
              'mobile_responsive'
            ]
          }
        );

        if (bridgeResult.success) {
          const bridgeMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'agent',
            content: `✨ **Bridge Implementation Started**\n\nI've submitted your request to the Agent Bridge System for immediate implementation. You can monitor the progress in the luxury progress display.\n\n**Task ID**: ${bridgeResult.taskId}\n**Status**: Processing with luxury validation standards\n\nI'll continue our conversation while the implementation runs in the background.`,
            timestamp: new Date().toISOString(),
            agentName: selectedAgent.name
          };
          
          setMessages(prev => [...prev, bridgeMessage]);
          setIsLoading(false);
          return;
        } else {
          // Fall back to regular chat if bridge fails
          console.error('🌉 Bridge submission failed:', bridgeResult.error);
        }
      }

      // Regular consulting chat flow
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const conversation = await createClaudeConversation(selectedAgent.id);
        currentConversationId = conversation.conversationId;
        setConversationId(currentConversationId);
      }

      if (!currentConversationId) {
        throw new Error('Failed to create conversation');
      }
      
      const response = await fetch('/api/claude/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          agentName: selectedAgent.id,
          message: userMessage.content,
          conversationId: currentConversationId,
          fileEditMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Claude API Error (${response.status}): ${errorData.error || 'Service temporarily unavailable'}`);
      }

      const { response: agentResponse } = await response.json();
      
      console.log('📨 Received agent response length:', agentResponse?.length || 0);
      
      // Extract tool results and clean content for professional display
      const toolsUsed = formatToolResults(agentResponse);
      const cleanedContent = cleanMessageContent(agentResponse);
      
      console.log('📨 Agent response after cleaning length:', cleanedContent?.length || 0);

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: cleanedContent,
        timestamp: new Date().toISOString(),
        agentName: selectedAgent.name
      };

      console.log('💾 Saving agent message to frontend state:', {
        agentName: selectedAgent.name,
        contentLength: cleanedContent?.length || 0,
        contentPreview: cleanedContent?.substring(0, 100) + '...'
      });

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Claude API error:', error);
      
      // Enhanced error handling with specific troubleshooting guidance
      let errorContent = `⚠️ **Service Temporarily Unavailable**\n\n`;
      
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          errorContent += `The Claude AI service is experiencing internal server errors (500). This is typically a temporary issue with Anthropic's servers.\n\n**Next Steps:**\n- Wait 30-60 seconds and try again\n- Check Anthropic's status page for service updates\n- This is not a configuration issue on your end`;
        } else if (error.message.includes('429')) {
          errorContent += `Rate limit reached. Please wait a moment before sending another message.`;
        } else if (error.message.includes('401')) {
          errorContent += `Authentication issue. Please verify your ANTHROPIC_API_KEY is properly configured.`;
        } else {
          errorContent += `Connection error: ${error.message}`;
        }
      } else {
        errorContent += `Unexpected error occurred. Please try again in a moment.`;
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: errorContent,
        timestamp: new Date().toISOString(),
        agentName: selectedAgent.name
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedAgent) return;

    try {
      await clearConversation(selectedAgent.id);
      setMessages([]);
      setConversationId(null);
      // Reload conversation to get fresh ID
      await loadAgentConversationHistory();
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
              <Switch
                id="edit-mode"
                checked={fileEditMode}
                onCheckedChange={setFileEditMode}
                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/30"
              />
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
                  onClick={() => setSelectedAgent(agent)}
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
                      <div className="font-serif text-lg font-light uppercase tracking-wide">
                        {agent.name}
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
                    
                    {/* Agent Bridge Toggle */}
                    <div className="mb-4">
                      <AgentBridgeToggle
                        enabled={bridgeEnabled}
                        onToggle={setBridgeEnabled}
                        agentName={selectedAgent.name}
                      />
                    </div>

                    {/* Chat Management Controls */}
                    <div className="flex items-center gap-3">
                      {isLoadingHistory && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                          <div className="w-3 h-3 border border-gray-400 border-t-black rounded-full animate-spin"></div>
                          Loading Memory
                        </div>
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
                <div className="flex-1 overflow-y-auto space-y-6 mb-6">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 font-light italic">
                        Start a conversation with {selectedAgent.name} for strategic analysis
                      </p>
                    </div>
                  )}
                  
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${
                        msg.type === 'user' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-50 text-black border border-gray-200'
                      } p-4 rounded-sm`}>
                        {msg.type === 'agent' && (
                          <div className="text-xs uppercase tracking-wide opacity-70 mb-2">
                            {msg.agentName}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap font-light leading-relaxed">
                          {msg.content}
                        </div>
                        <div className="text-xs opacity-50 mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm">
                        <div className="text-xs uppercase tracking-wide opacity-70 mb-2">
                          {selectedAgent.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex gap-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Ask ${selectedAgent.name} for strategic analysis...`}
                      className="flex-1 resize-none border border-gray-300 rounded-sm p-4 font-light leading-relaxed focus:outline-none focus:border-black transition-colors"
                      rows={3}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !message.trim()}
                      className="px-8 py-4 bg-black text-white font-light uppercase tracking-wide hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {bridgeEnabled ? 'Chat & Implement' : 'Send'}
                    </button>
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

      {/* Active Bridge Tasks Progress Display */}
      {activeTasks.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-4">
          {activeTasks.map((task) => (
            <LuxuryProgressDisplay
              key={task.id}
              taskId={task.id}
              agentName={task.agentName}
              steps={task.steps}
              overallProgress={task.progress}
              status={task.status}
            />
          ))}
        </div>
      )}

      <GlobalFooter />
    </div>
  );
}