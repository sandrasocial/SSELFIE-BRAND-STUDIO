import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

type ChatMode = 'conversation' | 'workflow';

interface Agent {
  id: string;
  name: string;
  role: string;
  expertise: string[];
}

const agents: Agent[] = [
  { id: 'aria', name: 'Aria', role: 'Design AI', expertise: ['Luxury Editorial Design', 'Times New Roman Typography', 'Visual Storytelling'] },
  { id: 'zara', name: 'Zara', role: 'Dev AI', expertise: ['React Components', 'Performance Optimization', 'Technical Architecture'] },
  { id: 'rachel', name: 'Rachel', role: 'Voice AI', expertise: ['Sandra Voice', 'Copywriting', 'Brand Messaging'] },
  { id: 'ava', name: 'Ava', role: 'Automation AI', expertise: ['Workflow Design', 'Process Optimization', 'System Integration'] },
  { id: 'quinn', name: 'Quinn', role: 'QA AI', expertise: ['Quality Standards', 'Testing', 'Luxury Brand Consistency'] },
  { id: 'sophia', name: 'Sophia', role: 'Social Media AI', expertise: ['Instagram Strategy', 'Community Growth', 'Content Planning'] },
  { id: 'martha', name: 'Martha', role: 'Marketing AI', expertise: ['Performance Marketing', 'Ad Campaigns', 'Revenue Optimization'] },
  { id: 'diana', name: 'Diana', role: 'Business Coach AI', expertise: ['Strategic Planning', 'Decision Making', 'Team Coordination'] },
  { id: 'wilma', name: 'Wilma', role: 'Workflow AI', expertise: ['Process Design', 'Efficiency', 'System Architecture'] },
  { id: 'olga', name: 'Olga', role: 'Repository Organizer AI', expertise: ['File Organization', 'Architecture Cleanup', 'Safe Operations'] }
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
  mode: ChatMode;
  fileCreated?: boolean;
}

export default function DualModeAgentChat() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [chatMode, setChatMode] = useState<ChatMode>('conversation');
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const { toast } = useToast();

  const sendMessage = useMutation({
    mutationFn: async ({ content, mode }: { content: string, mode: ChatMode }) => {
      // Add user message to conversation immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        content,
        timestamp: new Date(),
        mode
      };
      setConversation(prev => [...prev, userMessage]);

      // Different prompts based on mode
      let agentPrompt = content;
      if (mode === 'conversation') {
        agentPrompt = `CONVERSATION MODE: ${content}. Provide insights, suggestions, or strategic guidance. NO file creation required - just thoughtful consultation.`;
      } else {
        agentPrompt = `WORKFLOW MODE: ${content}. Create actual working files immediately. This is approved workflow execution - deliver tangible results.`;
      }

      const response = await fetch('/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: agentPrompt,
          adminToken: 'sandra-admin-2025',
          conversationHistory: conversation.slice(-5) // Send last 5 messages for context
        })
      });

      const result = await response.json();
      return { result, mode };
    },
    onSuccess: ({ result, mode }) => {
      const agentMessage: ChatMessage = {
        id: Date.now().toString() + '_agent',
        sender: 'agent',
        content: result.response || 'Agent response received',
        timestamp: new Date(),
        mode,
        fileCreated: result.fileOperations && result.fileOperations.length > 0
      };
      setConversation(prev => [...prev, agentMessage]);
      setMessage('');

      if (mode === 'workflow' && agentMessage.fileCreated) {
        toast({
          title: "Files Created",
          description: `${selectedAgent.name} successfully created ${result.fileOperations.length} file(s)`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const quickInsightQuestions = [
    "What should I prioritize next for SSELFIE Studio?",
    "How can we improve user experience?",
    "What's your strategic recommendation?",
    "Analyze our current performance"
  ];

  const quickWorkflowTasks = [
    "Create a luxury component for the landing page",
    "Optimize performance of the current system",
    "Enhance the user onboarding flow",
    "Build a new feature component"
  ];

  const getModeStyle = (mode: ChatMode) => {
    return mode === 'conversation' 
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const getModeIcon = (mode: ChatMode) => {
    return mode === 'conversation' ? '💭' : '⚡';
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection & Agent Selection */}
      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
              Dual-Mode Agent Chat
            </h3>
            <div className="flex items-center gap-4">
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 p-1 rounded">
                <Button
                  size="sm"
                  variant={chatMode === 'conversation' ? 'default' : 'ghost'}
                  onClick={() => setChatMode('conversation')}
                  className={chatMode === 'conversation' ? 'bg-blue-600 text-white' : 'text-gray-700'}
                >
                  💭 Conversation
                </Button>
                <Button
                  size="sm"
                  variant={chatMode === 'workflow' ? 'default' : 'ghost'}
                  onClick={() => setChatMode('workflow')}
                  className={chatMode === 'workflow' ? 'bg-green-600 text-white' : 'text-gray-700'}
                >
                  ⚡ Workflow
                </Button>
              </div>
            </div>
          </div>
          
          {/* Mode Description */}
          <div className="text-sm text-gray-600">
            {chatMode === 'conversation' ? (
              <span>💭 <strong>Conversation Mode:</strong> Get insights, strategic advice, and consultation without file creation</span>
            ) : (
              <span>⚡ <strong>Workflow Mode:</strong> Execute tasks with immediate file creation and tangible deliverables</span>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Agent Selection Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`border p-3 cursor-pointer transition-all text-center ${
                  selectedAgent.id === agent.id 
                    ? 'border-black bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="font-medium text-sm">{agent.name}</div>
                <div className="text-xs text-gray-500">{agent.role}</div>
              </div>
            ))}
          </div>

          {/* Selected Agent Info */}
          <div className="bg-gray-50 p-4 border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{selectedAgent.name} - {selectedAgent.role}</h4>
              <Badge className={getModeStyle(chatMode)}>
                {getModeIcon(chatMode)} {chatMode.toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Expertise:</strong> {selectedAgent.expertise.join(', ')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="border border-gray-200">
        <CardHeader>
          <h4 className="font-medium">Chat with {selectedAgent.name}</h4>
        </CardHeader>
        <CardContent>
          {/* Chat Messages */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {conversation.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Start a conversation with {selectedAgent.name} in {chatMode} mode
              </div>
            ) : (
              conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">
                        {msg.sender === 'user' ? 'You' : selectedAgent.name}
                      </span>
                      <Badge className={`${getModeStyle(msg.mode)} text-xs`}>
                        {getModeIcon(msg.mode)}
                      </Badge>
                      {msg.fileCreated && (
                        <Badge className="bg-green-100 text-green-800 text-xs">📁 Files Created</Badge>
                      )}
                    </div>
                    <div className="text-sm">{msg.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              {chatMode === 'conversation' ? 'Quick Insight Questions:' : 'Quick Workflow Tasks:'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(chatMode === 'conversation' ? quickInsightQuestions : quickWorkflowTasks).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(question)}
                  className="text-left justify-start text-xs h-auto py-2 px-3"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                chatMode === 'conversation'
                  ? `Ask ${selectedAgent.name} for insights or strategic advice...`
                  : `Request ${selectedAgent.name} to create files and execute tasks...`
              }
              className="flex-1 p-3 border border-gray-200 text-sm resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (message.trim()) {
                    sendMessage.mutate({ content: message, mode: chatMode });
                  }
                }
              }}
            />
            <Button
              onClick={() => sendMessage.mutate({ content: message, mode: chatMode })}
              disabled={!message.trim() || sendMessage.isPending}
              className={
                chatMode === 'conversation'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }
            >
              {sendMessage.isPending ? 'Sending...' : chatMode === 'conversation' ? 'Ask' : 'Execute'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}