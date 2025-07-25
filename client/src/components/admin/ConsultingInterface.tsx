import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, User, Bot, Settings, Eye, Edit, Search, FileText, Terminal, Globe, Shield, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Agent images - professional consulting interface
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
  capabilities: string[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: string;
  agentName?: string;
  toolsUsed?: string[];
  actionsTaken?: string[];
  recommendations?: string[];
}

interface ToolResult {
  tool: string;
  action: string;
  summary: string;
  icon: React.ReactNode;
}

const consultingAgents: ConsultingAgent[] = [
  {
    id: 'elena',
    name: 'Elena',
    role: 'AI Agent Director & CEO',
    specialty: 'Strategic Vision & Workflow Orchestration',
    image: AgentElena,
    capabilities: ['Strategic Planning', 'Team Coordination', 'Business Intelligence', 'Performance Monitoring']
  },
  {
    id: 'aria',
    name: 'Aria',
    role: 'Luxury Designer',
    specialty: 'Editorial Design & Creative Direction',
    image: AgentAria,
    capabilities: ['Luxury Design', 'Visual Storytelling', 'Brand Standards', 'Editorial Aesthetics']
  },
  {
    id: 'zara',
    name: 'Zara',
    role: 'Technical Architect',
    specialty: 'Code Architecture & Performance',
    image: AgentZara,
    capabilities: ['Technical Architecture', 'Performance Optimization', 'Code Review', 'System Design']
  },
  {
    id: 'rachel',
    name: 'Rachel',
    role: 'Voice & Copy Expert',
    specialty: 'Authentic Brand Voice',
    image: AgentRachel,
    capabilities: ['Voice Development', 'Content Strategy', 'Brand Messaging', 'Copy Optimization']
  },
  {
    id: 'ava',
    name: 'Ava',
    role: 'Automation Architect',
    specialty: 'Workflow & Process Design',
    image: AgentAva,
    capabilities: ['Process Automation', 'Workflow Design', 'System Integration', 'Efficiency Optimization']
  },
  {
    id: 'quinn',
    name: 'Quinn',
    role: 'Quality Guardian',
    specialty: 'Luxury Standards & QA',
    image: AgentQuinn,
    capabilities: ['Quality Assurance', 'Standard Testing', 'Brand Protection', 'Excellence Monitoring']
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Social Media Manager',
    specialty: 'Community & Growth',
    image: AgentSophia,
    capabilities: ['Social Strategy', 'Community Building', 'Content Planning', 'Growth Tactics']
  },
  {
    id: 'martha',
    name: 'Martha',
    role: 'Marketing & Ads',
    specialty: 'Performance Marketing',
    image: AgentMartha,
    capabilities: ['Ad Strategy', 'Performance Analytics', 'Campaign Management', 'Revenue Optimization']
  },
  {
    id: 'diana',
    name: 'Diana',
    role: 'Business Coach',
    specialty: 'Strategic Mentoring',
    image: AgentDiana,
    capabilities: ['Business Coaching', 'Strategic Planning', 'Decision Support', 'Growth Strategy']
  },
  {
    id: 'wilma',
    name: 'Wilma',
    role: 'Workflow Architect',
    specialty: 'Process Design',
    image: AgentWilma,
    capabilities: ['Workflow Design', 'Process Optimization', 'System Architecture', 'Efficiency Engineering']
  },
  {
    id: 'olga',
    name: 'Olga',
    role: 'Repository Organizer',
    specialty: 'File Organization & Architecture',
    image: AgentOlga,
    capabilities: ['File Organization', 'Architecture Cleanup', 'Dependency Management', 'Code Structure']
  }
];

// Tool result formatting
const formatToolResults = (content: string): ToolResult[] => {
  const results: ToolResult[] = [];
  
  if (content.includes('[Codebase Search Results]')) {
    results.push({
      tool: 'search_filesystem',
      action: 'Codebase Analysis',
      summary: 'Analyzed project structure and located relevant files',
      icon: <Search className="w-4 h-4" />
    });
  }
  
  if (content.includes('[File Operation:')) {
    results.push({
      tool: 'str_replace_based_edit_tool',
      action: 'File Operations',
      summary: 'Reviewed and analyzed file contents',
      icon: <FileText className="w-4 h-4" />
    });
  }
  
  if (content.includes('[Command Execution]')) {
    results.push({
      tool: 'bash',
      action: 'System Commands',
      summary: 'Executed system commands and verified results',
      icon: <Terminal className="w-4 h-4" />
    });
  }
  
  if (content.includes('[Web Search Results]')) {
    results.push({
      tool: 'web_search',
      action: 'Research',
      summary: 'Gathered current information and best practices',
      icon: <Globe className="w-4 h-4" />
    });
  }
  
  return results;
};

// Clean message content - remove raw tool outputs
const cleanMessageContent = (content: string): string => {
  // Remove tool result blocks but keep the main message
  let cleaned = content
    .replace(/\n\n\[Codebase Search Results\][^]*?(?=\n\n|\n$|$)/g, '')
    .replace(/\n\n\[File Operation:[^]*?(?=\n\n|\n$|$)/g, '')
    .replace(/\n\n\[Command Execution\][^]*?(?=\n\n|\n$|$)/g, '')
    .replace(/\n\n\[Web Search Results\][^]*?(?=\n\n|\n$|$)/g, '')
    .replace(/\n\n\[.*?\][^]*?(?=\n\n|\n$|$)/g, '')
    .trim();
  
  // If content is mostly removed, provide a professional summary
  if (cleaned.length < 50) {
    return "Analysis completed. Review the insights and recommendations below.";
  }
  
  return cleaned;
};

export function ConsultingInterface() {
  const [selectedAgent, setSelectedAgent] = useState<ConsultingAgent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileEditMode, setFileEditMode] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history when agent changes
  useEffect(() => {
    if (selectedAgent) {
      loadConversationHistory();
    }
  }, [selectedAgent]);

  const loadConversationHistory = async () => {
    if (!selectedAgent) return;
    
    try {
      // Create or get conversation
      const convResponse = await fetch('/api/claude/conversation/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ agentName: selectedAgent.id }),
      });

      if (!convResponse.ok) throw new Error('Failed to create conversation');
      
      const { conversationId: newConvId } = await convResponse.json();
      setConversationId(newConvId);

      // Load history
      const historyResponse = await fetch(`/api/claude/conversation/${newConvId}/history`, {
        credentials: 'include',
      });

      if (historyResponse.ok) {
        const history = await historyResponse.json();
        const formattedMessages: ChatMessage[] = history
          .filter((msg: any) => msg.role !== 'system')
          .map((msg: any, index: number) => ({
            id: `${index}`,
            type: msg.role === 'user' ? 'user' : 'agent',
            content: msg.role === 'assistant' ? cleanMessageContent(msg.content) : msg.content,
            timestamp: new Date().toLocaleTimeString(),
            agentName: msg.role === 'assistant' ? selectedAgent.name : undefined,
            toolsUsed: msg.role === 'assistant' ? formatToolResults(msg.content).map(r => r.tool) : undefined,
          }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/claude/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          agentName: selectedAgent.id,
          message: inputMessage,
          conversationId,
          fileEditMode, // Include the mode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const { response: agentResponse } = await response.json();
      
      // Extract tool results and clean content
      const toolResults = formatToolResults(agentResponse);
      const cleanedContent = cleanMessageContent(agentResponse);

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: cleanedContent,
        timestamp: new Date().toLocaleTimeString(),
        agentName: selectedAgent.name,
        toolsUsed: toolResults.map(r => r.tool),
        actionsTaken: toolResults.map(r => r.action),
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message to agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    setMessages([]);
    if (selectedAgent) {
      await loadConversationHistory(); // This will create a new conversation
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-normal text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                AI Consulting Agents
              </h1>
              <p className="text-gray-600 mt-1">Strategic consultation with your specialized AI team</p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <Label htmlFor="edit-mode" className="text-sm">Read-Only Mode</Label>
                <Switch
                  id="edit-mode"
                  checked={fileEditMode}
                  onCheckedChange={setFileEditMode}
                />
                <Label htmlFor="edit-mode" className="text-sm">File Edit Mode</Label>
                <Zap className="w-4 h-4 text-orange-500" />
              </div>
            </div>
          </div>
          
          {/* Mode Status */}
          <Alert className={`mt-4 ${fileEditMode ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
            <AlertDescription className="text-sm">
              {fileEditMode ? (
                <span className="text-orange-700">
                  <strong>File Edit Mode Active:</strong> Agents can create, modify, and update files directly.
                </span>
              ) : (
                <span className="text-blue-700">
                  <strong>Read-Only Mode Active:</strong> Agents can search, browse, and analyze but not modify files.
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Agent Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-normal" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Select Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2 p-4">
                    {consultingAgents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedAgent?.id === agent.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={agent.image}
                            alt={agent.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-black truncate">{agent.name}</p>
                            <p className="text-xs text-gray-600 truncate">{agent.role}</p>
                            <p className="text-xs text-gray-500 truncate">{agent.specialty}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            {selectedAgent ? (
              <Card className="h-[700px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedAgent.image}
                        alt={selectedAgent.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <CardTitle className="text-lg font-normal" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {selectedAgent.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{selectedAgent.specialty}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearConversation}
                      className="text-xs"
                    >
                      New Chat
                    </Button>
                  </div>
                  
                  {/* Agent Capabilities */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedAgent.capabilities.map((capability) => (
                      <Badge key={capability} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <Separator />

                {/* Messages */}
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Start a conversation with {selectedAgent.name}</p>
                          <p className="text-xs mt-1">Ask for analysis, strategy, or consultation</p>
                        </div>
                      )}
                      
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] ${
                            message.type === 'user' 
                              ? 'bg-black text-white' 
                              : 'bg-gray-50 text-black border border-gray-200'
                          } rounded-lg p-3`}>
                            {message.type === 'agent' && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Bot className="w-4 h-4" />
                                <span className="text-sm font-medium">{message.agentName}</span>
                                <span className="text-xs text-gray-500">{message.timestamp}</span>
                              </div>
                            )}
                            
                            <div className="prose prose-sm max-w-none">
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                            
                            {/* Tool Usage Indicators */}
                            {message.toolsUsed && message.toolsUsed.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-gray-300">
                                <div className="flex flex-wrap gap-2">
                                  {formatToolResults(message.content || '').map((result, index) => (
                                    <div key={index} className="flex items-center space-x-1 bg-white rounded px-2 py-1 text-xs border">
                                      {result.icon}
                                      <span>{result.action}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {message.type === 'user' && (
                              <div className="text-xs text-gray-300 mt-1">{message.timestamp}</div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Bot className="w-4 h-4" />
                              <span className="text-sm">thinking...</span>
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  {/* Input */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={`Ask ${selectedAgent.name} for consultation...`}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[700px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select an Agent</h3>
                  <p>Choose an AI consultant from the left panel to begin</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}