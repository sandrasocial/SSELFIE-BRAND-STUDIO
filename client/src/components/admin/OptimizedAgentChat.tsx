import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Send, Sparkles, Wand2, MessageSquare, FileText, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChatMode = 'conversation' | 'workflow';

interface Agent {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  personality: string;
  color: string;
}

const agents: Agent[] = [
  { 
    id: 'zara', 
    name: 'Zara', 
    role: 'Dev AI', 
    expertise: ['React Components', 'Performance Optimization', 'Technical Architecture'],
    personality: 'Direct, solution-focused, delivers results',
    color: 'emerald'
  },
  { 
    id: 'aria', 
    name: 'Aria', 
    role: 'Design AI', 
    expertise: ['Luxury Editorial Design', 'Times New Roman Typography', 'Visual Storytelling'],
    personality: 'Aesthetic perfectionist, editorial eye',
    color: 'purple'
  },
  { 
    id: 'rachel', 
    name: 'Rachel', 
    role: 'Voice AI', 
    expertise: ['Sandra Voice', 'Copywriting', 'Brand Messaging'],
    personality: 'Warm, authentic, captures your voice',
    color: 'rose'
  },
  { 
    id: 'quinn', 
    name: 'Quinn', 
    role: 'QA AI', 
    expertise: ['Quality Standards', 'Testing', 'Luxury Brand Consistency'],
    personality: 'Meticulous, detail-oriented, ensures excellence',
    color: 'blue'
  },
  { 
    id: 'diana', 
    name: 'Diana', 
    role: 'Business Coach AI', 
    expertise: ['Strategic Planning', 'Decision Making', 'Team Coordination'],
    personality: 'Strategic thinker, executive advisor',
    color: 'amber'
  }
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
  mode: ChatMode;
  fileCreated?: boolean;
  status?: 'sending' | 'sent' | 'delivered';
}

export default function OptimizedAgentChat() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [chatMode, setChatMode] = useState<ChatMode>('conversation');
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const sendMessage = useMutation({
    mutationFn: async ({ content, mode }: { content: string, mode: ChatMode }) => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        content,
        timestamp: new Date(),
        mode,
        status: 'sending'
      };
      setConversation(prev => [...prev, userMessage]);
      setIsTyping(true);

      // Enhanced prompt with Sandra's voice and style
      let agentPrompt = '';
      if (mode === 'conversation') {
        agentPrompt = `Hey ${selectedAgent.name}! ${content}
        
Please respond in Sandra's voice - warm, confident, and effortless. Think like her personal AI assistant who knows her style: luxury editorial aesthetic, Times New Roman typography, clean minimal design, and that editorial magazine feel. Keep it conversational but sophisticated.`;
      } else {
        agentPrompt = `${selectedAgent.name}, I need you to actually create this: ${content}
        
This is approved for immediate execution. Use Sandra's luxury editorial design system - black #0a0a0a, white #ffffff, editorial gray #f5f5f5, Times New Roman for headlines, generous whitespace, and that iconic magazine-style layout. Create real working files that match the SSELFIE Studio aesthetic.`;
      }

      const response = await fetch('/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Token': 'sandra-admin-2025'
        },
        body: JSON.stringify({
          agentId: selectedAgent.id.toUpperCase(),
          message: agentPrompt,
          conversationId: `chat-${Date.now()}`,
          userId: 'sandra-admin'
        })
      });

      const result = await response.json();
      setIsTyping(false);
      return { result, mode };
    },
    onSuccess: ({ result, mode }) => {
      const agentMessage: ChatMessage = {
        id: Date.now().toString() + '_agent',
        sender: 'agent',
        content: result.response || result.message || 'Response received',
        timestamp: new Date(),
        mode,
        fileCreated: result.fileOperations && result.fileOperations.length > 0,
        status: 'delivered'
      };
      setConversation(prev => [...prev, agentMessage]);
      setMessage('');

      if (mode === 'workflow') {
        toast({
          title: `${selectedAgent.name} delivered`,
          description: result.fileOperations?.length ? 
            `Created ${result.fileOperations.length} file(s) with luxury design` : 
            'Task completed successfully',
        });
      }
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Connection issue",
        description: "Let me try that again for you",
        variant: "destructive",
      });
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate({ content: message, mode: chatMode });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = {
    conversation: [
      "What should I focus on next?",
      "How can we improve this?",
      "What's your recommendation?",
      "Give me your strategic take"
    ],
    workflow: [
      "Create a luxury landing section",
      "Optimize our current performance", 
      "Build a new component",
      "Enhance the user experience"
    ]
  };

  const getAgentColor = (agent: Agent) => {
    const colors = {
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      rose: 'bg-rose-50 border-rose-200 text-rose-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      amber: 'bg-amber-50 border-amber-200 text-amber-800'
    };
    return colors[agent.color as keyof typeof colors] || colors.emerald;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl text-gray-900">Your AI Team</h1>
        <p className="text-gray-600">Direct line to your specialized agents</p>
      </div>

      {/* Agent Selection */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl">Choose your agent</h3>
            <div className="flex gap-2">
              <Button
                variant={chatMode === 'conversation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChatMode('conversation')}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Conversation
              </Button>
              <Button
                variant={chatMode === 'workflow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChatMode('workflow')}
                className="gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Workflow
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all hover:scale-105",
                  selectedAgent.id === agent.id 
                    ? getAgentColor(agent)
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                )}
              >
                <div className="font-semibold text-sm">{agent.name}</div>
                <div className="text-xs text-gray-600 mt-1">{agent.role}</div>
                <div className="text-xs mt-2 opacity-75">{agent.personality}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full", selectedAgent.color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500')} />
              <div>
                <div className="font-semibold">{selectedAgent.name}</div>
                <div className="text-sm text-gray-600">{selectedAgent.role}</div>
              </div>
            </div>
            <Badge variant={chatMode === 'conversation' ? 'secondary' : 'default'}>
              {chatMode === 'conversation' ? 'Consulting' : 'Creating'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-6">
            <div className="space-y-4">
              {conversation.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>Start a conversation with {selectedAgent.name}</p>
                  <p className="text-sm mt-1">{selectedAgent.personality}</p>
                </div>
              )}
              
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] p-4 rounded-lg",
                      msg.sender === 'user'
                        ? "bg-gray-900 text-white"
                        : "bg-gray-50 border border-gray-200"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <time className="text-xs opacity-75">
                        {msg.timestamp.toLocaleTimeString()}
                      </time>
                      {msg.fileCreated && (
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          Files created
                        </Badge>
                      )}
                      {msg.sender === 'user' && msg.status && (
                        <div className="flex items-center">
                          {msg.status === 'sending' && <Clock className="w-3 h-3 opacity-50" />}
                          {msg.status === 'delivered' && <Check className="w-3 h-3 text-green-500" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-sm">{selectedAgent.name} is working...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickPrompts[chatMode].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(prompt)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={chatMode === 'conversation' 
                  ? `Ask ${selectedAgent.name} for insights...`
                  : `Tell ${selectedAgent.name} what to create...`
                }
                className="min-h-[60px] resize-none"
                disabled={sendMessage.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sendMessage.isPending}
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}