import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { useToast } from './hooks/use-toast';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  agents: string[];
  estimatedTime: string;
  deliverables: string[];
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'build-feature-complete',
    name: 'Complete BUILD Feature Implementation',
    description: 'Full BUILD feature with luxury editorial design and website builder',
    agents: ['aria', 'zara', 'rachel'],
    estimatedTime: '30 minutes',
    deliverables: [
      'EnhancedBuildVisualEditor.tsx',
      'BuildPageLayout.tsx', 
      'VictoriaChatInterface.tsx',
      'WebsitePreviewPanel.tsx',
      'Updated routing and navigation'
    ]
  },
  {
    id: 'landing-page-redesign',
    name: 'Landing Page Luxury Redesign',
    description: 'Complete landing page overhaul with Times New Roman and editorial design',
    agents: ['aria', 'rachel'],
    estimatedTime: '20 minutes',
    deliverables: [
      'LuxuryLandingPage.tsx',
      'EditorialHeroSection.tsx',
      'TransformationStorySection.tsx',
      'Updated copy and messaging'
    ]
  },
  {
    id: 'admin-dashboard-enhancement',
    name: 'Admin Dashboard Power Features',
    description: 'Enhanced admin capabilities with real-time monitoring and controls',
    agents: ['zara', 'quinn'],
    estimatedTime: '25 minutes',
    deliverables: [
      'RealTimeMetricsDashboard.tsx',
      'AgentControlPanel.tsx',
      'SystemHealthMonitor.tsx',
      'Enhanced performance tracking'
    ]
  },
  {
    id: 'ai-speed-optimization',
    name: 'AI Speed & Performance Boost',
    description: 'Optimize all AI interactions for sub-second response times',
    agents: ['zara', 'ava'],
    estimatedTime: '40 minutes',
    deliverables: [
      'Optimized API endpoints',
      'Caching improvements',
      'Database query optimization',
      'Real-time status updates'
    ]
  }
];

export default function AgentWorkflowAccelerator() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const executeWorkflow = useMutation({
    mutationFn: async (workflowId: string) => {
      const workflow = workflowTemplates.find(w => w.id === workflowId);
      if (!workflow) throw new Error('Workflow not found');

      setIsExecuting(true);
      
      // Send coordinated task to all agents involved
      const results = await Promise.all(
        workflow.agents.map(async (agentId) => {
          const response = await fetch('/api/admin/agents/chat-bypass', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              agentId,
              message: `WORKFLOW EXECUTION: ${workflow.name}. Create actual files for: ${workflow.deliverables.join(', ')}. Work continuously until complete. This is an approved task - start immediately.`,
              adminToken: 'sandra-admin-2025',
              conversationHistory: []
            })
          });
          return response.json();
        })
      );

      return { workflow, results };
    },
    onSuccess: (data) => {
      setIsExecuting(false);
      toast({
        title: "Workflow Executed",
        description: `${data.workflow.name} has been assigned to agents. Check the Performance tab for real-time progress.`,
      });
    },
    onError: (error) => {
      setIsExecuting(false);
      toast({
        title: "Workflow Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const quickTasks = [
    {
      id: 'emergency-fix',
      name: 'Emergency Bug Fix',
      agent: 'zara',
      description: 'Immediate fix for critical issues'
    },
    {
      id: 'design-polish',
      name: 'Design Polish',
      agent: 'aria',
      description: 'Quick visual improvements'
    },
    {
      id: 'copy-enhancement',
      name: 'Copy Enhancement',
      agent: 'rachel',
      description: 'Voice and messaging improvements'
    },
    {
      id: 'qa-check',
      name: 'Quality Audit',
      agent: 'quinn',
      description: 'Comprehensive quality review'
    }
  ];

  const executeQuickTask = useMutation({
    mutationFn: async ({ taskId, customMessage }: { taskId: string, customMessage: string }) => {
      const task = quickTasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const response = await fetch('/api/admin/agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId: task.agent,
          message: customMessage || `QUICK TASK: ${task.description}. Create actual files immediately. This is approved - start now.`,
          adminToken: 'sandra-admin-2025',
          conversationHistory: []
        })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quick Task Assigned",
        description: "Agent is working on your request. Check Performance tab for progress.",
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Workflow Templates */}
      <Card className="border border-gray-200">
        <CardHeader>
          <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
            AI Workflow Accelerator
          </h3>
          <p className="text-sm text-gray-600">Execute coordinated agent workflows for major features</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflowTemplates.map((workflow) => (
              <div 
                key={workflow.id} 
                className={`border p-4 cursor-pointer transition-all ${
                  selectedWorkflow === workflow.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedWorkflow(workflow.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{workflow.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {workflow.estimatedTime}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-600">{workflow.description}</p>
                  
                  <div className="flex gap-1 flex-wrap">
                    {workflow.agents.map((agent) => (
                      <Badge key={agent} className="text-xs bg-gray-100 text-gray-700 capitalize">
                        {agent}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <strong>Deliverables:</strong> {workflow.deliverables.slice(0, 2).join(', ')}
                    {workflow.deliverables.length > 2 && ` +${workflow.deliverables.length - 2} more`}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedWorkflow && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-sm">Ready to Execute</h5>
                  <p className="text-xs text-gray-600">
                    {workflowTemplates.find(w => w.id === selectedWorkflow)?.name}
                  </p>
                </div>
                <Button
                  onClick={() => executeWorkflow.mutate(selectedWorkflow)}
                  disabled={isExecuting || executeWorkflow.isPending}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {isExecuting ? 'Executing...' : 'Execute Workflow'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tasks */}
      <Card className="border border-gray-200">
        <CardHeader>
          <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
            Quick Tasks
          </h3>
          <p className="text-sm text-gray-600">Instant single-agent tasks for immediate needs</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickTasks.map((task) => (
              <Button
                key={task.id}
                variant="outline"
                size="sm"
                onClick={() => executeQuickTask.mutate({ taskId: task.id, customMessage: '' })}
                disabled={executeQuickTask.isPending}
                className="h-auto p-3 text-left flex flex-col items-start"
              >
                <div className="font-medium text-xs">{task.name}</div>
                <div className="text-xs text-gray-500 capitalize">{task.agent}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Command */}
      <Card className="border border-gray-200">
        <CardHeader>
          <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
            Custom Agent Command
          </h3>
          <p className="text-sm text-gray-600">Send direct commands to any agent</p>
        </CardHeader>
        <CardContent>
          <CustomAgentCommand onExecute={(agentId, message) => 
            executeQuickTask.mutate({ taskId: 'custom', customMessage: message })
          } />
        </CardContent>
      </Card>
    </div>
  );
}

function CustomAgentCommand({ onExecute }: { onExecute: (agentId: string, message: string) => void }) {
  const [selectedAgent, setSelectedAgent] = useState('aria');
  const [message, setMessage] = useState('');

  const agents = [
    { id: 'aria', name: 'Aria', role: 'Design AI' },
    { id: 'zara', name: 'Zara', role: 'Dev AI' },
    { id: 'rachel', name: 'Rachel', role: 'Voice AI' },
    { id: 'quinn', name: 'Quinn', role: 'QA AI' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {agents.map((agent) => (
          <Button
            key={agent.id}
            variant={selectedAgent === agent.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedAgent(agent.id)}
            className={selectedAgent === agent.id ? "bg-black text-white" : ""}
          >
            {agent.name}
          </Button>
        ))}
      </div>
      
      <div className="space-y-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your command for the agent (they will create actual files)..."
          className="w-full p-3 border border-gray-200 text-sm resize-none"
          rows={3}
        />
        <Button
          onClick={() => onExecute(selectedAgent, message)}
          disabled={!message.trim()}
          className="bg-black text-white hover:bg-gray-800"
          size="sm"
        >
          Send Command
        </Button>
      </div>
    </div>
  );
}