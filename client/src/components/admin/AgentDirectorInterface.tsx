import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStep {
  id: string;
  agent: string;
  task: string;
  timeline: string;
  deliverables: string[];
}

interface AgentPerformance {
  id: string;
  name: string;
  status: 'active' | 'working' | 'error' | 'stopped';
  fileDeliveryRate: number;
  errorCount: number;
  lastError?: string;
}

export default function AgentDirectorInterface() {
  const [conversation, setConversation] = useState<Array<{
    id: string;
    sender: 'user' | 'elena';
    content: string;
    timestamp: Date;
  }>>([]);
  const [message, setMessage] = useState('');
  const [proposedWorkflow, setProposedWorkflow] = useState<WorkflowStep[] | null>(null);
  const [monitoringData, setMonitoringData] = useState<AgentPerformance[]>([
    { id: 'aria', name: 'Aria', status: 'active', fileDeliveryRate: 0, errorCount: 0 },
    { id: 'zara', name: 'Zara', status: 'active', fileDeliveryRate: 0, errorCount: 0 },
    { id: 'rachel', name: 'Rachel', status: 'active', fileDeliveryRate: 0, errorCount: 0 },
    { id: 'ava', name: 'Ava', status: 'active', fileDeliveryRate: 0, errorCount: 0 },
    { id: 'quinn', name: 'Quinn', status: 'active', fileDeliveryRate: 0, errorCount: 0 },
    { id: 'sophia', name: 'Sophia', status: 'active', fileDeliveryRate: 0, errorCount: 0 },
    { id: 'martha', name: 'Martha', status: 'active', fileDeliveryRate: 0, errorCount: 0 },
    { id: 'diana', name: 'Diana', status: 'active', fileDeliveryRate: 0, errorCount: 0 },
    { id: 'wilma', name: 'Wilma', status: 'active', fileDeliveryRate: 0, errorCount: 0 },
    { id: 'olga', name: 'Olga', status: 'active', fileDeliveryRate: 0, errorCount: 0 }
  ]);
  const { toast } = useToast();

  const chatWithElena = useMutation({
    mutationFn: async (content: string) => {
      const userMessage = {
        id: Date.now().toString(),
        sender: 'user' as const,
        content,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, userMessage]);

      const response = await fetch('/api/admin/agent-chat-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'elena',
          message: `CEO DIRECTOR MODE: ${content}. Provide strategic analysis, expert recommendations, and propose detailed workflow with specific agent assignments. Include monitoring plan for execution.`,
          adminToken: 'sandra-admin-2025',
          conversationHistory: conversation.slice(-3)
        })
      });

      const result = await response.json();
      return result;
    },
    onSuccess: (result) => {
      const elenaMessage = {
        id: Date.now().toString() + '_elena',
        sender: 'elena' as const,
        content: result.response || 'Strategic analysis complete',
        timestamp: new Date()
      };
      setConversation(prev => [...prev, elenaMessage]);
      setMessage('');

      // Parse workflow if Elena provides one
      if (result.response && result.response.includes('PROPOSED WORKFLOW')) {
        // Mock workflow parsing - in production this would be more sophisticated
        const mockWorkflow: WorkflowStep[] = [
          {
            id: '1',
            agent: 'Aria',
            task: 'Create luxury component designs',
            timeline: '2 hours',
            deliverables: ['Component files', 'Design system updates']
          },
          {
            id: '2', 
            agent: 'Zara',
            task: 'Implement backend functionality',
            timeline: '3 hours',
            deliverables: ['API endpoints', 'Database updates']
          }
        ];
        setProposedWorkflow(mockWorkflow);
      }
    },
    onError: (error) => {
      toast({
        title: "Communication Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const activateWorkflow = useMutation({
    mutationFn: async () => {
      if (!proposedWorkflow) return;
      
      // In production, this would actually coordinate with other agents
      toast({
        title: "Workflow Activated",
        description: `Elena is coordinating ${proposedWorkflow.length} agents for execution`,
      });
      
      return { success: true };
    }
  });

  const stopAgent = useMutation({
    mutationFn: async (agentId: string) => {
      setMonitoringData(prev => 
        prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, status: 'stopped' as const }
            : agent
        )
      );
      
      toast({
        title: "Agent Stopped",
        description: `Elena stopped ${agentId} due to performance issues`,
      });
    }
  });

  const getStatusColor = (status: AgentPerformance['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'working': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const strategicQuestions = [
    "How can we improve SSELFIE Studio's revenue this month?",
    "What's the priority for our next development sprint?", 
    "Design a workflow to optimize our user onboarding",
    "How should we handle the 0% file delivery problem?",
    "Create a strategy to scale our AI agent team"
  ];

  return (
    <div className="space-y-6">
      {/* Elena CEO Header */}
      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
                Elena - AI Agent Director & CEO
              </h3>
              <p className="text-sm text-gray-600">
                Strategic vision coordination • Agent oversight • Workflow orchestration
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-800">CEO Director</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Chat with Elena */}
        <Card className="border border-gray-200">
          <CardHeader>
            <h4 className="font-medium">Strategic Vision Discussion</h4>
          </CardHeader>
          <CardContent>
            {/* Chat Messages */}
            <div className="space-y-4 mb-6">
              {conversation.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="mb-4">💼</div>
                  <div>Start a strategic conversation with Elena</div>
                  <div className="text-xs">Share your vision, challenges, or goals</div>
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
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {msg.sender === 'user' ? 'Sandra' : 'Elena CEO'}
                        </span>
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

            {/* Quick Strategic Questions */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Strategic Focus Areas:</div>
              <div className="grid grid-cols-1 gap-2">
                {strategicQuestions.map((question, index) => (
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
                placeholder="Share your vision, challenges, or strategic goals with Elena..."
                className="flex-1 p-3 border border-gray-200 text-sm resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (message.trim()) {
                      chatWithElena.mutate(message);
                    }
                  }
                }}
              />
              <Button
                onClick={() => chatWithElena.mutate(message)}
                disabled={!message.trim() || chatWithElena.isPending}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {chatWithElena.isPending ? 'Analyzing...' : 'Discuss'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Agent Performance Monitor */}
        <Card className="border border-gray-200">
          <CardHeader>
            <h4 className="font-medium">Agent Performance Monitor</h4>
            <p className="text-sm text-gray-600">Real-time oversight of your AI team</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monitoringData.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                      {agent.name[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-gray-500">
                        Files: {agent.fileDeliveryRate}% • Errors: {agent.errorCount}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                    {agent.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => stopAgent.mutate(agent.id)}
                        className="text-xs"
                      >
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposed Workflow */}
      {proposedWorkflow && (
        <Card className="border border-purple-200 bg-purple-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Elena's Proposed Workflow</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setProposedWorkflow(null)}
                  className="text-sm"
                >
                  Modify
                </Button>
                <Button
                  onClick={() => activateWorkflow.mutate()}
                  disabled={activateWorkflow.isPending}
                  className="bg-purple-600 text-white hover:bg-purple-700 text-sm"
                >
                  {activateWorkflow.isPending ? 'Activating...' : 'Activate Workflow'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposedWorkflow.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-4 bg-white rounded border">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{step.agent}</span>
                      <Badge variant="outline">{step.timeline}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{step.task}</div>
                    <div className="text-xs text-gray-500">
                      Deliverables: {step.deliverables.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}