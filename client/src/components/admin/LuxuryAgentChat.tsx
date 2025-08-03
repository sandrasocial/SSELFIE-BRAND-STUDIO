import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Send, Sparkles, Wand2, MessageSquare, FileText, Clock, Check, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChatMode = 'ask' | 'create';

interface Agent {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  personality: string;
  description: string;
}

const agents: Agent[] = [
  { 
    id: 'ZARA', 
    name: 'Zara', 
    role: 'Technical Lead', 
    expertise: ['React Components', 'Performance', 'Architecture'],
    personality: 'Direct • Results-focused • Gets things done',
    description: 'Your go-to for building and optimizing'
  },
  { 
    id: 'ARIA', 
    name: 'Aria', 
    role: 'Design Director', 
    expertise: ['Luxury Design', 'Typography', 'Visual Stories'],
    personality: 'Perfectionist • Editorial eye • Aesthetic genius',
    description: 'Creates stunning visual experiences'
  },
  { 
    id: 'RACHEL', 
    name: 'Rachel', 
    role: 'Voice Specialist', 
    expertise: ['Your Voice', 'Copywriting', 'Brand Messaging'],
    personality: 'Warm • Authentic • Captures your essence',
    description: 'Writes in your voice, perfectly'
  },
  { 
    id: 'QUINN', 
    name: 'Quinn', 
    role: 'Quality Guardian', 
    expertise: ['Quality Control', 'Testing', 'Excellence'],
    personality: 'Meticulous • Detail-oriented • Never settles',
    description: 'Ensures everything meets luxury standards'
  },
  { 
    id: 'DIANA', 
    name: 'Diana', 
    role: 'Strategic Advisor', 
    expertise: ['Business Strategy', 'Decisions', 'Growth'],
    personality: 'Strategic • Executive mindset • Big picture',
    description: 'Your strategic thinking partner'
  }
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
  mode: ChatMode;
  agentName?: string;
  files?: string[];
  status?: 'sending' | 'sent' | 'delivered';
}

export default function LuxuryAgentChat() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [chatMode, setChatMode] = useState<ChatMode>('ask');
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
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
      setIsProcessing(true);

      // Craft the perfect prompt for Sandra's voice and style
      let enhancedPrompt = '';
      if (mode === 'ask') {
        enhancedPrompt = `Sandra here! ${content}

Please respond as ${selectedAgent.name}, my ${selectedAgent.role.toLowerCase()}. Keep it warm, confident, and effortless - like we're having a conversation. Think luxury editorial aesthetic, Times New Roman vibes, clean and sophisticated. Give me your best insights and recommendations.`;
      } else {
        enhancedPrompt = `${selectedAgent.name}, I need you to create this: ${content}

This is approved for immediate execution. Use my luxury editorial design system:
- Colors: black #0a0a0a, white #ffffff, editorial gray #f5f5f5
- Typography: Times New Roman for headlines, clean system fonts for UI
- Style: generous whitespace, editorial magazine layout, iconic and minimal
- Feel: SSELFIE Studio luxury aesthetic throughout

Create real working files that match this aesthetic perfectly.`;
      }

      const response = await fetch('/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Token': 'sandra-admin-2025'
        },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: enhancedPrompt,
          conversationId: `sandra-chat-${Date.now()}`,
          userId: 'sandra-admin'
        })
      });

      const result = await response.json();
      setIsProcessing(false);
      return { result, mode };
    },
    onSuccess: ({ result, mode }) => {
      // Update user message status
      setConversation(prev => prev.map(msg => 
        msg.status === 'sending' ? { ...msg, status: 'sent' } : msg
      ));

      const agentMessage: ChatMessage = {
        id: Date.now().toString() + '_agent',
        sender: 'agent',
        content: result.response || result.message || `${selectedAgent.name} is working on your request...`,
        timestamp: new Date(),
        mode,
        agentName: selectedAgent.name,
        files: result.fileOperations?.map((op: any) => op.file) || [],
        status: 'delivered'
      };
      setConversation(prev => [...prev, agentMessage]);
      setMessage('');

      if (mode === 'create' && agentMessage.files?.length) {
        toast({
          title: `${selectedAgent.name} delivered`,
          description: `Created ${agentMessage.files.length} file(s) with your luxury aesthetic`,
        });
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Connection hiccup",
        description: "Let me try that again",
        variant: "destructive",
      });
    }
  });

  const handleSend = () => {
    if (!message.trim() || sendMessage.isPending) return;
    sendMessage.mutate({ content: message, mode: chatMode });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = {
    ask: [
      "What should I prioritize next?",
      "How can we improve our user experience?", 
      "What's your strategic recommendation?",
      "Give me your honest take on this"
    ],
    create: [
      "Create a luxury landing component",
      "Build an elegant user onboarding flow",
      "Design a premium pricing section", 
      "Optimize our performance and speed"
    ]
  };

  const getAgentInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Elegant Header */}
      <div className="text-center mb-8">
        <h1 className="font-['Times_New_Roman'] text-4xl font-light text-gray-900 mb-2">
          Your AI Team
        </h1>
        <p className="text-gray-600 text-lg">Direct access to your specialized agents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Agent Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <h3 className="font-['Times_New_Roman'] text-xl font-light">Your Agents</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-all hover:border-gray-300",
                    selectedAgent.id === agent.id 
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:bg-gray-25"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                      selectedAgent.id === agent.id 
                        ? "bg-gray-900 text-white"
                        : "bg-gray-200 text-gray-700"
                    )}>
                      {getAgentInitials(agent.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-gray-600 mb-1">{agent.role}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{agent.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Card className="border-gray-200 shadow-sm">
            {/* Chat Header */}
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium">
                    {getAgentInitials(selectedAgent.name)}
                  </div>
                  <div>
                    <div className="font-['Times_New_Roman'] text-xl font-light">{selectedAgent.name}</div>
                    <div className="text-sm text-gray-600">{selectedAgent.personality}</div>
                  </div>
                </div>
                
                {/* Mode Toggle */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                  <Button
                    variant={chatMode === 'ask' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChatMode('ask')}
                    className="gap-2 px-4"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Ask
                  </Button>
                  <Button
                    variant={chatMode === 'create' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChatMode('create')}
                    className="gap-2 px-4"
                  >
                    <Wand2 className="w-4 h-4" />
                    Create
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-6 space-y-6">
                  {conversation.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="font-['Times_New_Roman'] text-xl font-light text-gray-900 mb-2">
                        Ready when you are
                      </h3>
                      <p className="text-gray-600 mb-6">{selectedAgent.description}</p>
                      <div className="text-sm text-gray-500">{selectedAgent.personality}</div>
                    </div>
                  )}
                  
                  {conversation.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-4",
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.sender === 'agent' && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "max-w-[80%] p-4 rounded-2xl",
                          msg.sender === 'user'
                            ? "bg-gray-900 text-white"
                            : "bg-gray-50 border border-gray-200"
                        )}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        
                        {msg.files && msg.files.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200/50">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FileText className="w-4 h-4" />
                              Created {msg.files.length} file{msg.files.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3 pt-2">
                          <time className="text-xs opacity-60">
                            {msg.timestamp.toLocaleTimeString()}
                          </time>
                          {msg.sender === 'user' && msg.status && (
                            <div className="flex items-center">
                              {msg.status === 'sending' && <Clock className="w-3 h-3 opacity-50" />}
                              {msg.status === 'sent' && <Check className="w-3 h-3 opacity-50" />}
                              {msg.status === 'delivered' && <Check className="w-3 h-3 text-green-500" />}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {msg.sender === 'user' && (
                        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-1">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex gap-4 justify-start">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl">
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-sm">{selectedAgent.name} is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t border-gray-100 p-6">
                {/* Quick Prompts */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Quick starts</div>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts[chatMode].map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(prompt)}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="flex gap-3">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={chatMode === 'ask' 
                      ? `Ask ${selectedAgent.name} anything...`
                      : `Tell ${selectedAgent.name} what to create...`
                    }
                    className="min-h-[60px] resize-none border-gray-200 focus:border-gray-400"
                    disabled={sendMessage.isPending}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || sendMessage.isPending}
                    className="px-6 h-[60px]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  {chatMode === 'ask' ? 'Conversation mode - get insights and recommendations' : 'Creation mode - build real files and components'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}