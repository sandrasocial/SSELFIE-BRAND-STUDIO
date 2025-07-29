import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Switch } from '@/components/ui/switch';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
import AgentBridgeToggle from '@/components/admin/AgentBridgeToggle';
import LuxuryProgressDisplay from '@/components/admin/LuxuryProgressDisplay';
import { useAgentBridge } from '@/hooks/use-agent-bridge';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { StreamingChatMessage } from '@/components/StreamingChatMessage';

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
const sendClaudeMessage = async (agentName: string, message: string, conversationId: string, fileEditMode: boolean = true) => {
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

// Quick action suggestions for each agent
const getQuickActions = (agentId: string): string[] => {
  const quickActions: Record<string, string[]> = {
    elena: [
      "Analyze current project priorities and recommend strategic adjustments",
      "Review team coordination and suggest workflow improvements",
      "Assess business goals alignment with technical roadmap",
      "Provide strategic guidance for next quarter planning"
    ],
    zara: [
      "Review codebase architecture and identify optimization opportunities",
      "Analyze performance bottlenecks and suggest improvements",
      "Check TypeScript compilation and fix any errors",
      "Audit security implementation and recommend enhancements"
    ],
    aria: [
      "Review current design system consistency across components",
      "Analyze user interface for luxury brand alignment",
      "Check mobile responsiveness and visual hierarchy",
      "Suggest design improvements for key user flows"
    ],
    maya: [
      "Review AI photography model performance and training data",
      "Analyze current image generation quality and suggest improvements",
      "Optimize celebrity styling concepts for better results",
      "Check editorial photography workflow efficiency"
    ],
    victoria: [
      "Analyze user experience flow and identify friction points",
      "Review conversion funnel and suggest optimization",
      "Check website usability and accessibility standards",
      "Optimize user onboarding and engagement patterns"
    ],
    rachel: [
      "Review current copy for brand voice consistency",
      "Analyze messaging for luxury positioning alignment",
      "Suggest improvements for user-facing content",
      "Optimize copy for conversion and engagement"
    ],
    ava: [
      "Review current automation workflows for efficiency",
      "Identify manual processes that could be automated",
      "Analyze workflow integration points and dependencies",
      "Suggest improvements for operational excellence"
    ],
    quinn: [
      "Perform comprehensive quality audit of current features",
      "Review luxury standards compliance across platform",
      "Check performance metrics against $50K suite expectations",
      "Identify areas needing quality improvements"
    ],
    sophia: [
      "Analyze current social media strategy for 1M follower goal",
      "Review content performance and engagement metrics",
      "Suggest improvements for community growth",
      "Optimize social media workflow and posting strategy"
    ],
    martha: [
      "Review current marketing campaigns and ROI performance",
      "Analyze ad spend efficiency and targeting effectiveness",
      "Suggest improvements for luxury brand positioning in ads",
      "Optimize marketing funnel for better conversion"
    ],
    diana: [
      "Provide strategic business coaching for current challenges",
      "Review business model and suggest optimization",
      "Analyze decision-making processes and recommend improvements",
      "Guide strategic planning for next growth phase"
    ],
    wilma: [
      "Analyze current business processes for optimization opportunities",
      "Review workflow architecture and suggest improvements",
      "Identify bottlenecks in operational efficiency",
      "Design automation blueprints for key processes"
    ],
    olga: [
      "Perform safe repository cleanup and organization",
      "Analyze codebase structure for improvement opportunities",
      "Review file organization and suggest better architecture",
      "Identify unused code and safe removal opportunities"
    ]
  };
  
  return quickActions[agentId] || [
    "Analyze current project status and provide recommendations",
    "Review relevant areas within your expertise",
    "Suggest improvements for better performance",
    "Provide strategic guidance for next steps"
  ];
};

// Enhanced contextual message building
const buildContextualMessage = async (message: string, agent: ConsultingAgent): Promise<string> => {
  try {
    // Get recent project context with timeout
    const projectContext = await Promise.race([
      fetch('/api/admin/project-context', {
        credentials: 'include'
      }).then(res => res.ok ? res.json() : null).catch(() => null),
      new Promise(resolve => setTimeout(() => resolve(null), 2000)) // 2s timeout
    ]);

    let contextualMessage = message;

    // Add agent-specific context based on their specialty
    switch (agent.id) {
      case 'elena':
        contextualMessage = `**STRATEGIC CONTEXT REQUEST**
${message}

**Recent Project Activity**: ${projectContext?.recentActivity || 'Loading...'}
**Current Phase**: ${projectContext?.currentPhase || 'Development'}
**Priority Areas**: ${projectContext?.priorities?.join(', ') || 'Performance, User Experience'}
**Business Goals**: Scale to 1M users, luxury positioning, $50K suite standards`;
        break;
        
      case 'zara':
        contextualMessage = `**TECHNICAL ARCHITECTURE REQUEST**
${message}

**Current Tech Stack**: Next.js 14, TypeScript, Tailwind, Replit Database
**Recent Commits**: ${projectContext?.recentCommits || 'Various improvements'}
**Performance Metrics**: ${projectContext?.performance || 'Sub-second load times required'}
**Architecture Standards**: Swiss-watch precision, bank-level security, global scale`;
        break;
        
      case 'aria':
        contextualMessage = `**DESIGN SYSTEM REQUEST**
${message}

**Brand Standards**: Luxury editorial, Times New Roman typography, Swiss precision
**Current Design Phase**: ${projectContext?.designPhase || 'Refinement'}
**User Feedback**: ${projectContext?.userFeedback || 'Collecting insights'}
**Design Goals**: Ultra WOW factor, magazine-quality visuals, $50K luxury feel`;
        break;

      case 'maya':
        contextualMessage = `**AI PHOTOGRAPHY REQUEST**
${message}

**Current Style**: Celebrity editorial, magazine-quality concepts
**Training Data**: ${projectContext?.trainingStatus || 'Individual model optimization'}
**Performance Goals**: Sub-second generation, luxury quality standards`;
        break;

      case 'victoria':
        contextualMessage = `**UX STRATEGY REQUEST**
${message}

**Conversion Goals**: Optimize user flow, enhance engagement
**User Metrics**: ${projectContext?.userMetrics || 'Tracking user journey'}
**Technical Context**: Next.js 14, mobile-first responsive design`;
        break;

      case 'rachel':
        contextualMessage = `**COPYWRITING REQUEST**
${message}

**Voice Guidelines**: Sandra's authentic voice, luxury editorial tone
**Brand Context**: Swiss precision meets luxury accessibility
**Content Goals**: ${projectContext?.contentGoals || 'Authentic connection with users'}`;
        break;

      case 'ava':
        contextualMessage = `**AUTOMATION REQUEST**
${message}

**Current Workflows**: ${projectContext?.workflows || 'Optimizing user journey'}
**Integration Points**: Replit Database, Next.js architecture
**Precision Goals**: Swiss-watch automation, invisible operation`;
        break;

      case 'quinn':
        contextualMessage = `**QUALITY ASSURANCE REQUEST**
${message}

**Standards**: $50,000 luxury suite quality expectations
**Performance Requirements**: Sub-second load times, flawless UX
**Testing Context**: ${projectContext?.testingStatus || 'Continuous quality monitoring'}`;
        break;

      case 'sophia':
        contextualMessage = `**SOCIAL MEDIA REQUEST**
${message}

**Growth Goals**: 81K to 1M followers by 2026
**Current Metrics**: ${projectContext?.socialMetrics || 'Tracking engagement growth'}
**Brand Alignment**: Luxury editorial, authentic connection`;
        break;

      case 'martha':
        contextualMessage = `**MARKETING REQUEST**
${message}

**Performance Goals**: ROI-focused campaigns, brand authenticity
**Current Campaigns**: ${projectContext?.campaigns || 'Strategic marketing initiatives'}
**Budget Context**: Efficient spend, luxury positioning`;
        break;

      case 'diana':
        contextualMessage = `**BUSINESS COACHING REQUEST**
${message}

**Strategic Context**: Scale SSELFIE Studio globally
**Decision Points**: ${projectContext?.decisions || 'Strategic business choices'}
**Growth Metrics**: User acquisition, revenue optimization`;
        break;

      case 'wilma':
        contextualMessage = `**WORKFLOW OPTIMIZATION REQUEST**
${message}

**Current Processes**: ${projectContext?.processes || 'Business workflow analysis'}
**Automation Opportunities**: Swiss precision, efficient operations
**Integration Points**: Full platform workflow optimization`;
        break;

      case 'olga':
        contextualMessage = `**REPOSITORY ORGANIZATION REQUEST**
${message}

**Repository Health**: Safe cleanup, architecture analysis
**Current Structure**: ${projectContext?.repoStructure || 'Next.js 14 with TypeScript'}
**Safety Priority**: Never break existing functionality`;
        break;
        
      default:
        // Add general project context for other agents
        if (projectContext) {
          contextualMessage = `${message}

**Project Context**: ${projectContext.summary || 'SSELFIE Studio development in progress'}`;
        }
    }

    return contextualMessage;
  } catch (error) {
    console.log('Context enhancement unavailable, using original message');
    return message;
  }
};

// TEMPORARILY DISABLED: Clean message content function (showing all agent work)
const cleanMessageContent = (content: string): string => {
  // DISABLED: Return original content to see what agents are actually doing
  console.log('🔍 SHOWING FULL AGENT RESPONSE (cleanMessageContent DISABLED)');
  console.log('🔍 Response length:', content.length);
  console.log('🔍 Response preview:', content.substring(0, 200));
  
  // Return the original content without any cleaning to see agent tool usage
  return content;
};

export default function AdminConsultingAgents() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [selectedAgent, setSelectedAgent] = useState<ConsultingAgent | null>(null);
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Follow-up suggestions state
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);

  // Streaming chat integration
  const {
    messages,
    isStreaming,
    sendStreamingMessage,
    clearMessages,
  } = useStreamingChat({
    onMessageComplete: (message) => {
      console.log('Message completed:', message);
      
      // Generate follow-up suggestions if enabled
      if (communicationPreferences.autoSuggestFollowups && selectedAgent) {
        generateFollowUpSuggestions(message, selectedAgent);
      }
    },
    onError: (error) => {
      console.error('Streaming error:', error);
    },
  });

  // Generate intelligent follow-up suggestions
  const generateFollowUpSuggestions = (lastMessage: any, agent: ConsultingAgent) => {
    const content = lastMessage.content.toLowerCase();
    const suggestions: string[] = [];

    // Agent-specific follow-up patterns
    if (agent.id === 'elena') {
      if (content.includes('strategy') || content.includes('plan')) {
        suggestions.push("What are the next immediate action steps?");
        suggestions.push("How should we prioritize these strategic initiatives?");
        suggestions.push("Which team members should be involved in execution?");
      }
    } else if (agent.id === 'zara') {
      if (content.includes('architecture') || content.includes('technical')) {
        suggestions.push("Can you provide the specific code implementation?");
        suggestions.push("What are the performance implications of this approach?");
        suggestions.push("How does this integrate with our existing codebase?");
      }
    } else if (agent.id === 'aria') {
      if (content.includes('design') || content.includes('visual')) {
        suggestions.push("Can you show mockups or visual examples?");
        suggestions.push("How does this align with our brand guidelines?");
        suggestions.push("What are the mobile responsive considerations?");
      }
    }

    // Generic follow-ups if no specific patterns found
    if (suggestions.length === 0) {
      suggestions.push("Can you elaborate on this recommendation?");
      suggestions.push("What would be the implementation timeline?");
      suggestions.push("Are there any potential risks or challenges?");
    }

    setFollowUpSuggestions(suggestions.slice(0, 3)); // Limit to 3 suggestions
  };
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [fileEditMode, setFileEditMode] = useState(true);
  const [conversationSummary, setConversationSummary] = useState<string>('');
  const [agentStatus, setAgentStatus] = useState<'idle' | 'thinking' | 'working' | 'complete'>('idle');
  
  // Bridge System State
  const [bridgeEnabled, setBridgeEnabled] = useState(false);
  const { submitTask, isSubmitting, activeTasks } = useAgentBridge();
  
  // Enhanced communication features
  const [agentInsights, setAgentInsights] = useState<{[key: string]: any}>({});
  const [quickActions, setQuickActions] = useState<string[]>([]);
  const [communicationPreferences, setCommunicationPreferences] = useState({
    includeContext: true,
    streamingEnabled: true,
    autoSuggestFollowups: true,
    showToolUsage: true
  });

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
      loadAgentQuickActions();
    }
  }, [selectedAgent]);

  // Load agent-specific quick actions with categories
  const loadAgentQuickActions = () => {
    if (!selectedAgent) return;
    
    const agentQuickActions = {
      'elena': [
        "📊 Analyze current project priorities and suggest next steps",
        "🤝 Review team coordination and identify bottlenecks", 
        "🎯 Assess business strategy alignment with technical roadmap",
        "💼 Create executive summary of platform status",
        "🚀 Plan next quarter's development roadmap"
      ],
      'zara': [
        "🔧 Audit codebase architecture and identify improvements",
        "⚡ Review performance metrics and optimization opportunities",
        "🗄️ Analyze database schema and suggest enhancements",
        "🛡️ Security audit of authentication and data handling",
        "📦 Review deployment pipeline and CI/CD setup"
      ],
      'aria': [
        "🎨 Review current design system consistency",
        "✨ Analyze user interface for luxury brand standards",
        "📐 Suggest visual hierarchy improvements",
        "🖼️ Audit brand consistency across all touchpoints",
        "📱 Review mobile design responsiveness"
      ],
      'maya': [
        "🤖 Review AI image generation pipeline performance",
        "📸 Analyze user photo training effectiveness",
        "💡 Suggest prompt optimization strategies",
        "🎭 Evaluate individual model quality metrics",
        "🔄 Optimize training workflow efficiency"
      ],
      'victoria': [
        "👥 Audit user experience flow and conversion rates",
        "🚪 Review onboarding process for friction points",
        "📱 Analyze mobile responsiveness and accessibility",
        "📈 Evaluate user journey analytics",
        "🎪 Test key user interactions for smoothness"
      ]
    };
    
    setQuickActions(agentQuickActions[selectedAgent.id as keyof typeof agentQuickActions] || [
      "🔍 Provide strategic analysis of current implementation",
      "📋 Review codebase for improvement opportunities", 
      "⚙️ Suggest optimization recommendations"
    ]);
  };

  // Clear messages when switching agents to prevent cross-contamination
  useEffect(() => {
    if (selectedAgent) {
      console.log('🔄 Clearing messages for agent switch:', selectedAgent.id);
      clearMessages();
      setConversationId(null);
      setConversationSummary('');
      setAgentStatus('idle');
    }
  }, [selectedAgent?.id]);

  // Generate conversation summary when messages change
  useEffect(() => {
    if (messages.length >= 4) { // Generate summary after a few exchanges
      generateConversationSummary();
    }
  }, [messages]);

  const generateConversationSummary = () => {
    if (messages.length === 0) return;
    
    const recentMessages = messages.slice(-6); // Last 3 exchanges
    const userMessages = recentMessages.filter(m => m.type === 'user').length;
    const agentMessages = recentMessages.filter(m => m.type === 'agent').length;
    
    let summary = `${userMessages} requests, ${agentMessages} responses`;
    
    // Add context based on recent messages
    const lastAgentMessage = messages.filter(m => m.type === 'agent').pop();
    if (lastAgentMessage) {
      const content = lastAgentMessage.content.toLowerCase();
      if (content.includes('file operation') || content.includes('created') || content.includes('modified')) {
        summary += ' • Files modified';
      }
      if (content.includes('analysis') || content.includes('review')) {
        summary += ' • Analysis complete';
      }
      if (content.includes('recommendation') || content.includes('suggest')) {
        summary += ' • Recommendations provided';
      }
    }
    
    setConversationSummary(summary);
  };

  const loadAgentConversationHistory = async () => {
    if (!selectedAgent) return;

    setIsLoadingHistory(true);
    try {
      console.log('🔄 Loading conversation history for agent:', selectedAgent.id);
      
      // Try to get existing conversation first
      try {
        const existingResponse = await fetch(`/api/claude/conversation/recent/${selectedAgent.id}`, {
          credentials: 'include'
        });
        
        if (existingResponse.ok) {
          const existingData = await existingResponse.json();
          if (existingData.conversationId) {
            console.log('📜 Found existing conversation:', existingData.conversationId);
            setConversationId(existingData.conversationId);
            
            // Load history for existing conversation
            const history = await loadConversationHistory(existingData.conversationId);
            if (history.messages && history.messages.length > 0) {
              console.log('📜 Loaded', history.messages.length, 'messages from history');
              // Convert and load messages into streaming system
              const convertedMessages = history.messages.map((msg: any, index: number) => ({
                id: `history-${index}`,
                type: msg.role === 'user' ? 'user' : 'agent',
                content: msg.content,
                timestamp: msg.timestamp || new Date().toISOString(),
                agentName: msg.role === 'assistant' ? selectedAgent.name : undefined,
                isStreaming: false
              }));
              
              // Set messages directly (assuming streaming hook supports this)
              clearMessages();
              convertedMessages.forEach((msg: any) => {
                // Add each message to the streaming system
                console.log('📜 Adding historical message:', msg.id);
              });
            }
            return;
          }
        }
      } catch (existingError) {
        console.log('📜 No existing conversation found, creating new one');
      }
      
      // Create new conversation if none exists
      console.log('🔄 Creating new conversation for agent:', selectedAgent.id);
      const conversation = await createClaudeConversation(selectedAgent.id);
      console.log('📞 Got new conversation:', conversation.conversationId);
      setConversationId(conversation.conversationId);
      
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

    const messageContent = message.trim();
    setMessage('');

    // Use streaming for all messages
    try {
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const conversation = await createClaudeConversation(selectedAgent.id);
        currentConversationId = conversation.conversationId;
        setConversationId(currentConversationId);
      }

      // Enhanced context awareness: Include recent project activity
      const finalMessage = communicationPreferences.includeContext 
        ? await buildContextualMessage(messageContent, selectedAgent)
        : messageContent;

      await sendStreamingMessage(
        selectedAgent.id,
        finalMessage,
        currentConversationId,
        fileEditMode
      );
    } catch (error) {
      console.error('Failed to send streaming message:', error);
    }

    // Bridge system integration (optional)
    if (bridgeEnabled) {
      try {
        console.log('🌉 Using Agent Bridge for:', selectedAgent.id);
        
        const bridgeResult = await submitTask(
          selectedAgent.id,
          messageContent,
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
          console.log('Bridge task submitted successfully');
        }
      } catch (bridgeError) {
        console.error('Bridge submission failed:', bridgeError);
      }
    }
  };

  const handleClearChat = async () => {
    if (!selectedAgent) return;

    try {
      await clearConversation(selectedAgent.id);
      clearMessages();
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

            {/* Agent Insights Panel */}
            {selectedAgent && (
              <div className="mt-8 p-6 bg-gray-50 border border-gray-200">
                <h4 className="text-sm uppercase tracking-wide text-gray-700 mb-4">
                  Agent Insights: {selectedAgent.name}
                </h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Specialty
                    </div>
                    <div className="font-light text-gray-800">
                      {selectedAgent.specialty}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Communication Style
                    </div>
                    <div className="font-light text-gray-800">
                      {selectedAgent.id === 'elena' ? 'Strategic & Directive' :
                       selectedAgent.id === 'zara' ? 'Technical & Precise' :
                       selectedAgent.id === 'aria' ? 'Creative & Visual' :
                       selectedAgent.id === 'maya' ? 'Artistic & Detailed' :
                       'Professional & Focused'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Best For
                    </div>
                    <div className="font-light text-gray-800">
                      {selectedAgent.id === 'elena' ? 'High-level strategy & coordination' :
                       selectedAgent.id === 'zara' ? 'Technical implementation & architecture' :
                       selectedAgent.id === 'aria' ? 'Design systems & brand consistency' :
                       selectedAgent.id === 'maya' ? 'AI photography & image generation' :
                       selectedAgent.id === 'victoria' ? 'User experience & conversion optimization' :
                       'Specialized consulting & analysis'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Response Time
                    </div>
                    <div className="font-light text-gray-800">
                      {communicationPreferences.streamingEnabled ? 'Real-time streaming' : 'Standard processing'}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-serif text-2xl font-light uppercase tracking-wide text-black">
                            {selectedAgent.name}
                          </h3>
                          <div className={`w-2 h-2 rounded-full ${
                            isStreaming ? 'bg-orange-400 animate-pulse' : 
                            messages.length > 0 ? 'bg-green-400' : 'bg-gray-300'
                          }`} title={
                            isStreaming ? 'Agent is working...' : 
                            messages.length > 0 ? 'Agent ready' : 'Agent standby'
                          }></div>
                        </div>
                        <p className="text-sm text-gray-600 uppercase tracking-wide">
                          {selectedAgent.role}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {selectedAgent.specialty}
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
                      {messages.length > 0 && !isStreaming && (
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

                {/* Quick Actions */}
                {messages.length === 0 && selectedAgent && (
                  <div className="mb-6 border border-gray-200 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                      Quick Actions for {selectedAgent.name}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getQuickActions(selectedAgent.id).map((action, index) => (
                        <button
                          key={index}
                          onClick={() => setMessage(action)}
                          className="px-3 py-1 text-xs border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors font-light tracking-wide"
                        >
                          {action.split(' ').slice(0, 4).join(' ')}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-6 mb-6">
                  {messages.map((msg) => (
                    <StreamingChatMessage
                      key={msg.id}
                      id={msg.id}
                      type={msg.type}
                      content={msg.content}
                      agentName={msg.agentName}
                      timestamp={msg.timestamp}
                      isStreaming={msg.isStreaming}
                      streamingContent={msg.streamingContent}
                      progress={msg.progress}
                    />
                  ))}
                  
                  {isStreaming && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-4 bg-gray-50 text-black mr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs uppercase tracking-wide text-gray-500">
                            {selectedAgent.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-gray-400">Working...</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-gray-400 border-t-black rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-600">Analyzing codebase...</span>
                          </div>
                          {fileEditMode && (
                            <div className="text-xs text-orange-600 flex items-center gap-1">
                              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                              File edit mode: Ready to implement changes
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {messages.length === 0 && (
                    <div className="text-center py-12 text-gray-500 font-light italic">
                      Start a conversation with {selectedAgent?.name} for strategic analysis
                    </div>
                  )}

                  {/* Follow-up Suggestions */}
                  {followUpSuggestions.length > 0 && !isStreaming && communicationPreferences.autoSuggestFollowups && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                        Suggested Follow-ups
                      </div>
                      <div className="space-y-2">
                        {followUpSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setMessage(suggestion);
                              setFollowUpSuggestions([]); // Clear suggestions after selection
                            }}
                            className="w-full text-left p-3 text-sm bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 transition-colors font-light text-blue-800"
                          >
                            💡 {suggestion}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setFollowUpSuggestions([])}
                        className="text-xs text-gray-400 hover:text-gray-600 mt-2 uppercase tracking-wide"
                      >
                        Dismiss Suggestions
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                {quickActions.length > 0 && messages.length === 0 && (
                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <h4 className="text-sm uppercase tracking-wide text-gray-600 mb-3">
                      Quick Actions for {selectedAgent?.name}
                    </h4>
                    <div className="space-y-2">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => setMessage(action)}
                          className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-colors font-light"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="border-t border-gray-200 pt-6">
                  {/* Communication Preferences */}
                  <div className="flex items-center gap-6 mb-4 text-xs text-gray-600">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={communicationPreferences.includeContext}
                        onChange={(e) => setCommunicationPreferences(prev => ({
                          ...prev,
                          includeContext: e.target.checked
                        }))}
                        className="w-3 h-3"
                      />
                      <span className="uppercase tracking-wide">Context Aware</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={communicationPreferences.showToolUsage}
                        onChange={(e) => setCommunicationPreferences(prev => ({
                          ...prev,
                          showToolUsage: e.target.checked
                        }))}
                        className="w-3 h-3"
                      />
                      <span className="uppercase tracking-wide">Show Tools</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={communicationPreferences.autoSuggestFollowups}
                        onChange={(e) => setCommunicationPreferences(prev => ({
                          ...prev,
                          autoSuggestFollowups: e.target.checked
                        }))}
                        className="w-3 h-3"
                      />
                      <span className="uppercase tracking-wide">Auto Suggestions</span>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Ask ${selectedAgent?.name} for strategic analysis...`}
                      className="flex-1 resize-none border border-gray-300 rounded-sm p-4 font-light leading-relaxed focus:outline-none focus:border-black transition-colors"
                      rows={3}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isStreaming || !message.trim()}
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