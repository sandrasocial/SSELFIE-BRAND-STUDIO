import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
// Tabs component removed - creating simple alternative
import { CheckCircle, XCircle, Clock, Eye, Play, Pause } from 'lucide-react';

interface AgentProposal {
  id: string;
  agentId: string;
  agentName: string;
  type: 'email-campaign' | 'landing-page' | 'social-content' | 'ad-campaign' | 'blog-post' | 'design-system';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  preview: {
    content?: string;
    design?: string;
    data?: any;
    mockup?: string;
    explanation?: string;
  };
  impact: {
    estimatedReach?: number;
    estimatedRevenue?: number;
    timeToImplement?: string;
    resources?: string[];
  };
  approval?: {
    approvedAt?: Date;
    feedback?: string;
    modifications?: string[];
  };
}

export default function AgentApprovalDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProposal, setSelectedProposal] = useState<AgentProposal | null>(null);
  const [previewMode, setPreviewMode] = useState<'visual' | 'code' | 'data'>('visual');

  // Fetch pending proposals
  const { data: proposals = [], isLoading } = useQuery<AgentProposal[]>({
    queryKey: ['/api/agent-proposals'],
    queryFn: async () => {
      const response = await apiRequest('/api/agent-proposals', 'GET');
      return await response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Approve proposal mutation
  const approveMutation = useMutation({
    mutationFn: async ({ proposalId, feedback, modifications }: { 
      proposalId: string; 
      feedback?: string; 
      modifications?: string[] 
    }) => {
      const response = await apiRequest('POST', `/api/agent-proposals/${proposalId}/approve`, {
        feedback,
        modifications
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-proposals'] });
      toast({ title: "Proposal Approved", description: "Agent will execute the approved strategy" });
      setSelectedProposal(null);
    }
  });

  // Reject proposal mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ proposalId, feedback }: { proposalId: string; feedback: string }) => {
      const response = await apiRequest('POST', `/api/agent-proposals/${proposalId}/reject`, {
        feedback
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-proposals'] });
      toast({ title: "Proposal Rejected", description: "Agent will revise the strategy" });
      setSelectedProposal(null);
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'executing': return <Play className="h-4 w-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-700" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPreview = (proposal: AgentProposal) => {
    const { preview } = proposal;
    
    switch (previewMode) {
      case 'visual':
        return (
          <div className="space-y-6">
            {/* Visual Preview */}
            {preview.mockup && (
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Visual Mockup</h4>
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <div dangerouslySetInnerHTML={{ __html: preview.mockup }} />
                </div>
              </div>
            )}
            
            {/* Content Preview */}
            {preview.content && (
              <div className="space-y-4">
                <h4 className="font-medium">Content Preview</h4>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: preview.content }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'code':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Implementation Code</h4>
            <pre className="bg-black text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{preview.design || 'No code preview available'}</code>
            </pre>
          </div>
        );
        
      case 'data':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Data Structure</h4>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{JSON.stringify(preview.data, null, 2)}</code>
            </pre>
          </div>
        );
        
      default:
        return <div>Select a preview mode</div>;
    }
  };

  if (!isAuthenticated || user?.email !== 'ssa@ssasocial.com') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="font-serif text-4xl font-light mb-2">Agent Approval Center</h1>
          <p className="text-gray-600">Review and approve AI agent proposals before execution</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Proposals List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-light">Pending Approvals</h2>
              <Badge variant="outline">{proposals.filter(p => p.status === 'pending').length} pending</Badge>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {proposals.map((proposal) => (
                <Card 
                  key={proposal.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProposal?.id === proposal.id ? 'ring-2 ring-black' : ''
                  }`}
                  onClick={() => setSelectedProposal(proposal)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(proposal.status)}
                        <span className="font-medium text-sm">{proposal.agentName}</span>
                      </div>
                      <Badge className={getPriorityColor(proposal.priority)}>
                        {proposal.priority}
                      </Badge>
                    </div>
                    <h3 className="font-medium mb-1">{proposal.title}</h3>
                    <p className="text-sm text-gray-600">{proposal.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {proposal.impact.estimatedRevenue && (
                        <span>Est. Revenue: €{proposal.impact.estimatedRevenue}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            {selectedProposal ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(selectedProposal.status)}
                        {selectedProposal.title}
                      </CardTitle>
                      <CardDescription>
                        By {selectedProposal.agentName} • {selectedProposal.type}
                      </CardDescription>
                    </div>
                    <Badge className={getPriorityColor(selectedProposal.priority)}>
                      {selectedProposal.priority}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Agent Explanation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Agent Explanation</h4>
                    <p className="text-blue-800">{selectedProposal.preview.explanation}</p>
                  </div>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedProposal.impact.estimatedReach && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-light">{selectedProposal.impact.estimatedReach.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Est. Reach</div>
                      </div>
                    )}
                    {selectedProposal.impact.estimatedRevenue && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-light">€{selectedProposal.impact.estimatedRevenue}</div>
                        <div className="text-xs text-gray-600">Est. Revenue</div>
                      </div>
                    )}
                    {selectedProposal.impact.timeToImplement && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-light">{selectedProposal.impact.timeToImplement}</div>
                        <div className="text-xs text-gray-600">Time to Deploy</div>
                      </div>
                    )}
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-light">{selectedProposal.agentName}</div>
                      <div className="text-xs text-gray-600">Responsible Agent</div>
                    </div>
                  </div>

                  {/* Preview Tabs */}
                  <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as any)}>
                    <TabsList>
                      <TabsTrigger value="visual">Visual Preview</TabsTrigger>
                      <TabsTrigger value="code">Code View</TabsTrigger>
                      <TabsTrigger value="data">Data Structure</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={previewMode} className="mt-4">
                      {renderPreview(selectedProposal)}
                    </TabsContent>
                  </Tabs>

                  {/* Approval Actions */}
                  {selectedProposal.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t">
                      <Button 
                        onClick={() => approveMutation.mutate({ proposalId: selectedProposal.id })}
                        disabled={approveMutation.isPending}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Execute
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => rejectMutation.mutate({ 
                          proposalId: selectedProposal.id, 
                          feedback: 'Please revise this proposal' 
                        })}
                        disabled={rejectMutation.isPending}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Request Revision
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a proposal to preview</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}