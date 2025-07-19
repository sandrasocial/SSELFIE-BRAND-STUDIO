import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface PowerActionTemplate {
  id: string;
  name: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: string;
  agents: string[];
  deliverables: string[];
  requirements: string[];
}

const powerActions: PowerActionTemplate[] = [
  {
    id: 'ai-speed-transformation',
    name: 'AI Speed Transformation',
    description: 'Transform entire agent team from proposal mode to execution mode with verified deliverables',
    impact: 'critical',
    estimatedTime: '15 minutes',
    agents: ['all'],
    deliverables: [
      'Updated agent personalities with mandatory file creation',
      'Real-time accountability tracking',
      'Performance monitoring dashboard',
      'Auto-detection of broken promises'
    ],
    requirements: [
      'Database access for accountability tracking',
      'Agent personality update permissions',
      'Real-time monitoring setup'
    ]
  },
  {
    id: 'build-feature-complete',
    name: 'Complete BUILD Feature Implementation',
    description: 'Full BUILD feature with luxury editorial design, website builder, and Victoria integration',
    impact: 'high',
    estimatedTime: '45 minutes',
    agents: ['aria', 'zara', 'rachel'],
    deliverables: [
      'EnhancedBuildVisualEditor.tsx',
      'BuildPageLayout.tsx',
      'VictoriaChatInterface.tsx',
      'WebsitePreviewPanel.tsx',
      'Complete routing and navigation',
      'Victoria voice enhancement for website building'
    ],
    requirements: [
      'React component library access',
      'Times New Roman luxury design system',
      'Victoria AI integration'
    ]
  },
  {
    id: 'enterprise-scaling-system',
    name: 'Enterprise Scaling System',
    description: 'Complete enterprise-grade infrastructure for Sandra\'s global expansion',
    impact: 'critical',
    estimatedTime: '60 minutes',
    agents: ['zara', 'ava', 'quinn'],
    deliverables: [
      'Auto-scaling infrastructure',
      'Performance monitoring system',
      'Global deployment configuration',
      'Enterprise security protocols',
      'Real-time analytics dashboard'
    ],
    requirements: [
      'Production database access',
      'Scaling infrastructure setup',
      'Security protocol implementation'
    ]
  },
  {
    id: 'luxury-ui-enhancement',
    name: 'Luxury UI Enhancement Suite',
    description: 'Complete luxury design system with Times New Roman typography and editorial layouts',
    impact: 'high',
    estimatedTime: '30 minutes',
    agents: ['aria', 'quinn'],
    deliverables: [
      'Luxury component library',
      'Editorial layout system',
      'Times New Roman typography system',
      'Dark moody + bright clean design patterns',
      'Mobile-responsive luxury layouts'
    ],
    requirements: [
      'Design system access',
      'Component library permissions',
      'Typography asset access'
    ]
  }
];

const emergencyActions = [
  {
    id: 'agent-accountability-reset',
    name: 'Agent Accountability Reset',
    description: 'Force all agents into immediate execution mode',
    severity: 'urgent'
  },
  {
    id: 'performance-boost',
    name: 'Performance Emergency Boost',
    description: 'Optimize all systems for maximum speed',
    severity: 'high'
  },
  {
    id: 'file-creation-enforcement',
    name: 'File Creation Enforcement',
    description: 'Force agents to create actual files instead of proposals',
    severity: 'critical'
  }
];

export default function AgentPowerDashboard() {
  const [selectedAction, setSelectedAction] = useState<PowerActionTemplate | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const executePowerAction = useMutation({
    mutationFn: async (action: PowerActionTemplate) => {
      setIsExecuting(true);

      // Execute power action across multiple agents
      const results = await Promise.all(
        action.agents.map(async (agentId) => {
          if (agentId === 'all') {
            // Execute for all agents
            const allAgents = ['aria', 'zara', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'];
            return Promise.all(
              allAgents.map(async (id) => {
                const response = await fetch('/api/admin/agent-chat-bypass', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    agentId: id,
                    message: `POWER ACTION EXECUTION: ${action.name}. MANDATORY: Create actual files immediately for: ${action.deliverables.join(', ')}. This is an approved critical task - execute immediately with zero proposals.`,
                    adminToken: 'sandra-admin-2025',
                    conversationHistory: []
                  })
                });
                return response.json();
              })
            );
          } else {
            const response = await fetch('/api/admin/agent-chat-bypass', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                agentId,
                message: `POWER ACTION EXECUTION: ${action.name}. MANDATORY: Create actual files immediately for: ${action.deliverables.join(', ')}. This is an approved critical task - execute immediately with zero proposals.`,
                adminToken: 'sandra-admin-2025',
                conversationHistory: []
              })
            });
            return response.json();
          }
        })
      );

      return { action, results };
    },
    onSuccess: (data) => {
      setIsExecuting(false);
      toast({
        title: "Power Action Executed",
        description: `${data.action.name} has been deployed across ${data.action.agents.length === 1 && data.action.agents[0] === 'all' ? 'all agents' : data.action.agents.join(', ')}. Monitor the Performance tab for real-time progress.`,
      });
    },
    onError: (error) => {
      setIsExecuting(false);
      toast({
        title: "Power Action Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const executeEmergencyAction = useMutation({
    mutationFn: async (action: any) => {
      const response = await fetch('/api/admin/emergency-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: action.id,
          adminToken: 'sandra-admin-2025'
        })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency Action Executed",
        description: "Emergency protocols have been activated.",
      });
    }
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Power Actions */}
      <Card className="border border-gray-200">
        <CardHeader>
          <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
            AI Power Actions
          </h3>
          <p className="text-sm text-gray-600">High-impact coordinated agent workflows for major transformations</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            {powerActions.map((action) => (
              <div 
                key={action.id} 
                className={`border p-6 cursor-pointer transition-all ${
                  selectedAction?.id === action.id 
                    ? 'border-black bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAction(action)}
              >
                <div className="space-y-4">
                  {/* Action Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-base">{action.name}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getImpactColor(action.impact)}>
                        {action.impact.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {action.estimatedTime}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Agents Involved */}
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-2">Agents Involved:</div>
                    <div className="flex gap-1 flex-wrap">
                      {action.agents.map((agent) => (
                        <Badge key={agent} className="text-xs bg-blue-100 text-blue-700 capitalize">
                          {agent === 'all' ? 'All Agents' : agent}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-2">Expected Deliverables:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {action.deliverables.slice(0, 4).map((deliverable, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center">
                          <span className="mr-2">•</span>
                          {deliverable}
                        </div>
                      ))}
                      {action.deliverables.length > 4 && (
                        <div className="text-xs text-gray-500 italic">
                          +{action.deliverables.length - 4} more deliverables
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-2">Requirements:</div>
                    <div className="flex gap-2 flex-wrap">
                      {action.requirements.map((req, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedAction && (
            <div className="mt-6 p-6 bg-black text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-base" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Ready to Execute Power Action
                  </h5>
                  <p className="text-sm text-gray-300">
                    {selectedAction.name} • {selectedAction.estimatedTime} • {selectedAction.agents.length === 1 && selectedAction.agents[0] === 'all' ? 'All Agents' : selectedAction.agents.join(', ')}
                  </p>
                </div>
                <Button
                  onClick={() => executePowerAction.mutate(selectedAction)}
                  disabled={isExecuting || executePowerAction.isPending}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  {isExecuting ? 'Executing...' : 'Execute Power Action'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card className="border border-red-200 bg-red-50">
        <CardHeader>
          <h3 className="text-lg font-medium text-red-800" style={{ fontFamily: 'Times New Roman, serif' }}>
            Emergency Actions
          </h3>
          <p className="text-sm text-red-700">Immediate interventions for critical situations</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyActions.map((action) => (
              <div key={action.id} className="bg-white border border-red-200 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-red-800">{action.name}</h4>
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      {action.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-red-700">{action.description}</p>
                  <Button
                    onClick={() => executeEmergencyAction.mutate(action)}
                    disabled={executeEmergencyAction.isPending}
                    size="sm"
                    className="w-full bg-red-600 text-white hover:bg-red-700"
                  >
                    Execute Emergency Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Power Stats */}
      <Card className="border border-gray-200">
        <CardHeader>
          <h3 className="text-lg font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
            AI Power Team Statistics
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 border border-green-200">
              <div className="text-2xl font-bold text-green-600">10</div>
              <div className="text-sm text-green-700">Active Agents</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">4</div>
              <div className="text-sm text-blue-700">Power Actions</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-purple-700">Emergency Protocols</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">0%</div>
              <div className="text-sm text-orange-700">Current Accountability</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}